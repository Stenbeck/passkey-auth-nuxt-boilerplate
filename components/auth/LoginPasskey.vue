<template>
	<div class="space-y-2">
		<input v-model="loginEmail" type="email" placeholder="Enter email to login" class="border p-2 w-full" />
		<button
			type="button"
			@click="loginWithPasskey"
			:disabled="isLoading"
			class="bg-gray-900 text-white px-4 py-2 w-full rounded flex items-center justify-center gap-2">
			<UtilsLoadingSpinner v-if="isLoading" class="w-4 h-4" />
			<span>{{ isLoading ? 'Checking credentials...' : 'Login with Passkey' }}</span>
		</button>
		<p v-if="error" class="text-red-600 text-sm mt-2">{{ error }}</p>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()

const isLoading = ref()
const loginEmail = ref('')
const error = ref('')
const reg =
	/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/

const loginWithPasskey = async () => {
	error.value = ''
	if (!reg.test(loginEmail.value)) {
		error.value = 'Invalid email format'
		return
	}
	try {
		isLoading.value = true
		const response = await auth.loginPasskey({ email: loginEmail.value })

		if (response.success) {
			isLoading.value = false
			navigateTo('/dashboard')
		} else {
			error.value = response.message || 'Login failed'
		}
	} catch (e) {
		isLoading.value = false
		error.value = e.message || 'Login failed'
	}
}
</script>
