import { Router } from 'express'
import { ConversationsController, MessagesController } from '@controllers'
import { verifyToken } from '@middlewares'

const router = Router()

router.route('/')
	.get(verifyToken, ConversationsController.findAll)
	.post(verifyToken, ConversationsController.create)

router.route('/:_id')
	.get(verifyToken, ConversationsController.findById)
	// 	.put(UserController.updateById)
	// 	.patch(UserController.updateById)
	.delete(verifyToken, ConversationsController.deleteById)

router.route("/:_cid/messages")
	.get(verifyToken, MessagesController.findAll)
	.post(verifyToken, MessagesController.create)

export default router