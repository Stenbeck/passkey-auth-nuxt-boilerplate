import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import { readBody } from '#imports'
import { useStorage } from '#internal/nitro'
import { connectDB } from '../../utils/db'
import User from '../../models/User'

export default defineEventHandler(async (event) => {
	await connectDB()
	const config = useRuntimeConfig()

	const body = await readBody(event)
	const { email } = body

	const storage = useStorage()
	// Throttle failed login attempts using in-memory storage
	const failureKey = `failures:${email}`
	const failureEntry = (await storage.getItem(failureKey)) || { count: 0, firstAttempt: Date.now() }

	// Block login attempts after 3 failures within 10 minutes
	if (failureEntry.count >= 3 && Date.now() - failureEntry.firstAttempt < 10 * 60 * 1000) {
		return { success: false, message: 'Too many failed login attempts' }
	}

	try {
		// If user not found or not verified, increment failure counter and return error
		const user = await User.findOne({ email })
		if (!user || !user.verified) {
			const updatedEntry = {
				count: failureEntry.count + 1,
				firstAttempt: failureEntry.firstAttempt || Date.now(),
			}
			await storage.setItem(failureKey, updatedEntry, { ttl: 600 }) // 10 minutes
			return { success: false, message: 'User not found or not verified' }
		}

		// Generate login token with short expiry and create login URL
		const token = jwt.sign({ id: user._id }, config.loginTokenSecret, { expiresIn: '15m' })
		const loginUrl = `${config.baseUrl}/auth/callback?token=${token}`

		// Configure SMTP transporter
		const transporter = nodemailer.createTransport({
			host: config.smtpHost,
			port: Number(config.smtpPort),
			secure: true,
			auth: {
				user: config.smtpUser,
				pass: config.smtpPass,
			},
		})

		// Send magic login link via email
		await transporter.sendMail({
			from: `"${config.mailFrom}" <${config.smtpUser}>`,
			to: email,
			subject: 'Your login link',
			text: `Click to login: ${loginUrl}`,
			html: `Click to login: <a href="${loginUrl}">Login</a>`,
		})

		return { success: true }
	} catch (err) {
		console.error('Login link error:', err)
		return { success: false, message: 'Failed to send login link' }
	}
})
