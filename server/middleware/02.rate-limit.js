const ipStore = new Map()

export default defineEventHandler((event) => {
	// Only enforce in production
	if (process.env.NODE_ENV !== 'production') return

	const path = event.path || ''

	// Page routes to protect (SSR pages)
	const PAGE_PATHS = ['/', '/auth/callback', '/auth/verify-email']

	// API routes to protect (server endpoints)
	const API_PATHS = [
		'/api/auth/passkey/registerRequest',
		'/api/auth/passkey/registerResponse',
		'/api/auth/passkey/loginRequest',
		'/api/auth/passkey/loginResponse',
		'/api/auth/passkey/requestLoginLink',
		'/api/auth/verifyEmail',
		'/api/auth/verifyLoginLink',
		'/api/auth/userExists',
	]

	// Match pages by exact path; match APIs by exact path (change to prefix if desired)
	const isLimitedPage = PAGE_PATHS.includes(path)
	const isLimitedApi = API_PATHS.includes(path)
	if (!isLimitedPage && !isLimitedApi) return

	const ip = getRequestIP(event) || 'unknown'
	const now = Date.now()

	// Config
	const windowMs = 60_000 // 1 minute
	const maxRequests = 20 // 20 requests per window per IP

	const entry = ipStore.get(ip) || { count: 0, firstRequestTime: now }

	// Reset window if expired
	if (now - entry.firstRequestTime > windowMs) {
		entry.count = 0
		entry.firstRequestTime = now
	}

	entry.count++
	ipStore.set(ip, entry)

	if (entry.count > maxRequests) {
		// Too Many Requests
		event.node.res.statusCode = 429
		return {
			statusCode: 429,
			message: 'Too many requests – try again later.',
		}
	}
})
