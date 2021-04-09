import { Router } from 'express'
import { UsersController } from '@controllers'
import { verifyToken } from '@middlewares'

const router = Router()

router.route('/')
	.get(verifyToken, UsersController.findAll)
	.post(verifyToken, UsersController.create)

router.route('/:_id')
	.get(UsersController.findById)
	.put(UsersController.updateById)
	.patch(UsersController.updateById)
	.delete(UsersController.deleteById)

router.route('/send-request')

export default router