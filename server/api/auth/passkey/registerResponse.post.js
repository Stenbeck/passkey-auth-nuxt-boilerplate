import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import { connectDB } from '../../../utils/db'
import { readBody, getCookie } from '#imports'
import User from '../../../models/User'
import { verifyRegistrationResponse } from '@simplewebauthn/server'

export default defineEventHandler(async (event) => {
	await connectDB()
	const config = useRuntimeConfig()

	// Extract body and required cookie
	const body = await readBody(event)
	const { credential, email, firstName, lastName } = body

	const expectedChallenge = getCookie(event, 'reg_challenge')

	if (!expectedChallenge) {
		throw createError({ statusCode: 400, statusMessage: 'No registration challenge found' })
	}

	// Verify the registration response using WebAuthn
	let verification
	try {
		verification = await verifyRegistrationResponse({
			response: {
				id: credential.id,
				rawId: credential.rawId,
				response: {
					clientDataJSON: credential.response.clientDataJSON,
					attestationObject: credential.response.attestationObject,
				},
				type: credential.type,
				clientExtensionResults: credential.clientExtensionResults || {},
			},
			expectedChallenge,
			expectedOrigin: config.rpOrigin,
			expectedRPID: config.rpId,
		})
	} catch (e) {
		console.error('Verification error:', e)
		throw createError({ statusCode: 400, statusMessage: 'Registration verification failed', data: e.message })
	}

	if (!verification.verified) {
		throw createError({ statusCode: 400, statusMessage: 'Registration not verified' })
	}

	// Create new user or update existing user with credential info
	let user
	try {
		user = await User.findOne({ email })
		if (!user) {
			user = new User({
				firstName,
				lastName,
				email,
				credential: {
					id: verification.registrationInfo.credential.id.toString('base64url'),
					publicKey: Buffer.from(verification.registrationInfo.credential.publicKey).toString('base64url'),
					counter: verification.registrationInfo.credential.counter,
				},
			})
		} else {
			user.credential = {
				id: verification.registrationInfo.credential.id.toString('base64url'),
				publicKey: Buffer.from(verification.registrationInfo.credential.publicKey).toString('base64url'),
				counter: verification.registrationInfo.credential.counter,
			}
		}
		await user.save()
		// Create JWT token for verification email link
		const token = jwt.sign({ email: user.email }, config.emailVerificationSecret, { expiresIn: '15m' })
		const verifyUrl = `${config.baseUrl}/auth/verify-email?token=${token}`
		// Send verification email with nodemailer
		const transporter = nodemailer.createTransport({
			host: config.smtpHost,
			port: Number(config.smtpPort),
			secure: true,
			auth: {
				user: config.smtpUser,
				pass: config.smtpPass,
			},
		})

		await transporter.sendMail({
			from: `"${config.mailFrom}" <${config.smtpUser}>`,
			to: user.email,
			subject: 'Passkey: Verify your email address',
			html: `
				<p>Hi ${user.firstName},</p>
				<p>Please verify your email by clicking the link below:</p>
				<p><a href="${verifyUrl}">Verify Email</a></p>
				<p>This link will expire in 15 minutes.</p>
			`,
		})
	} catch (e) {
		console.error('User DB error:', e)
		throw createError({ statusCode: 500, statusMessage: 'User registration failed' })
	}

	return { success: true }
})
