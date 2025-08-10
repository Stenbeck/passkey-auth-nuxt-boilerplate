import { useAuthStore } from '@/stores/authStore'

export default defineNuxtRouteMiddleware(async () => {
	const auth = useAuthStore()
	if (!auth.user) {
		await auth.fetchUser()
	}
})
