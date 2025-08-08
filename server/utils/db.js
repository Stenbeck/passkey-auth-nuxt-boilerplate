import mongoose from 'mongoose'

let isConnected = false

export async function connectDB() {
	if (isConnected) return
	const config = useRuntimeConfig()
	try {
		await mongoose.connect(config.mongoUri)
		isConnected = true
	} catch (err) {
		console.error('MongoDB connection error:', err)
		throw err
	}
}
