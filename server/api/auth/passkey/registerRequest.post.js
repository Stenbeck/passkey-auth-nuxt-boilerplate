import { generateRegistrationOptions } from '@simplewebauthn/server'

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig()
	const body = await readBody(event)
	const { firstName, lastName, email } = body

	if (
		!firstName ||
		typeof firstName !== 'string' ||
		!firstName.trim() ||
		!lastName ||
		typeof lastName !== 'string' ||
		!lastName.trim() ||
		!email ||
		typeof email !== 'string' ||
		!email.trim()
	) {
		throw createError({ statusCode: 400, message: 'Missing or invalid user information' })
	}

	let options
	try {
		// Generate registration options using WebAuthn server library
		options = await generateRegistrationOptions({
			rpName: config.rpName,
			rpID: config.rpId,
			user: {
				id: Buffer.from(email, 'utf8'),
				name: firstName,
				displayName: firstName,
			},
			attestationType: 'indirect',
			authenticatorSelection: {
				userVerification: 'preferred',
			},
		})
	} catch (err) {
		console.error('Failed to generate registration options:', err)
		throw createError({ statusCode: 500, message: 'Failed to generate registration options' })
	}

	// Ensure the challenge was generated
	if (!options.challenge) {
		throw createError({ statusCode: 500, message: 'Challenge was not generated' })
	}

	// Store challenge in HTTP-only cookie for later verification
	const challengeBase64Url = options.challenge.toString('base64url')

	setCookie(event, 'reg_challenge', challengeBase64Url, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: 300, // 5 minutes
	})
	event.context.registrationChallenge = options.challenge

	// Convert options to base64url format for safe transfer to the client
	const base64Options = {
		...options,
		challenge: challengeBase64Url,
		user: {
			id: options.user.id.toString('base64url'),
			name: firstName,
			displayName: firstName,
		},
		excludeCredentials:
			options.excludeCredentials?.map((cred) => ({
				...cred,
				id: Buffer.from(cred.id).toString('base64url'),
			})) || [],
	}

	return base64Options
})
