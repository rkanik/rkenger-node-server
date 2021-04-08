import { Router } from 'express'
import { UserController } from '@controllers'
import { verifyToken } from '@middlewares'

const router = Router()

router.route('/')
	.get(verifyToken, UserController.findAll)
	.post(verifyToken, UserController.create)

router.route('/:_id')
	.get(UserController.findById)
	.put(UserController.updateById)
	.patch(UserController.updateById)
	.delete(UserController.deleteById)

router.route('/send-request')

export default router