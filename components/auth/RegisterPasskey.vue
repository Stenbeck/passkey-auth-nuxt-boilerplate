<template>
	<div>
		<div class="space-y-2">
			<input v-model="firstName" type="text" placeholder="Enter first name" class="border p-2 w-full" />
			<input v-model="lastName" type="text" placeholder="Enter last name" class="border p-2 w-full" />
			<input v-model="email" type="email" placeholder="Enter email" class="border p-2 w-full" />
			<button
				type="button"
				@click="checkEmail"
				:disabled="isLoading"
				class="bg-gray-900 text-white px-4 py-2 w-full rounded flex items-center justify-center gap-2">
				<UtilsLoadingSpinner v-if="isLoading" class="w-4 h-4" />
				<span>{{ isLoading ? 'Setting things up...' : 'Register with Passkey' }}</span>
			</button>
		</div>
		<p v-if="message" class="text-gray-900 text-sm mt-2">{{ message }}</p>
		<p v-if="error" class="text-red-600 text-sm mt-2">{{ error }}</p>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
const auth = useAuthStore()

const isLoading = ref(false)
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const error = ref('')
const message = ref('')
const reg =
	/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/

const checkEmail = async () => {
	error.value = ''
	message.value = ''
	if (!reg.test(email.value)) {
		error.value = 'Invalid email format'
		return
	}
	if (!firstName.value || !lastName.value || !email.value) {
		error.value = 'All fields are required'
		return
	}
	try {
		isLoading.value = true
		const userExists = await auth.userExists(email.value)
		if (userExists.success) {
			error.value = 'A user with that email already exists'
			isLoading.value = false
			return
		}
		await registerWithPasskey()
		firstName.value = ''
		lastName.value = ''
		email.value = ''
		isLoading.value = false
	} catch (e) {
		error.value = e?.data?.message || e?.message || 'Registration failed'
		isLoading.value = false
	}
}

const registerWithPasskey = async () => {
	try {
		const response = await auth.registerPasskey({
			firstName: firstName.value,
			lastName: lastName.value,
			email: email.value,
		})
		if (response.success) {
			message.value = 'Registration successful! Please check your email for a verification email.'
		} else {
			error.value = response.message || 'Registration failed'
		}
	} catch (e) {
		error.value = e?.data?.message || e?.message || 'Registration failed'
	}
}
</script>
