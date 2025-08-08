import { getQuery } from '#imports'
import { connectDB } from '../../utils/db'
import User from '../../models/User'

export default defineEventHandler(async (event) => {
	await connectDB()

	try {
		const { email } = getQuery(event)
		if (!email) {
			return { success: false, message: 'Missing email parameter' }
		}

		const user = await User.findOne({ email })

		// If the user exists and is not verified, check if it is older than 15 minutes and delete if so
		// This is to prevent unverified users from lingering indefinitely
		if (user && !user.verified) {
			const isExpired = Date.now() - new Date(user.createdAt).getTime() > 15 * 60 * 1000
			if (isExpired) {
				await User.deleteOne({ email })
				return {
					success: false,
					message: 'Unverified user removed due to expiration',
				}
			}
		}

		return {
			success: !!user,
		}
	} catch (err) {
		console.error('Error in userExists:', err)
		return {
			success: false,
			message: 'Internal server error',
		}
	}
})
