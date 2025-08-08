import jwt from 'jsonwebtoken'
import { getQuery, setCookie, getRequestIP, getHeader } from '#imports'
import { connectDB } from '../../utils/db'
import User from '../../models/User'
import LoginLog from '../../models/LoginLog'

export default defineEventHandler(async (event) => {
	await connectDB()
	const config = useRuntimeConfig()

	// Extract the token from the query string
	const { token } = getQuery(event)
	if (!token) throw createError({ statusCode: 400, statusMessage: 'Missing token' })

	// Verify the token and decode the payload
	let payload
	try {
		payload = jwt.verify(token, config.loginTokenSecret)
	} catch {
		throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token' })
	}

	const user = await User.findById(payload.id)
	if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })

	// Issue a new JWT token and set it as a cookie
	const newToken = jwt.sign({ id: user._id }, config.loginTokenSecret, { expiresIn: '7d' })

	setCookie(event, 'token', newToken, {
		httpOnly: true,
		sameSite: 'lax',
		path: '/',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 60 * 60 * 24 * 7, // 7 days
	})

	// Log the login event with IP, user-agent, and method
	await LoginLog.create({
		userId: user._id,
		ip: getRequestIP(event),
		userAgent: getHeader(event, 'user-agent'),
		method: 'magiclink',
	})

	return { success: true, user: { id: user._id, username: user.username, firstName: user.firstName } }
})
