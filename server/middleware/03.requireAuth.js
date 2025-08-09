export default defineEventHandler((event) => {
	const p = event.path || ''
	// Allow public endpoints
	const publicPaths = [
		'/api/auth/passkey/registerRequest',
		'/api/auth/passkey/registerResponse',
		'/api/auth/passkey/loginRequest',
		'/api/auth/passkey/loginResponse',
		'/api/auth/passkey/requestLoginLink',
		'/api/auth/verifyEmail',
		'/api/auth/verifyLoginLink',
		'/api/auth/userExists',
	]
	if (publicPaths.some((pub) => p.startsWith(pub))) return

	// Protect rest of the internal API

	if (p.startsWith('/api/')) {
		if (!event.context?.user) {
			setResponseStatus(event, 401)
			return { success: false, message: 'Not authenticated' }
		}
	}
})
