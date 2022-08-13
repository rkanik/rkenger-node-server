import { Router } from 'express'
import { UsersController } from '@controllers'
import { verifyToken } from '@middlewares'

const router = Router().use(verifyToken)

router.route('/')
	.get(UsersController.findAll)
	.post(UsersController.create)

router.route('/requests')
// .get(verifyToken,UsersController)

router.route('/:_id')
	.get(UsersController.findById)
	.put(UsersController.updateById)
	.patch(UsersController.updateById)
	.delete(UsersController.deleteById)

router.post('/:id/request', UsersController.sendRequest)

export default router