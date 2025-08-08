<template>
	<div>
		<div class="space-y-2">
			<input v-model="email" type="email" placeholder="Enter email for secure link" class="border p-2 w-full" />
			<button
				type="button"
				@click="sendLink"
				:disabled="isLoading"
				class="bg-gray-900 text-white px-4 py-2 w-full rounded flex items-center justify-center gap-2">
				<UtilsLoadingSpinner v-if="isLoading" class="w-4 h-4" />
				<span>{{ isLoading ? 'Preparing magic link...' : 'Send Magic Link' }}</span>
			</button>
		</div>
		<p v-if="error" class="text-red-600 text-sm mt-2">{{ error }}</p>
		<p v-if="message" class="text-gray-900 text-sm mt-2">{{ message }}</p>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const isLoading = ref(false)
const auth = useAuthStore()
const email = ref('')
const error = ref('')
const message = ref('')
const reg =
	/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/

const sendLink = async () => {
	error.value = ''
	if (!reg.test(email.value)) {
		error.value = 'Invalid email format'
		return
	}
	try {
		isLoading.value = true
		const response = await auth.sendLoginLink({ email: email.value })
		if (response.success === false) {
			error.value = response.message || 'Failed to send magic link'
			isLoading.value = false
			return
		}
		message.value = 'Magic link sent! Please check your email.'
		isLoading.value = false
	} catch (e) {
		error.value = e.message || 'Failed to send link'
		isLoading.value = false
	}
}
</script>
