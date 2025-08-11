export default defineNuxtConfig({
	compatibilityDate: '2025-08-04',
	modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
	runtimeConfig: {
		mongoUri: process.env.MONGO_URI,
		smtpHost: process.env.SMTP_HOST,
		smtpPort: process.env.SMTP_PORT,
		smtpUser: process.env.SMTP_USER,
		smtpPass: process.env.SMTP_PASS,
		mailFrom: process.env.MAIL_FROM,
		baseUrl: process.env.BASE_URL,
		loginTokenSecret: process.env.LOGIN_TOKEN_SECRET,
		emailVerificationSecret: process.env.EMAIL_VERIFICATION_SECRET,
		rpId: process.env.RP_ID || 'localhost',
		rpName: process.env.RP_NAME || 'Passkey Boilerplate Site',
		rpOrigin: process.env.RP_ORIGIN || 'http://localhost:3000',
		public: {},
	},
	ssr: true,
	app: {
		head: {
			htmlAttrs: { lang: 'en' },
			title: 'Passkey Boilerplate — Secure Nuxt 3 Starter',
			meta: [
				{ charset: 'utf-8' },
				{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
				{
					name: 'description',
					content:
						'Secure and modern passkey authentication boilerplate built with Nuxt 3, MongoDB, and Tailwind CSS. Perfect for starting secure web projects.',
				},
				{
					name: 'keywords',
					content: 'passkey, nuxt 3, boilerplate, mongodb, tailwindcss, authentication, webauthn, security',
				},
				{ name: 'author', content: 'Fredrik Stenbeck' },
				{ name: 'robots', content: 'index, follow' },
				{ property: 'og:title', content: 'Passkey Boilerplate — Secure Nuxt 3 Starter' },
				{
					property: 'og:description',
					content: 'A secure Nuxt 3 boilerplate with passkey authentication, MongoDB, and Tailwind CSS.',
				},
				{ property: 'og:image', content: 'https://passkey.stenbecklab.com/preview.jpg' },
				{ property: 'og:url', content: 'https://passkey.stenbecklab.com' },
				{ property: 'og:type', content: 'website' },
				{ name: 'twitter:card', content: 'summary_large_image' },
				{ name: 'twitter:title', content: 'Passkey Boilerplate — Secure Nuxt 3 Starter' },
				{
					name: 'twitter:description',
					content: 'A secure Nuxt 3 boilerplate with passkey authentication, MongoDB, and Tailwind CSS.',
				},
				{ name: 'twitter:image', content: 'https://passkey.stenbecklab.com/preview.jpg' },
			],
			link: [
				{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
				{ rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
				{ rel: 'canonical', href: 'https://passkey.stenbecklab.com' },
			],
		},
	},
})
