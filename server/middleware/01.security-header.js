export default defineEventHandler((event) => {
	setHeader(event, 'X-Frame-Options', 'DENY')
	// Protects against clickjacking by disallowing iframe embedding

	setHeader(event, 'X-Content-Type-Options', 'nosniff')
	// Prevents MIME-type sniffing, reducing XSS risk

	setHeader(event, 'Referrer-Policy', 'no-referrer')
	// Hides referrer URLs for better privacy

	setHeader(event, 'Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
	// Disables access to browser features unless explicitly allowed

	setHeader(event, 'X-DNS-Prefetch-Control', 'off')
	// Disables DNS prefetching to reduce metadata leakage

	setHeader(event, 'X-Permitted-Cross-Domain-Policies', 'none')
	// Blocks legacy plugins like Flash from making cross-domain requests

	const isProd = process.env.NODE_ENV === 'production'
	if (isProd) {
		setHeader(event, 'Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
	}
	// Enforces HTTPS in production for 2 years, includes subdomains, and allows preloading

	const csp = isProd
		? "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'"
		: "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'"

	setHeader(event, 'Content-Security-Policy', csp)
	// Sets stricter policy in production, more lenient in development
})
