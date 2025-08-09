import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import { readBody, getCookie, setCookie } from '#imports'
import User from '../../../models/User'
import { verifyRegistrationResponse } from '@simplewebauthn/server'

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig()

	// Extract body and required cookie
	const body = await readBody(event)
	const { credential, email, firstName, lastName } = body

	const expectedChallenge = getCookie(event, 'reg_challenge')
	setCookie(event, 'reg_challenge', '', { maxAge: 0, path: '/' })

	if (!expectedChallenge) {
		return { success: false, message: 'No registration challenge found' }
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
		return { success: false, message: 'Registration verification failed' }
	}

	if (!verification.verified) {
		return { success: false, message: 'Registration not verified' }
	}

	// Create new user or update existing user with credential info
	let user
	try {
		user = await User.findOne({ email })
		if (user && user.verified) {
			return { success: false, message: 'User already verified' }
		}
		if (!user) {
			user = new User({
				firstName,
				lastName,
				email,
				credentials: [
					{
						id: verification.registrationInfo.credential.id.toString('base64url'),
						publicKey: Buffer.from(verification.registrationInfo.credential.publicKey).toString('base64url'),
						counter: verification.registrationInfo.credential.counter,
						transports: verification.registrationInfo.credential.transports || [],
					},
				],
			})
		} else {
			user.credentials.push({
				id: verification.registrationInfo.credential.id.toString('base64url'),
				publicKey: Buffer.from(verification.registrationInfo.credential.publicKey).toString('base64url'),
				counter: verification.registrationInfo.credential.counter,
				transports: verification.registrationInfo.credential.transports || [],
			})
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
		return { success: false, message: 'User registration failed' }
	}

	return { success: true }
})
