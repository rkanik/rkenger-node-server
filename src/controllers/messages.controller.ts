import { Conversations, Messages } from '@models'
import { handleRequest, parseMongoError } from "@helpers";
import { IMessageDoc, IUserDoc, TId } from '@types';
import StatusCodes from 'http-status-codes';

const {
	NOT_FOUND,
	UNPROCESSABLE_ENTITY,
	INTERNAL_SERVER_ERROR
} = StatusCodes

export const findAll = handleRequest(async (req, res) => {
	let select = req.query.select || ''
	let conversation = await Conversations
		.findById(req.params._cid).select('messages')
		.populate({
			path: 'messages',
			options: {
				select,
				limit: 15,
				sort: {
					createdAt: -1
				}
			}
		})
		.exec();
	return res.success(conversation)
})

export const create = handleRequest(async (req, res) => {

	const user = req.user as IUserDoc
	req.body.sender = user._id

	const message = new Messages(req.body)

	const validationError = message.validateSync()
	if (validationError) return res
		.status(UNPROCESSABLE_ENTITY)
		.error(parseMongoError(validationError))

	try {
		const newMessage = await message.save() as (TId & IMessageDoc)
		const conversation = await Conversations
			.findOneAndUpdate({
				_id: req.params._cid,
				'members.user': newMessage.sender
			}, {
				$push: {
					messages: newMessage._id
				}
			})
			.select('messages')
			.populate({
				path: 'messages',
				options: {
					limit: 15,
					sort: { createdAt: -1 },
				}
			}).exec()
		if (!conversation) return res.status(NOT_FOUND).error({
			message: `Conversation not found with id '${req.params._cid}' or you are not a member of this conversation`
		})

		if (conversation.messages) conversation.messages.unshift(newMessage)
		else conversation.messages = [newMessage]

		return res.success(conversation)
	}
	catch (error) {
		return res
			.status(INTERNAL_SERVER_ERROR)
			.error({ message: error.message })
	}
})