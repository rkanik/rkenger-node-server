import StatusCodes from 'http-status-codes'
import { Conversations } from '@models'
import { createFind, createFindOne, handleRequest, parseMongoError } from "@helpers";
import { IUserDoc } from '@types';

const {
	NOT_FOUND,
	UNPROCESSABLE_ENTITY,
	INTERNAL_SERVER_ERROR
} = StatusCodes

export const findAll = handleRequest(async (req, res) => {

	let { find, count, page, limit } = createFind(Conversations, req.query)
	const total = await count
	const conversations = await find
		.populate({
			path: 'messages',
			options: {
				limit: 1,
				sort: {
					createdAt: -1
				},
			}
		})
		.populate('members.user', 'username image')
		.exec()

	return res.success({
		pagination: { page, limit, total },
		conversations
	})
})

export const create = handleRequest(async (req, res) => {

	// Adding created by to current user
	const user = req.user as IUserDoc
	req.body.createdBy = user._id

	if (Array.isArray(req.body.members)) {

		// Adding self to the members if not exist
		if (!req.body.members.includes(user._id))
			req.body.members.push({ user: user._id })

		// Calculating is it a group or one to one conversation
		const isGroup = req.body.members.length > 2
		req.body.isGroup = isGroup

		// if (!isGroup) {
		// 	let conv = await Conversations.find({
		// 		$and: [
		// 			{ "members.user": user._id },
		// 			{ "members.user": req.body.members.find((m: any) => m.user !== user._id).user }
		// 		]
		// 	}).select('members')
		// }
	}

	const conversation = new Conversations(req.body)

	// Validating conversation
	const validationError = conversation.validateSync()
	if (validationError) return res
		.status(UNPROCESSABLE_ENTITY)
		.error(parseMongoError(validationError))

	try {

		const newConversation = await conversation.save()
		return res.success({
			conversation: newConversation
		})
	}
	catch (error) {
		return res.status(INTERNAL_SERVER_ERROR).error({
			message: error.message
		})
	}
})

export const findById = handleRequest(async (req, res) => {

	let find = createFindOne(Conversations, req, true)
	const conversation = await find
		.populate({
			path: 'messages',
			options: {
				limit: 1,
				sort: {
					createdAt: -1
				}
			}
		})
		.populate('members.user', 'username image')
		.exec()

	if (!conversation) return res.status(NOT_FOUND).error({
		message: `Conversation not found with id '${req.params._id}'`
	})

	return res.success(conversation)
})

export const deleteById = handleRequest(async (req, res) => {
	const deleteRes = await Conversations
		.deleteOne({ _id: req.params._id })
	return res.success(deleteRes)
})