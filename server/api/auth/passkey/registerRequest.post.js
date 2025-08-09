import { generateRegistrationOptions } from '@simplewebauthn/server'

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig()
	const body = await readBody(event)
	const { email } = body

	let options
	try {
		// Generate registration options using WebAuthn server library
		// TODO Potentially flatten the user object to follow the spec more closely
		options = await generateRegistrationOptions({
			rpName: config.rpName,
			rpID: config.rpId,
			userID: Buffer.from(email, 'utf8'),
			userName: email,
			userDisplayName: email, // as seen in authenticator layover
			attestationType: 'indirect',
			authenticatorSelection: {
				userVerification: 'preferred',
			},
		})
	} catch (err) {
		console.error('Failed to generate registration options:', err)
		return { success: false, message: 'Failed to generate registration options' }
	}

	// Ensure the challenge was generated
	if (!options.challenge) {
		return { success: false, message: 'Challenge was not generated' }
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
			name: email,
			displayName: email,
		},
		excludeCredentials:
			options.excludeCredentials?.map((cred) => ({
				...cred,
				id: Buffer.from(cred.id).toString('base64url'),
			})) || [],
	}

	return { success: true, options: base64Options }
})
