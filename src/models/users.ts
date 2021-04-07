import mongoose, { Schema } from 'mongoose'
import { _regex } from '../regexs'
import { EProviders, ERoles, IUser, IUserDoc } from '@types'

const userSchemaFields: Record<keyof IUser, any> = {
	name: {
		type: String,
		required: true,
		match: _regex.name
	},
	email: {
		type: String,
		match: _regex.email
	},
	role: {
		type: String,
		default: ERoles.User
	},
	username: {
		type: String,
		unique: true,
		required: true
	},
	emailVerified: {
		type: Boolean,
		default: false
	},
	provider: {
		type: String,
		default: EProviders.Local
	},
	friends: [{
		type: Schema.Types.ObjectId,
		ref: 'User',
	}],
	image: {
		type: Schema.Types.ObjectId,
		ref: 'Image',
		required: false
	},
	externalId: String,
	password: {
		type: String,
		match: _regex.password
	},
	phone: {
		type: String,
		match: _regex.phone
	},
	dob: Date,
	gender: String,
}

const userSchema = new Schema(
	userSchemaFields, {
	timestamps: true,
	autoIndex: true
})

userSchema.index({
	username: 'text',
	name: 'text',
	email: 'text',
	phone: 'text'
})

const Users = mongoose.model<IUserDoc>('User', userSchema)
export default Users