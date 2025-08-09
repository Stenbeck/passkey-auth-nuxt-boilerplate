<template>
	<div class="py-24 px-4 sm:px-6 lg:px-8 mx-auto max-w-2xl">
		<div class="sm:flex">
			<div class="sm:flex-auto sm:items-center">
				<h1 class="text-base font-semibold text-gray-900">Passkey Management</h1>
				<p class="mt-2 text-sm text-gray-700">
					Manage your Passkeys here. Add new ones, remove not used ones or simply know what passkeys you have. Next
					might be to go to
					<NuxtLink to="/dashboard" class="underline underline-offset-4 hover:no-underline">dashboard</NuxtLink>
					or
					<span class="underline underline-offset-4 cursor-pointer hover:no-underline" @click="logout">logout</span>
					.
				</p>
			</div>
			<div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
				<button
					@click="openAddNewPasskey"
					type="button"
					class="block rounded-md bg-gray-900 px-3 py-2 text-center text-sm text-white shadow-xs hover:bg-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700">
					Add new passkey
				</button>
			</div>
		</div>
		<div class="mt-8 flow-root">
			<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
				<div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
					<table class="relative min-w-full divide-y divide-gray-300">
						<thead>
							<tr>
								<th scope="col" class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0">Name</th>
								<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created</th>
								<th scope="col" class="py-3.5 pr-4 pl-3 sm:pr-0">
									<span class="sr-only">Delete</span>
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
							<tr v-for="passkey in passkeys" :key="passkey.id">
								<td class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0">
									{{ passkey.deviceName }}
								</td>
								<td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
									{{ format(new Date(passkey.createdAt), 'yyyy-MM-dd HH:mm') }}
								</td>
								<td class="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
									<div @click="deletePasskey(passkey.id)" class="flex items-center justify-end">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.5"
											stroke="currentColor"
											class="size-5 hover:text-gray-500 cursor-pointer">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
										</svg>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<!-- Modal -->
		<div v-if="showAdd" class="fixed inset-0 z-50 flex items-center justify-center">
			<div class="absolute inset-0 bg-black/50" @click="showAdd = false"></div>
			<div class="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 mx-4 shadow-lg">
				<AuthAddNewPasskey v-model="showAdd" />
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { format } from 'date-fns'

const auth = useAuthStore()

const passkeys = ref([])
const error = ref('')
const message = ref('')

const showAdd = ref(false)

const openAddNewPasskey = () => {
	showAdd.value = true
}

watch(showAdd, (val, old) => {
	if (old === true && val === false) getPasskeys()
})

const getPasskeys = async () => {
	error.value = ''
	message.value = ''
	try {
		const response = await auth.getPasskeys()

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

onMounted(() => {
	getPasskeys()
})
</script>
