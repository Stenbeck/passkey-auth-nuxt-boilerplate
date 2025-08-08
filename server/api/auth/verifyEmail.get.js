import jwt from 'jsonwebtoken'
import { getQuery, setCookie, getRequestIP, getHeader } from '#imports'
import { connectDB } from '../../utils/db'
import User from '../../models/User'
import LoginLog from '../../models/LoginLog'

export default defineEventHandler(async (event) => {
	await connectDB()
	const config = useRuntimeConfig()
	try {
		const { token } = getQuery(event)

		if (!token) {
			return { success: false, message: 'Missing verification token' }
		}

		// Verify token
		const decoded = jwt.verify(token, config.emailVerificationSecret)

		// Lookup user by email from decoded token
		const user = await User.findOne({ email: decoded.email })

		if (!user) {
			return { success: false, message: 'User not found' }
		}

		if (user.verified) {
			return { success: true, message: 'User already verified' }
		}

		// Update user
		user.verified = true
		await user.save()

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
			method: 'verifyemail',
		})

		return {
			success: true,
			user: { id: user._id, username: user.username, firstName: user.firstName },
			message: 'Email successfully verified',
		}
	} catch (err) {
		if (err.name === 'TokenExpiredError') {
			return { success: false, message: 'Link has expired' }
		}

		if (err.name === 'JsonWebTokenError') {
			return { success: false, message: 'Invalid link' }
		}

		console.error('Unexpected verification error:', err)
		return { success: false, message: 'Verification failed' }
	}
})
