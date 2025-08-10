export default defineEventHandler((event) => {
	setCookie(event, 'token', '', { maxAge: -1, path: '/' })
	return { success: true }
})
