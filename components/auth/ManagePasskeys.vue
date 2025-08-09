<template>
	<div>
		<h1>Manage Passkeys</h1>
		<p>Here you can manage your passkeys.</p>
		<button @click="getPasskeys">Refresh Passkeys</button>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
const auth = useAuthStore()

const passkeys = ref([])
const error = ref('')
const message = ref('')

const getPasskeys = async () => {
	error.value = ''
	message.value = ''
	try {
		const response = await auth.getPasskeys()
		console.log('Fetched passkeys:', response)

		if (response.success && response.passkeys) {
			passkeys.value = response.passkeys
		} else {
			error.value = response.message || 'Failed to fetch passkeys'
		}
	} catch (error) {
		error.value = 'An error occurred while fetching passkeys'
	}
}

const deletePasskey = async (passkeyId) => {
	error.value = ''
	message.value = ''
	try {
		const response = await auth.deletePasskey(passkeyId)
		if (response.success) {
			passkeys.value = passkeys.value.filter((p) => (p.id === passkeyId ? false : true))
			message.value = 'Passkey deleted successfully'
		} else {
			error.value = response.message || 'Failed to delete passkey'
		}
	} catch (err) {
		error.value = 'An error occurred while deleting passkey'
	}
}
</script>
