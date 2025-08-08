import { connectDB } from '../../../utils/db'
import { setCookie, readBody, getRequestIP, getHeader } from '#imports'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import jwt from 'jsonwebtoken'
import User from '../../../models/User'
import LoginLog from '../../../models/LoginLog'

export default defineEventHandler(async (event) => {
	await connectDB()
	const config = useRuntimeConfig()

	const body = await readBody(event)

	// Find user by credential ID
	const user = await User.findOne({ 'credential.id': body.rawId })
	if (!user) {
		throw createError({ statusCode: 400, statusMessage: 'User not found' })
	}

	// Retrieve the expected challenge from user's stored credential
	const expectedChallenge = user.credential.challenge
	if (!expectedChallenge || typeof expectedChallenge !== 'string') {
		throw createError({ statusCode: 400, statusMessage: 'Missing or invalid login challenge' })
	}

	// Verify the authentication response using SimpleWebAuthn server
	let verification
	try {
		verification = await verifyAuthenticationResponse({
			response: body,
			expectedChallenge,
			expectedOrigin: config.rpOrigin,
			expectedRPID: config.rpId,
			credential: {
				id: user.credential.id,
				publicKey: Buffer.from(user.credential.publicKey, 'base64url'),
				counter: user.credential.counter,
			},
		})
	} catch (e) {
		console.log('Verification error:', e)
		throw createError({ statusCode: 400, statusMessage: 'Authentication verification failed' })
	}

	// Check if the authentication was successfully verified
	if (!verification.verified) {
		throw createError({ statusCode: 400, statusMessage: 'Authentication not verified' })
	}

	try {
		// Update credential counter to prevent replay attacks
		user.credential.counter = verification.authenticationInfo.newCounter
		await user.save()

		// Log successful login attempt
		await LoginLog.create({
			userId: user._id,
			ip: getRequestIP(event),
			userAgent: getHeader(event, 'user-agent'),
			method: 'passkey',
		})

		// Generate JWT token for authenticated user
		const token = jwt.sign({ id: user._id }, config.loginTokenSecret, { expiresIn: '7d' })

		// Set the token as an HTTP-only cookie
		setCookie(event, 'token', token, {
			httpOnly: true,
			sameSite: 'lax',
			path: '/',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 * 7, // 7 days
		})

		return { user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email } }
	} catch (e) {
		console.error('Login finalization error:', e)
		throw createError({ statusCode: 500, statusMessage: 'Login finalization failed' })
	}
})
