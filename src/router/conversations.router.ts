import { Router } from 'express'
import { ConversationsController, MessagesController } from '@controllers'
import { verifyToken } from '@middlewares'

const router = Router()

router.use(verifyToken)

router.route('/')
	.get(ConversationsController.findAll)
	.post(ConversationsController.create)

router.route('/:_id')
	.get(ConversationsController.findById)
	// 	.put(UserController.updateById)
	// 	.patch(UserController.updateById)
	.delete(ConversationsController.deleteById)

// MESSAGES
router.route("/:id/messages")
	.get(MessagesController.find)
	.post(MessagesController.send)

router.route("/:convId/messages/:messageId")
	.get(MessagesController.findById)
	.patch(MessagesController.updateById)
	.delete(MessagesController.deleteById)

router.route("/:convId/messages/:messageId/unsent")
	.delete(MessagesController.unsentById)

export default router