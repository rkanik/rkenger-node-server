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
		required: true,
		type: Schema.Types.ObjectId,
	},
	members: [{
		user: {
			ref: 'User',
			required: true,
			type: Schema.Types.ObjectId,
		},
		addedBy: {
			ref: 'User',
			required: true,
			type: Schema.Types.ObjectId,
		},
		removedAt: {
			type: Date,
		}
	}],
	messages: [{
		ref: 'Message',
		required: true,
		type: Schema.Types.ObjectId,
	}]
}

const conversationSchema = new Schema(
	conversationSchemaFields, {
	timestamps: true,
	autoIndex: true
})

export const Coversations = model<IConversationDoc>(
	'Coversation', conversationSchema
)