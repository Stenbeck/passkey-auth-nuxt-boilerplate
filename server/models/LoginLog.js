import mongoose from 'mongoose'

const LoginLogSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		ip: { type: String },
		userAgent: { type: String },
		method: { type: String, default: 'unknown' },
	},
	{ timestamps: true }
)

const LoginLog = mongoose.models.LoginLog || mongoose.model('LoginLog', LoginLogSchema)

export default LoginLog
