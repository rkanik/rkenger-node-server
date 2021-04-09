import { Conversations, Messages } from '@models'
import { handleRequest, isEmpty } from "@helpers";
import { IUserDoc } from '@types';

export const findAll = handleRequest(async (req, res) => {
	const conversation = await Conversations
		.findById(req.params.cid).select('messages')
		.populate({
			path: 'messages',
			options: {
				limit: 15,
				sort: { createdAt: -1 },
			}
		})

	return res.success(conversation)
})

export const create = handleRequest(async (req, res) => {

	
	const user = req.user as IUserDoc
	req.body.sender = user._id
	
	const message = new Messages(req.body)
	
	// if(isEmpty(req.body[req.body.type]))

	const conversation = await Conversations
		.findById(req.params.cid).select('messages')
		.populate({
			path: 'messages',
			options: {
				limit: 15,
				sort: { createdAt: -1 },
			}
		})

	return res.success(conversation)
})