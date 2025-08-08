<template>
	<div class="min-h-screen flex items-center justify-center">
		<p v-if="error" class="text-red-600">{{ error }}</p>
		<p v-else class="text-gray-600">Logging in...</p>
	</div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { onMounted, ref } from 'vue'

const route = useRoute()
const auth = useAuthStore()
const error = ref('')

const verifyLink = async () => {
	try {
		const token = route.query.token
		if (!token) {
			error.value = 'No token provided.'
			return
		}
		await auth.verifyLoginLink(token)
		await auth.fetchUser()
		navigateTo('/dashboard')
	} catch (err) {
		error.value = 'Invalid or expired token.'
		console.error('Error verifying login link:', err)
	}
}

onMounted(async () => {
	await verifyLink()
})
</script>
