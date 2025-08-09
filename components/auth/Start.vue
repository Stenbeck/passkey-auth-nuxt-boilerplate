<template>
	<div class="min-h-screen bg-white flex">
		<div class="relative flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
			<div class="mx-auto w-full max-w-sm lg:w-96">
				<div>
					<h2 class="mt-6 text-3xl font-extrabold text-gray-900">Passkey Auth Boilerplate</h2>
					<p class="mt-2 text-sm text-gray-700">
						Open source passkey auth boilerplate site. Nuxt, internal APIs, MongoDB and TailwindCSS. Feel free to try
						the demo.
					</p>
				</div>
				<div class="mt-8">
					<div class="mt-6">
						<div>
							<AuthLoginPasskey v-if="currentView === 'login'" />
							<AuthRegisterPasskey v-if="currentView === 'register'" />
							<AuthSendMagicLink v-if="currentView === 'magic'" />
							<div v-if="currentView === 'login'" class="mt-2 flex gap-4 justify-between text-sm text-gray-700">
								<button @click="currentView = 'register'" class="hover:underline underline-offset-4">Register</button>
								<button @click="currentView = 'magic'" class="hover:underline underline-offset-4">
									Get magic-link email
								</button>
							</div>

							<div v-if="currentView !== 'login'" class="text-right">
								<button @click="currentView = 'login'" class="text-sm text-gray-700">Back to Login</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="hidden md:block relative w-0 flex-1">
			<img class="absolute inset-0 h-full w-full object-cover object-right" src="/winter_view.jpeg" alt="" />
		</div>
	</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()

const currentView = ref('login') // 'login' | 'register' | 'magic'

onMounted(async () => {
	// Ensure store is hydrated before deciding; avoids missing redirect on reload
	if (!auth.user) {
		await auth.fetchUser()
	}
	if (auth.user) {
		navigateTo('/dashboard', { replace: true })
	}
})
</script>
