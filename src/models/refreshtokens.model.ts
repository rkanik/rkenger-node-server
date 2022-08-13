import { model, Schema } from 'mongoose'
import { _regex } from '../regexs'
import { IRefreshToken, IRefreshTokenDoc } from '@types'

const refreshTokenSchemaFields: Record<keyof IRefreshToken, any> = {
	user: {
		unique: true,
		required: true,
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	token: {
		type: String,
		required: true
	}
}

const refreshTokenSchema = new Schema(
	refreshTokenSchemaFields, {
	timestamps: true,
	autoIndex: true
})

export const RefreshTokens = model<IRefreshTokenDoc>(
	'RefreshToken', refreshTokenSchema
)