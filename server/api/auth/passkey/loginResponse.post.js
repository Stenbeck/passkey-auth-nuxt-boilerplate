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
	const user = await User.findOne({ 'credentials.id': body.rawId })
	if (!user) {
		return { success: false, message: 'User not found' }
	}

	const cred = user.credentials.find((c) => c.id === body.rawId)
	if (!cred) {
		return { success: false, message: 'Credential not found for user' }
	}

	// Retrieve the expected challenge from user's stored credential
	const expectedChallenge = cred.challenge
	if (!expectedChallenge || typeof expectedChallenge !== 'string') {
		return { success: false, message: 'Missing or invalid login challenge' }
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
				id: cred.id,
				publicKey: Buffer.from(cred.publicKey, 'base64url'),
				counter: cred.counter,
			},
		})
	} catch (e) {
		console.log('Verification error:', e)
		return { success: false, message: 'Authentication verification failed' }
	}

	// Check if the authentication was successfully verified
	if (!verification.verified) {
		return { success: false, message: 'Authentication not verified' }
	}

	try {
		// Clear the used challenge (counter often stays 0 on multi-device passkeys; we ignore it)
		cred.challenge = null
		user.markModified('credentials')
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

		return {
			success: true,
			user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email },
		}
	} catch (e) {
		console.error('Login finalization error:', e)
		return { success: false, message: 'Login finalization failed' }
	}
})
