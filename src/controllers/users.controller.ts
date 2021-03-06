import StatusCodes from 'http-status-codes'
import { FriendRequest, Users } from '../models'
import { handleRequest, parseMongoError, toError, toSuccess } from '@helpers'
import { createFind } from '@helpers'
import { IUser, IUserDoc, Populated } from '@types'

const {
	OK,
	CREATED,
	UNPROCESSABLE_ENTITY,
	INTERNAL_SERVER_ERROR
} = StatusCodes

export const findAll = handleRequest(async (req, res) => {
	const { find, count, page, limit } = createFind(Users, req.query)

	const total = await count
	const users = await find
		.populate('friends.user')
		.populate('image')

	return res.success({
		pagination: {
			total,
			page,
			limit,
		},
		users
	})
})

export const create = handleRequest(async (req, res) => {

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

export const findById = handleRequest(async (req, res) => {
	const user = await Users.findById(req.params._id)
		.populate('friends')
		.populate('image') as Populated<IUserDoc, 'friends' | 'image'>
	return res.status(OK).success(user)
})

export const updateById = handleRequest(async (req, res) => {
	let deleteRes = await Users.updateOne({ _id: req.params._id }, req.body)
	return res.success({
		...deleteRes,
		message: 'Deleted'
	})
})

export const deleteById = handleRequest(async (req, res) => {
	let deleteRes = await Users.deleteOne({ _id: req.params._id })
	return res.success({
		...deleteRes,
		message: 'Deleted'
	})
})

export const sendRequest = handleRequest(async (req, res) => {
	// const user = req.user as IUserDoc
	// let user = await Users.findOneAndUpdate({
	// 	_id: user._id,
	// 	'requests.'
	// })

	return res.success(req.body)
})

export const getRequests = handleRequest(async (req, res) => {

	return res.success({
		//
	})
})

export const acceptRequest = handleRequest(async (req, res) => {

	return res.success({
		//
	})
})