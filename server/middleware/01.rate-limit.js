const ipStore = new Map()

export default defineEventHandler((event) => {
	if (process.env.NODE_ENV !== 'production') return

	const path = event.path
	if (path !== '/' && path !== '/auth/callback' && path !== '/auth/verify-email') return

	const ip = getRequestIP(event) || 'unknown'
	const now = Date.now()
	const windowMs = 60_000 // 1 minute
	const maxRequests = 5

	const entry = ipStore.get(ip) || { count: 0, firstRequestTime: now }

	// Reset if window expired
	if (now - entry.firstRequestTime > windowMs) {
		entry.count = 0
		entry.firstRequestTime = now
	}

	entry.count++
	ipStore.set(ip, entry)

	if (entry.count > maxRequests) {
		event.node.res.statusCode = 429
		return {
			statusCode: 429,
			message: 'Too many requests – try again later.',
		}
	}
})
