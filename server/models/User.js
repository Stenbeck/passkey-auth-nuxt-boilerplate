import mongoose from 'mongoose'

const CredentialSchema = new mongoose.Schema(
	{
		id: { type: String, required: true, unique: true, sparse: true },
		publicKey: { type: String, required: true },
		counter: { type: Number, required: true },
		challenge: { type: String },
		transports: [String],
		deviceName: { type: String, default: 'Default device', trim: true },
	},
	{ _id: false, timestamps: true }
)

const UserSchema = new mongoose.Schema(
	{
		credentials: { type: [CredentialSchema], default: [] },
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, lowercase: true, trim: true, required: true, unique: true },
		verified: { type: Boolean, default: false },
	},
	{
		timestamps: true,
	}
)

const User = mongoose.models.User || mongoose.model('User', UserSchema)

export default User
