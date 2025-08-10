export default defineEventHandler((event) => {
	const isProd = process.env.NODE_ENV === 'production'
	const cookieName = isProd ? '__Host-token' : 'token'

	setCookie(event, cookieName, '', {
		httpOnly: true,
		sameSite: 'lax',
		path: '/',
		secure: isProd,
		maxAge: 0,
		expires: new Date(0),
	})

	return { success: true }
})
