import { Router } from 'express'
import { usersController } from '../controllers/users'

const router = Router()

router.route('/')
	.get(usersController.getAll)
	.post(usersController.create)

router.route('/:_id')
// .delete(user.delete)

export default router