<template>
	<div class="min-h-screen flex items-center justify-center">
		<div class="text-center w-full max-w-sm">
			<h1 class="mb-6 text-2xl font-bold">Login or Register</h1>
			<AuthLoginPasskey v-if="currentView === 'login'" />
			<AuthRegisterPasskey v-if="currentView === 'register'" />
			<AuthSendMagicLink v-if="currentView === 'magic'" />
			<div v-if="currentView === 'login'" class="mt-2 flex gap-4 justify-between text-sm text-gray-700">
				<button @click="currentView = 'register'" class="hover:underline underline-offset-4">Register</button>
				<button @click="currentView = 'magic'" class="hover:underline underline-offset-4">Get magic-link email</button>
			</div>

			<div v-if="currentView !== 'login'" class="text-right">
				<button @click="currentView = 'login'" class="text-sm text-gray-700">Back to Login</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()

const currentView = ref('login') // 'login' | 'register' | 'magic'

onMounted(() => {
	if (auth.user) {
		navigateTo('/dashboard')
	}
})
</script>
