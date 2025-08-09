export default defineEventHandler(async (event) => {
	return { success: true, user: event.context.user }
})
