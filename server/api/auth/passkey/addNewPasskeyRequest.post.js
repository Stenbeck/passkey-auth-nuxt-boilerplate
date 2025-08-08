import jwt from 'jsonwebtoken'
import { connectDB } from '../../../utils/db'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import User from '../../../models/User'
import { getCookie, setCookie } from '#imports'

export default defineEventHandler(async (event) => {
	await connectDB()
	const config = useRuntimeConfig()
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

	const user = await User.findById(payload.id)
	if (!user) return { success: false, message: 'User not found' }
	if (!user.verified) return { success: false, message: 'User not verified' }

	// Build excludeCredentials as base64url strings (expected by simplewebauthn)
	const excludeCredentials = user.credentials.map((c) => ({ id: c.id, type: 'public-key' }))

	let options
	try {
		options = await generateRegistrationOptions({
			rpName: config.rpName,
			rpID: config.rpId,
			userID: Buffer.from(user._id.toString(), 'utf8'),
			userName: user.email,
			userDisplayName: user.email, // as seen in authenticator layover
			attestationType: 'none',
			authenticatorSelection: {
				residentKey: 'preferred',
				requireResidentKey: false,
			},
			excludeCredentials,
		})
	} catch (e) {
		console.error('Failed to generate add-passkey options:', e)
		return { success: false, message: 'Failed to generate options' }
	}

	// Convert binary fields to base64url for client + cookie (align with registerRequest)
	const challengeB64 = options.challenge.toString('base64url')

	const base64Options = {
		...options,
		challenge: challengeB64,
		user: {
			// options.user.id is a Buffer; send as base64url
			id: options.user.id.toString('base64url'),
			name: user.email,
			displayName: user.email, // same as you prefer to show in authenticator UI
		},
		excludeCredentials: Array.isArray(options.excludeCredentials)
			? options.excludeCredentials.map((cred) => ({
					...cred,
					id: Buffer.from(cred.id).toString('base64url'),
			  }))
			: [],
	}

	// Persist challenge in a separate cookie for this flow
	setCookie(event, 'add_challenge', challengeB64, {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		path: '/',
		maxAge: 600, // 10 minutes
	})

	return { success: true, options: base64Options }
})
