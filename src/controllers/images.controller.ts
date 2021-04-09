import { Conversations } from '@models'
import { handleRequest } from "@helpers";

export const findAll = handleRequest(async (req, res) => {
	let conversations = await Conversations
		.find({})
		.populate({
			path: 'message',
			options: {
				limit: 1,
				sort: { createdAt: -1 },
			}
		})

	return res.success({
		conversations
	})
})