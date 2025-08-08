import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { connectDB } from '../../../utils/db'
import User from '../../../models/User'

export default defineEventHandler(async (event) => {
	await connectDB()
	const config = useRuntimeConfig()

	const body = await readBody(event)
	const email = body.email?.email

	let user
	try {
		user = email ? await User.findOne({ email }).lean() : null

		if (!user) {
			return { success: false, message: 'User not found' }
		}
		if (!user.verified) {
			return { success: false, message: 'User not verified' }
		}
		if (!user.credentials || user.credentials.length === 0) {
			return { success: false, message: 'No credential registered' }
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
