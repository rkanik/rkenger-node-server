import status, { StatusCodes } from 'http-status-codes'
import { Users } from '../models'
import { handleRequest, parseMongoError, toError, toSuccess } from '@helpers'
import { createFind } from '@helpers'
import { IUserDoc, Populated } from '@types'

const { OK, UNPROCESSABLE_ENTITY, CREATED, INTERNAL_SERVER_ERROR } = StatusCodes

export const usersController = {
	getAll: handleRequest(async (req, res) => {
		const { find, count, page, limit } = createFind(Users, req.query)

		const total = await count
		const users = await find
			.populate('friends.friend')
			.populate('image')

		return res.success({
			pagination: {
				total,
				page,
				limit,
			},
			users
		})
	}),
	create: handleRequest(async (req, res) => {

		const user = new Users(req.body)

		const validationError = user.validateSync()
		if (validationError) {
			const error = parseMongoError(validationError)
			return res.status(UNPROCESSABLE_ENTITY).error(error)
		}
		try {
			const newUser = await user.save()
			return res.status(CREATED).success({
				user: newUser,
				message: 'User has been registered successfully.'
			})
		}
		catch (error) {
			if (error.message && error.message.startsWith('E11000')) {
				return res.status(UNPROCESSABLE_ENTITY).error({
					message: 'Username already in use.',
					errors: {
						username: 'Username not available.'
					}
				})
			}
			return res.status(INTERNAL_SERVER_ERROR).error(error.message)
		}
	})
}

export const userController = {
	get: handleRequest(async (req, res) => {
		const users = await Users.findOne({ _id: req.params.id })
			.populate('friends')
			.populate('image') as Populated<IUserDoc, 'friends' | 'image'>
		return res.status(OK).success({
			users
		})
	})
}

// const users = {
// 	get: handleRequest(async (req: Request) => {

// 		const { find, count, limit, page } = createFind(Users, req.query)
// 		const users = await find
// 		const total = await count

// 		return toSuccess({
// 			users,
// 			pagination: {
// 				page,
// 				limit,
// 				total,
// 				length: users.length,
// 			},
// 		})
// 	}),
// 	create: handleRequest(async (req) => {

// 		return toSuccess({
// 			message: 'User has been created successfully!'
// 		})
// 	})
// }

// const user = {
// 	delete: handleRequest(async req => {

// 		let data = await Users.deleteOne({
// 			_id: req.params._id
// 		})

// 		if (data.deletedCount === 0)
// 			return toError(
// 				status.INTERNAL_SERVER_ERROR,
// 				'Error deleting user!'
// 			)

// 		return toSuccess({
// 			ok: data.ok,
// 			deletedCount: data.deletedCount
// 		})
// 	})
// }

// export { user, users }