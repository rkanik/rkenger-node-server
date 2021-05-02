import { model, Schema } from 'mongoose'
import { EColors, IConversation, IConversationDoc } from '@types'

const conversationSchemaFields: Record<keyof IConversation, any> = {
	name: {
		type: String
	},
	isGroup: {
		type: Boolean,
		default: false
	},
	createdBy: {
		required: true,
		type: Schema.Types.ObjectId
	},
	admin: {
		type: Schema.Types.ObjectId
	},
	image: {
		ref: 'Image',
		type: Schema.Types.ObjectId,
	},
	color: {
		type: String,
		required: true,
		default: EColors.Blue
	},
	emoji: {
		type: String,
		required: true,
		default: "🍗"
	},
	mutedBy: [{
		user: {
			ref: 'User',
			required: true,
			type: Schema.Types.ObjectId,
		},
		unMuteAt: {
			required: true,
			type: [Date, Boolean],
		}
	}],
	deletedBy: {
		ref: 'User',
		type: Schema.Types.ObjectId,
	},
	members: {
		required: true,
		validate: [(val: []) => val.length > 1, 'Must have minimum two members'],
		type: [{
			user: {
				ref: 'User',
				required: true,
				type: Schema.Types.ObjectId,
			},
			addedBy: {
				ref: 'User',
				type: Schema.Types.ObjectId,
			},
			removedAt: {
				type: Date,
			},
			nickname: {
				type: String
			}
		}]
	},
	request: {
		user: {
			ref: 'User',
			type: Schema.Types.ObjectId,
		},
		acceptedAt: Date,
		cancelledAt: Date
	},
	count: {
		default: {
			members: 0,
			messages: 0
		},
		type: {
			messages: Number,
			members: Number
		}
	},
	messages: [{
		ref: 'Message',
		required: true,
		type: Schema.Types.ObjectId,
	}]
}

const conversationSchema = new Schema(conversationSchemaFields, { timestamps: true })

export const Conversations = model<IConversationDoc>(
	'Conversation', conversationSchema
)