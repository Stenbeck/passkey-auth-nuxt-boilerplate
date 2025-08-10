import jwt from 'jsonwebtoken'
import { getCookie, setCookie } from '#imports'
import User from '../models/User'

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig()

	const token = getCookie(event, 'token')
	// TEMP: minimal debug
	console.log('[00.auth] hasToken=', !!token, 'path=', event.path, 'ua=', getHeader(event, 'user-agent'))

	if (!token) {
		event.context.auth = { status: 'no_token' }
		return
	}

	try {
		const payload = jwt.verify(token, config.loginTokenSecret)
		const user = await User.findById(payload.id).select('_id email firstName lastName verified')
		if (!user) {
			// if token points to user that does not exist, clear cookie
			setCookie(event, 'token', '', { maxAge: 0, path: '/' })
			event.context.auth = { status: 'user_missing' }
			return
		}
		event.context.user = user
		event.context.auth = { status: 'ok' }
	} catch (e) {
		// Not valid or expired token, clear cookie
		setCookie(event, 'token', '', { maxAge: 0, path: '/' })
		const status = e?.name === 'TokenExpiredError' ? 'expired' : 'invalid'
		event.context.auth = { status }
	}
})
