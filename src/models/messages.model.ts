import mongoose, { Schema } from 'mongoose'
import { EMessageTypes, IMessage, IMessageDoc } from '@types'
import { isEmpty } from '@helpers'

const messageSchemaFields: Record<keyof IMessage, any> = {
	type: {
		type: String,
		enum: ['text', 'voice', 'image', 'link', 'video'],
		required: function () {
			return isEmpty(this.text)
		},
	},
	text: {
		type: String,
		required: function () {
			return this.type === EMessageTypes.Text && isEmpty(this.text)
		}
	},
	image: {
		ref: 'Image',
		type: Schema.Types.ObjectId,
		required: function () {
			return this.type === EMessageTypes.Image && isEmpty(this.image)
		}
	},
	video: {
		ref: 'Video',
		type: Schema.Types.ObjectId,
		required: function () {
			return this.type === EMessageTypes.Video && isEmpty(this.video)
		}
	},
	link: {
		type: String,
		required: function () {
			return this.type === EMessageTypes.Link && isEmpty(this.link)
		}
	},
	voice: {
		type: String,
		required: function () {
			return this.type === EMessageTypes.Voice && isEmpty(this.voice)
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
			type: Schema.Types.ObjectId,
		},
		to: {
			ref: 'Message',
			type: Schema.Types.ObjectId,
		}
	},
	forwardedBy: {
		ref: 'User',
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