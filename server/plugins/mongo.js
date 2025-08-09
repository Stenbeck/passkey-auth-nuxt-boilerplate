// Auto-connect to MongoDB on server cold start
import mongoose from 'mongoose'

export default async () => {
	const config = useRuntimeConfig()

	// 1 = connected, 2 = connecting
	if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) return

	try {
		await mongoose.connect(config.mongoUri)
		if (import.meta.dev) console.log('MongoDB connected')
	} catch (err) {
		console.error('MongoDB connection error:', err)
		throw err
	}
}
