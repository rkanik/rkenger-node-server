import { Router } from 'express'
import { ConversationsController } from '@controllers'
import { verifyToken } from '@middlewares'

const router = Router()

router.route('/')
	.get(verifyToken, ConversationsController.findAll)
	.post(verifyToken, ConversationsController.create)

router.route('/:_id')
	.get(ConversationsController.findById)
	// 	.put(UserController.updateById)
	// 	.patch(UserController.updateById)
	.delete(ConversationsController.deleteById)

router.route("/:_cid/messages")
	.get()
	.post()

export default router