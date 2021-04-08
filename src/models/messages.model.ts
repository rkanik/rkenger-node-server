import mongoose, { Schema } from 'mongoose'
import { EMessageTypes, IMessage, IMessageDoc } from '@types'

const messageSchemaFields: Record<keyof IMessage, any> = {
	type: {
		type: String,
		required: true,
		default: EMessageTypes.Text
	},
	text: {
		type: String
	},
	image: {
		ref: 'Image',
		type: Schema.Types.ObjectId,
	},
	video: {
		ref: 'Video',
		type: Schema.Types.ObjectId,
	},
	link: {
		type: String
	},
	voice: {
		duration: {
			type: Number,
			required: true,
		},
		url: {
			type: String,
			required: true,
		}
	},
	sender: {
		ref: 'User',
		required: true,
		type: Schema.Types.ObjectId,
	},
	seenBy: [{
		ref: 'User',
		required: true,
		type: Schema.Types.ObjectId,
	}],
	replied: {
		by: {
			ref: 'User',
			required: true,
			type: Schema.Types.ObjectId,
		},
		to: {
			ref: 'Message',
			required: true,
			type: Schema.Types.ObjectId,
		}
	},
	forwardedBy: {
		ref: 'User',
		required: true,
		type: Schema.Types.ObjectId,
	},
	deletedBy: [{
		ref: 'User',
		required: true,
		type: Schema.Types.ObjectId,
	}],
	isUnsent: {
		type: Boolean
	}
}

const messageSchema = new Schema(
	messageSchemaFields, {
	timestamps: true,
	autoIndex: true
})

export const Messages = mongoose.model<IMessageDoc>(
	'Message', messageSchema
)