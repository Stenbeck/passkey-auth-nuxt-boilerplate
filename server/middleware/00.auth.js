import jwt from 'jsonwebtoken'
import { getCookie, setCookie } from '#imports'
import User from '../models/User'

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig()

	const isProd = process.env.NODE_ENV === 'production'
	const cookieName = isProd ? '__Host-token' : 'token'
	const token = getCookie(event, cookieName)

	if (!token) {
		event.context.auth = { status: 'no_token' }
		return
	}

	try {
		const payload = jwt.verify(token, config.loginTokenSecret)
		const user = await User.findById(payload.id).select('_id email firstName lastName verified')
		if (!user) {
			// if token points to user that does not exist, clear cookie
			console.log('No user, clear cookie')

			setCookie(event, cookieName, '', {
				httpOnly: true,
				sameSite: 'lax',
				path: '/',
				secure: isProd,
				maxAge: 0,
				expires: new Date(0),
			})
			event.context.auth = { status: 'user_missing' }
			return
		}

		event.context.user = user
		event.context.auth = { status: 'ok' }
	} catch (e) {
		// Not valid or expired token, clear cookie
		setCookie(event, cookieName, '', {
			httpOnly: true,
			sameSite: 'lax',
			path: '/',
			secure: isProd,
			maxAge: 0,
			expires: new Date(0),
		})
		const status = e?.name === 'TokenExpiredError' ? 'expired' : 'invalid'
		event.context.auth = { status }
	}
})
