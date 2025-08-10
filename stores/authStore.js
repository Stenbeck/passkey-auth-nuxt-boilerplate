import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
	const user = ref(null)
	const fetching = ref(false)

	// --- Session ---
	// const fetchUser = async () => {
	// 	const data = await $fetch('/api/auth/me', {
	// 		credentials: 'include',
	// 	})
	// 	user.value = data.user
	// }

	const fetchUser = async () => {
		if (fetching.value || user.value) return { success: !!user.value }

		fetching.value = true
		try {
			const data = await $fetch('/api/auth/me', { credentials: 'include' })
			const u = data?.user ?? (data?.authenticated ? data : null)
			if (u) {
				user.value = u
				return { success: true }
			}
			user.value = null
			return { success: false }
		} catch {
			user.value = null
			return { success: false }
		} finally {
			fetching.value = false
		}
	}

	const userExists = async (email) => {
		const result = await $fetch('/api/auth/userExists', {
			query: { email },
		})
		return result.success
	}

	const logout = async () => {
		await $fetch('/api/auth/logout', { method: 'POST' })
		user.value = null
	}

	const setUser = (userData) => {
		user.value = userData
	}

	// --- Registration ---
	const registerPasskey = async ({ email, firstName, lastName }) => {
		const res = await $fetch('/api/auth/passkey/registerRequest', {
			method: 'POST',
			body: { email },
		})

		if (res.success === false || !res.options) {
			return { success: false, message: res.message || 'Failed to initiate registration' }
		}

		const { options } = res

		options.challenge = Uint8Array.from(atob(base64urlToBase64(options.challenge)), (c) => c.charCodeAt(0)).buffer
		options.user.id = Uint8Array.from(atob(base64urlToBase64(options.user.id)), (c) => c.charCodeAt(0)).buffer

		const credential = await navigator.credentials.create({
			publicKey: options,
		})

		const credentialJSON = {
			id: credential.id,
			type: credential.type,
			rawId: arrayBufferToBase64url(credential.rawId),
			response: {
				attestationObject: arrayBufferToBase64url(credential.response.attestationObject),
				clientDataJSON: arrayBufferToBase64url(credential.response.clientDataJSON),
			},
			clientExtensionResults: credential.getClientExtensionResults?.(),
		}

		const response = await $fetch('/api/auth/passkey/registerResponse', {
			method: 'POST',
			body: { credential: credentialJSON, email, firstName, lastName },
			credentials: 'include',
		})

		return response
	}

	const verifyEmail = async (token) => {
		if (!token) throw new Error('No token provided')
		const response = await $fetch('/api/auth/verifyEmail', {
			query: { token },
		})
		if (!response.success) {
			return { success: false, message: response.message || 'Email verification failed' }
		}

		setUser(response.user)
	}

	// --- Authentication ---
	const loginPasskey = async (email) => {
		const options = await $fetch('/api/auth/passkey/loginRequest', {
			method: 'POST',
			body: { email },
		})

		if (options.success === false) {
			return { success: false, message: options.message || 'Failed to initiate login' }
		}

		options.challenge = Uint8Array.from(atob(base64urlToBase64(options.challenge)), (c) => c.charCodeAt(0)).buffer

		if (options.allowCredentials) {
			options.allowCredentials = options.allowCredentials.map((cred) => ({
				...cred,
				id: Uint8Array.from(atob(base64urlToBase64(cred.id)), (c) => c.charCodeAt(0)).buffer,
			}))
		}

		const assertion = await navigator.credentials.get({
			publicKey: options,
		})

		await $fetch('/api/auth/passkey/loginResponse', {
			method: 'POST',
			body: {
				id: assertion.id,
				type: assertion.type,
				rawId: arrayBufferToBase64url(assertion.rawId),
				response: {
					authenticatorData: arrayBufferToBase64url(assertion.response.authenticatorData),
					clientDataJSON: arrayBufferToBase64url(assertion.response.clientDataJSON),
					signature: arrayBufferToBase64url(assertion.response.signature),
					userHandle: assertion.response.userHandle ? arrayBufferToBase64url(assertion.response.userHandle) : null,
				},
			},
		})
		await fetchUser()
		return { success: true }
	}

	const sendLoginLink = async ({ email }) => {
		const response = await $fetch('/api/auth/requestLoginLink', {
			method: 'POST',
			body: { email },
		})

		return response
	}

	const verifyLoginLink = async (token) => {
		if (!token) throw new Error('No token provided')
		const response = await $fetch('/api/auth/verifyLoginLink', {
			query: { token },
		})
		setUser(response.user)
	}

	// --- Passkey Management ---
	const addNewPasskey = async (deviceName) => {
		try {
			// 1) Request registration options (requires auth cookie)
			const res = await $fetch('/api/auth/passkey/addNewPasskeyRequest', {
				method: 'POST',
				credentials: 'include',
			})

			const { options } = res

			if (res.success === false || !options) {
				return { success: false, message: res?.message || 'Failed to start add-passkey flow' }
			}

			// Normalize challenge
			options.challenge = Uint8Array.from(atob(base64urlToBase64(options.challenge)), (c) => c.charCodeAt(0)).buffer

			// Normalize user.id if present (depends on server shape)
			if (options.user?.id) {
				options.user.id = Uint8Array.from(atob(base64urlToBase64(options.user.id)), (c) => c.charCodeAt(0)).buffer
			}

			// Normalize excludeCredentials[].id (required by WebAuthn API)
			if (options.excludeCredentials) {
				options.excludeCredentials = options.excludeCredentials.map((cred) => ({
					...cred,
					id: Uint8Array.from(atob(base64urlToBase64(cred.id)), (c) => c.charCodeAt(0)).buffer,
				}))
			}

			// 3) Create credential via WebAuthn API
			const credential = await navigator.credentials.create({
				publicKey: options,
			})

			// 4) Normalize result to JSON compatible with your server
			const credentialJSON = {
				id: credential.id,
				type: credential.type,
				rawId: arrayBufferToBase64url(credential.rawId),
				response: {
					attestationObject: arrayBufferToBase64url(credential.response.attestationObject),
					clientDataJSON: arrayBufferToBase64url(credential.response.clientDataJSON),
				},
				clientExtensionResults: credential.getClientExtensionResults?.(),
			}

			// 5) Send response to server to append the new credential
			const response = await $fetch('/api/auth/passkey/addNewPasskeyResponse', {
				method: 'POST',
				body: { credential: credentialJSON, deviceName },
				credentials: 'include',
			})

			if (!response || response.success === false) {
				return { success: false, message: response?.message || 'Failed to save new passkey' }
			}

			return { success: true }
		} catch (e) {
			return { success: false, message: e?.message || 'Add-passkey failed' }
		}
	}

	const getPasskeys = async () => {
		try {
			const response = await $fetch('/api/auth/passkey/passkeys', { credentials: 'include' })
			if (!response || response.success === false) {
				return { success: false, message: response?.message || 'Failed to fetch passkeys' }
			}
			return { success: true, passkeys: response.passkeys || [] }
		} catch (e) {
			return { success: false, message: 'Failed to fetch passkeys' }
		}
	}

	const deletePasskey = async (id) => {
		if (!id) return { success: false, message: 'Missing passkey id' }
		try {
			const response = await $fetch(`/api/auth/passkey/${id}`, {
				method: 'DELETE',
				credentials: 'include',
			})

			if (!response || response.success === false) {
				return { success: false, message: res?.message || 'Failed to delete passkey' }
			}
			return { success: true }
		} catch (e) {
			return { success: false, message: 'Failed to delete passkey' }
		}
	}

	return {
		user,
		fetchUser,
		userExists,
		registerPasskey,
		loginPasskey,
		logout,
		sendLoginLink,
		verifyLoginLink,
		verifyEmail,
		addNewPasskey,
		getPasskeys,
		deletePasskey,
		setUser,
	}
})

function base64urlToBase64(base64url) {
	if (typeof base64url !== 'string') {
		throw new Error('Expected base64url to be a string but got: ' + typeof base64url)
	}

	return base64url
		.replace(/-/g, '+')
		.replace(/_/g, '/')
		.padEnd(Math.ceil(base64url.length / 4) * 4, '=')
}

function arrayBufferToBase64url(buffer) {
	return btoa(String.fromCharCode(...new Uint8Array(buffer)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '')
}
