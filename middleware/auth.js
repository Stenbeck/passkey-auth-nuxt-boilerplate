export default defineNuxtRouteMiddleware(async (to) => {
	const auth = useAuthStore()

	if (!auth.user) {
		await auth.fetchUser()
	}

	if (!auth.user && to.path === '/dashboard') {
		return navigateTo('/')
	}
})
