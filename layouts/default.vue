<template>
	<div class="relative antialiased min-h-screen bg-gray-50">
		<div>
			<NuxtPage />
		</div>
	</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()

onMounted(() => {
	auth.fetchUser()
})
</script>
