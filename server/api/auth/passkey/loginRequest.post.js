import { generateAuthenticationOptions } from '@simplewebauthn/server'
import User from '../../../models/User'

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig()

	const body = await readBody(event)
	const email = body.email?.email

	let user
	try {
		user = email ? await User.findOne({ email }).lean() : null

		if (!user || !Array.isArray(user.credentials) || user.credentials.length === 0) {
			// returnera samma neutrala svar
			return {
				success: true,
				options: await generateAuthenticationOptions({
					rpID: config.rpId,
					userVerification: 'preferred',
					allowCredentials: [], // låt browser faila snyggt
				}),
			}
		}
	} catch (e) {
		console.error('User validation failed:', e)
		throw e
	}

	let options
	try {
		if (!email) {
			return { success: false, message: 'Missing email' }
		}

		options = await generateAuthenticationOptions({
			rpName: config.rpName,
			rpID: config.rpId,
			allowCredentials: user.credentials.map((c) => ({
				id: c.id,
				type: 'public-key',
			})),
			timeout: 60000,
			userVerification: 'preferred',
			extensions: undefined,
		})

		// Store the generated challenge on the user for later verification
		try {
			await User.updateOne({ email }, { $set: { 'credentials.$[].challenge': options.challenge } })
		} catch (e) {
			console.error('Failed to update user challenge:', e)
			return { success: false, message: 'Failed to update challenge' }
		}
	} catch (e) {
		console.error('Failed to generate authentication options:', e)
		return { success: false, message: 'Failed to generate authentication options' }
	}

	return options
})
