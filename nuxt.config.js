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
		htmlAttrs: {
			lang: 'en',
		},
		meta: [
			{ charset: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{ name: 'description', content: 'Secure passkey boilerplate built with Nuxt, MongoDB and TailwindCSS.' },
		],
	},
})
