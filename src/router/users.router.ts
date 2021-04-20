import { Router } from 'express'
import { UsersController } from '@controllers'
import { verifyToken } from '@middlewares'

const router = Router()

router.route('/')
	.get(verifyToken, UsersController.findAll)
	.post(verifyToken, UsersController.create)
	
router.route('/requests')
	// .get(verifyToken,UsersController)

router.route('/:_id')
	.get(verifyToken, UsersController.findById)
	.put(verifyToken, UsersController.updateById)
	.patch(verifyToken, UsersController.updateById)
	.delete(verifyToken, UsersController.deleteById)


export default router