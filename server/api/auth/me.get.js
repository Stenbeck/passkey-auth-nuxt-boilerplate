export default defineEventHandler((event) => {
	const user = event.context.user
	if (!user) {
		return { success: false, authenticated: false }
	}
	return { success: true, authenticated: true, user: user }
})
