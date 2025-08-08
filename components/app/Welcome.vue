<template>
	<div class="p-6">
		<h1 class="text-2xl font-bold">Hi, {{ user?.firstName }}, you are now logged in</h1>
		<button class="mt-4 underline" @click="logout">Logout</button>
	</div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import { onMounted, computed } from 'vue'

const auth = useAuthStore()
const user = computed(() => auth.user)

const logout = async () => {
	await auth.logout()
	navigateTo('/')
}
</script>
