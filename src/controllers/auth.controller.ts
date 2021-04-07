import errors from '@errors'
import Users from '@models/users'
import statusCodes from 'http-status-codes'
import { NextFunction, Request, Response } from 'express'
import { VerifyFunction } from 'passport-local'
import { IUserDoc, TOr } from '@types'
import { _time } from '@consts'
import {
	handleRequest,
	HTTPError,
	parseMongoError,
	password as bPassword,
	token,
	object
} from '@helpers'

const {
	NOT_FOUND,
	UNPROCESSABLE_ENTITY,
	CREATED,
	INTERNAL_SERVER_ERROR,
	UNAUTHORIZED
} = statusCodes

export const logIn: VerifyFunction = async (username: string, password: string, done) => {

	const fields = ['username', 'email', 'phone']
	const condition = fields.reduce((condition, field) => {
		condition.$or.push({ [field]: username })
		return condition
	}, { $or: [] } as TOr<string>)

	const user = await Users.findOne(condition).select('name role password')
	if (!user) return done(new HTTPError(NOT_FOUND, 'Invalid username | email | phone.'))

	if (!user.password) return done(new HTTPError(UNAUTHORIZED, 'You didn\'t set a password. Please try login with your social account.'))
	else if (!await bPassword(user.password).compare(password)) return done(new HTTPError(UNAUTHORIZED, 'Incorrect Password.'))

	return done(null, object(user).partial('_id', 'role', 'name'))
}

export const onLoggedIn = handleRequest(async (req, res, oRes) => {
	if (!req.user) return res.error({ message: 'Something bad happended.' })
	const user: IUserDoc = req.user as IUserDoc

	const accessToken = token.generate(object(user).partial('_id', 'role', 'name'))
	oRes.cookie('access-token', accessToken, { maxAge: _time.day * 7 })

	return res.success({
		user,
		accessToken,
		expiresIn: _time.day * 7
	})
})

export const verifyAuth = async (req: Request, res: Response, next: NextFunction) => {
	const isAuth = req.isAuthenticated()
	const accessToken = req.cookies['access-token']
	const decodedToken = await token.verify(req.cookies['access-token'])
	if (isAuth && decodedToken) return res.json({
		user: req.user, accessToken,
		expiresIn: decodedToken.exp
	})
	return next()
}

export const signup = handleRequest(async (req, res) => {

	let error

	if (!req.body.password) error = errors.required('Password')
	else if (!req.body.confirmPassword) error = errors.required('Confirm Password')
	else if (req.body.password !== req.body.confirmPassword) error = errors.notMatched('Password')

	if (error) return res.status(UNPROCESSABLE_ENTITY).error(error)

	delete req.body.confirmPassword
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

export const signout = handleRequest(async (req, res) => {
	req.logout();
	return res.success({
		message: 'Successfully logged out.'
	})
})
