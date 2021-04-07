import { Schema, Document, Types } from 'mongoose'

export interface IConversation extends Document {
	name?: string
	members: Types.ObjectId[],
}

const Conversation = new Schema<IConversation>({
	name: String
}, 
{
	timestamps: true
})