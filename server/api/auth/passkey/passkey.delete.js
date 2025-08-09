import { readBody, getRequestIP, getHeader } from '#imports'
import User from '../../../models/User'
import LoginLog from '../../../models/LoginLog'

export default defineEventHandler(async (event) => {
	const authUser = event.context.user

	const body = await readBody(event)
	const id = body.id

	if (!id) {
		return { success: false, message: 'Missing passkey id' }
	}

	try {
		// Load user and find the credential to remove (to capture deviceName for logging)
		const user = await User.findById(authUser._id)
		if (!user) {
			return { success: false, message: 'User not found' }
		}

		const cred = (user.credentials || []).find((c) => c.id === id)
		if (!cred) {
			return { success: false, message: 'Passkey not found' }
		}

		// Remove the credential from the user's credentials array
		user.credentials = user.credentials.filter((c) => c.id !== id)
		await user.save()

		try {
			await LoginLog.create({
				userId: authUser._id,
				method: 'passkey_remove',
				ip: getRequestIP(event) || '',
				userAgent: getHeader(event, 'user-agent') || '',
				device: cred.deviceName || 'Unknown device',
			})
		} catch {}

		return { success: true }
	} catch (e) {
		if (process.dev) console.error('passkey.delete error:', e)
		return { success: false, message: 'Failed to delete passkey' }
	}
})
