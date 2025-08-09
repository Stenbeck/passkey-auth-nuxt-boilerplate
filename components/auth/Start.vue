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
			<div class="absolute bottom-4">
				<a href="https://github.com/users/stenbeck" class="flex space-x-2 items-center">
					<svg class="size-5 fill-[#24292F]" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
							clip-rule="evenodd" />
					</svg>
					<p class="text-sm text-gray-700 hover:underline underline-offset-4">
						Feel free to use, fork, adapt or contribute.
					</p>
				</a>
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
