import mongoose from 'mongoose'

const CredentialSchema = new mongoose.Schema(
	{
		id: { type: String, required: true },
		publicKey: { type: String, required: true },
		counter: { type: Number, required: true },
		challenge: { type: String },
	},
	{ _id: false }
)

const UserSchema = new mongoose.Schema(
	{
		credential: { type: CredentialSchema, required: true },
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, required: true, unique: true, index: true },
		verified: { type: Boolean, default: false },
	},
	{
		timestamps: true,
	}
)

const User = mongoose.models.User || mongoose.model('User', UserSchema)

export default User
