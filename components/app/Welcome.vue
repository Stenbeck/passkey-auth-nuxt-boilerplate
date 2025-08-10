<template>
	<div class="py-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-2xl">
		<h1 class="text-base font-semibold text-gray-900">Dashbaord</h1>
		<client-only>
			<p v-if="user" class="mt-2 text-sm text-gray-700">
				Welcome {{ user.firstName }}
				, you are now logged in. This is an example of a logged in page. If you want to add a new passkey or manage your
				existing, simply go to the
				<NuxtLink to="/settings" class="underline underline-offset-4 hover:no-underline">settings-page</NuxtLink>
				or you can
				<span class="underline underline-offset-4 cursor-pointer hover:no-underline" @click="logout">logout</span>
				.
			</p>
		</client-only>
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
