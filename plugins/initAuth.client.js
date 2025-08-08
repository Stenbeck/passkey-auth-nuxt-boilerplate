export default defineNuxtPlugin(async () => {
	const auth = useAuthStore()

	try {
		const user = await $fetch('/api/auth/me', {
			credentials: 'include',
		})
		if (user) {
			auth.setUser(user)
		}
	} catch {
		// Clear the user from the store if fetch fails or no valid token
		auth.clear()
	}
})
