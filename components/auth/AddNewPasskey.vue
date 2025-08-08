<template>
	<div class="min-h-screen flex items-center justify-center">
		<div class="text-center w-full max-w-sm space-y-2">
			<h1 class="mb-6 text-2xl font-bold">Add new passkey</h1>

			<input
				v-model.trim="deviceName"
				type="text"
				placeholder="Optional device name (e.g., iPhone 15)"
				class="border p-2 w-full rounded" />

			<div class="text-sm text-gray-600">This will register an additional passkey for your account.</div>

			<div class="space-y-2">
				<button
					type="button"
					@click="addNewPasskey"
					:disabled="isLoading"
					class="bg-gray-900 text-white px-4 py-2 w-full rounded flex items-center justify-center gap-2">
					<UtilsLoadingSpinner v-if="isLoading" class="w-4 h-4" />
					<span>{{ isLoading ? 'Registering…' : 'Add New Passkey' }}</span>
				</button>

				<p v-if="message" class="text-green-700 text-sm">{{ message }}</p>
				<p v-if="error" class="text-red-700 text-sm">{{ error }}</p>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()

const deviceName = ref('')
const isLoading = ref(false)
const error = ref('')
const message = ref('')

const addNewPasskey = async () => {
	error.value = ''
	message.value = ''

	if (!deviceName.value.trim()) {
		error.value = 'Device name cannot be empty'
		return
	}

	try {
		isLoading.value = true
		const response = await auth.addNewPasskey({ deviceName: deviceName.value.trim() })

		if (!response || response.success === false) {
			isLoading.value = false
			error.value = response?.message || 'Failed to add new passkey'
			return
		}

		message.value = 'New passkey registered successfully.'
		deviceName.value = ''
		isLoading.value = false
	} catch (e) {
		isLoading.value = false
		error.value = e?.message || 'Failed to add new passkey'
	}
}
</script>
