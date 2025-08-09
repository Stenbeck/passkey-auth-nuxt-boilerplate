export default defineNuxtRouteMiddleware((to, from) => {
	// On the server we can trust 00.auth.js to have set event.context.user from the HttpOnly cookie
	if (import.meta.server) {
		const event = useRequestEvent()
		if (!event.context?.user) {
			return navigateTo('/')
		}
		return
	}
})
