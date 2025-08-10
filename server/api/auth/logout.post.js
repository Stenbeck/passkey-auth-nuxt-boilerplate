// server/api/auth/logout.post.js
export default defineEventHandler((event) => {
	// Overwrite cookie with past expiry; attributes MUST match how it was set to work in Safari
	setCookie(event, 'token', '', {
		httpOnly: true,
		sameSite: 'lax',
		path: '/',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 0,
		expires: new Date(0),
	})

	return { success: true }
})
