<template>
	<div class="absolute top-0 right-0 pt-2 pr-2">
		<button
			@click="close"
			type="button"
			class="rounded-md border bg-white text-gray-500 hover:text-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-hidden">
			<span class="sr-only">Close</span>
			<svg
				class="size-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1"
				stroke="currentColor"
				aria-hidden="true"
				data-slot="icon">
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
			</svg>
		</button>
	</div>
	<div class="flex items-center justify-center">
		<div class="text-center w-full max-w-sm space-y-2">
			<h1 class="text-base font-semibold text-gray-900">Add new passkey</h1>
			<div class="pb-4 text-sm text-gray-700">Register an additional personal passkey.</div>

			<input
				v-model.trim="deviceName"
				type="text"
				placeholder="Device name (e.g. My foldable iPhone19)"
				class="text-sm border p-1.5 w-full rounded" />

			<div class="space-y-2">
				<button
					type="button"
					@click="addNewPasskey"
					:disabled="isLoading"
					class="text-sm bg-gray-900 text-white px-3 py-2 w-full rounded flex items-center justify-center gap-2">
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

const show = defineModel()

const deviceName = ref('')
const isLoading = ref(false)
const error = ref('')
const message = ref('')

const close = () => {
	show.value = false
}

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
		show.value = false
	} catch (e) {
		isLoading.value = false
		error.value = e?.message || 'Failed to add new passkey'
	}
}
</script>
