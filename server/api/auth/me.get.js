import jwt from 'jsonwebtoken'
import { connectDB } from '../../utils/db'
import { getCookie } from '#imports'
import User from '../../models/User'

export default defineEventHandler(async (event) => {
	await connectDB()
	const config = useRuntimeConfig()

	// Retrieve the token from cookies
	const token = getCookie(event, 'token')
	if (!token) return null

	try {
		// Decode and verify the JWT token
		const decoded = jwt.verify(token, config.loginTokenSecret)
		if (!decoded?.id) return null

		// Look up the user by ID from the token payload
		const user = await User.findById(decoded.id).lean()
		if (!user) return null

		return { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email }
	} catch {
		return null
	}
})
