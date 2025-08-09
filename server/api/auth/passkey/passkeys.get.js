import User from '../../../models/User'

export default defineEventHandler(async (event) => {
	const authUser = event.context.user

	if (!authUser) return { success: false, message: 'Not authenticated' }

	try {
		const user = await User.findById(authUser._id).select('credentials').lean()
		if (!user) return { success: false, message: 'User not found' }

		const passkeys = (user.credentials || []).map((c) => ({
			id: c.id,
			deviceName: c.deviceName || null,
			createdAt: c.createdAt || null,
		}))

		return { success: true, passkeys }
	} catch (e) {
		return { success: false, message: 'Failed to fetch passkeys' }
	}
})
