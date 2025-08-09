<template>
	<div class="min-h-screen flex items-center justify-center">
		<div class="text-center w-full max-w-sm">
			<p v-if="error" class="text-red-600">{{ error }}</p>
			<p v-else-if="verified" class="text-gray-900">
				Email verified successfully! You are now logged in and will be redirected in 5 seconds.
			</p>
			<p v-else class="text-gray-600">Verifying...</p>
		</div>
	</div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { onMounted, ref } from 'vue'

const route = useRoute()
const auth = useAuthStore()
const error = ref('')
const verified = ref(false)

const verifyLink = async () => {
	try {
		const token = route.query.token
		if (!token) {
			error.value = 'No token provided.'
			return
		}
		const response = await auth.verifyEmail(token)

		if (response?.success === false) {
			error.value = response.message || 'Email verification failed.'
			return
		}
		verified.value = true
		await auth.fetchUser()
		setTimeout(() => {
			navigateTo('/dashboard')
		}, 5000) // Redirect after 5 seconds
	} catch (err) {
		error.value = 'Email already verified or token expired.'
		console.error('Error verifying email link:', err)
	}
}

onMounted(async () => {
	await verifyLink()
})
</script>
