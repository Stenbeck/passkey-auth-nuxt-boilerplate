import jwt from 'jsonwebtoken'
import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { readBody, getCookie, setCookie, getHeader } from '#imports'
import User from '../../../models/User'
import LoginLog from '../../../models/LoginLog'

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig()

	// Require authenticated session (JWT in cookie)
	const token = getCookie(event, 'token')
	if (!token) {
		return { success: false, message: 'Not authenticated' }
	}

	let payload
	try {
		payload = jwt.verify(token, config.loginTokenSecret)
	} catch {
		return { success: false, message: 'Invalid session' }
	}

	// Read client response
	const body = await readBody(event)
	const { credential, deviceName } = body || {}
	if (!credential) {
		return { success: false, message: 'Missing credential response' }
	}
	// Extract expected challenge from cookie
	const expectedChallenge = getCookie(event, 'add_challenge')
	// Clear challenge cookie
	setCookie(event, 'add_challenge', '', { maxAge: 0, path: '/' })

	if (!expectedChallenge) {
		return { success: false, message: 'No add-passkey challenge found' }
	}

	let verification
	try {
		verification = await verifyRegistrationResponse({
			response: credential,
			expectedChallenge,
			expectedOrigin: config.rpOrigin,
			expectedRPID: config.rpId,
		})
	} catch (e) {
		console.error('Add-passkey verification error:', e)
		return { success: false, message: 'Registration verification failed' }
	}

	if (!verification?.verified) {
		return { success: false, message: 'Registration not verified' }
	}

	// Append credential to the authenticated user
	const user = await User.findById(payload.id)
	if (!user) return { success: false, message: 'User not found' }
	if (!user.verified) return { success: false, message: 'User not verified' }

	user.credentials.push({
		id: verification.registrationInfo.credential.id.toString('base64url'),
		publicKey: Buffer.from(verification.registrationInfo.credential.publicKey).toString('base64url'),
		counter: verification.registrationInfo.credential.counter,
		challenge: null,
		deviceName: deviceName.deviceName || null,
		transports: credential?.transports || [],
	})

	try {
		await user.save()
	} catch (e) {
		console.error('Failed to save new credential:', e)
		return { success: false, message: 'Failed to save credential' }
	}

	// Non-blocking log entry
	try {
		await LoginLog.create({
			userId: user._id,
			method: 'passkey_add',
			ip: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || '',
			userAgent: getHeader(event, 'user-agent') || '',
			device: deviceName.deviceName || 'Unknown device',
		})
	} catch (e) {
		console.warn('LoginLog create failed (non-blocking):', e)
	}

	return { success: true }
})
