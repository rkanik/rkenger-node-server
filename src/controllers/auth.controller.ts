import errors from '@errors'
import statusCodes from 'http-status-codes'
import { Users, RefreshTokens } from '@models'
import { VerifyFunction } from 'passport-local'
import { NextFunction, Request, Response } from 'express'
import { IRefreshTokenDoc, IUserDoc, TOr } from '@types'
import { _time } from '@consts'
import {
	token,
	object,
	isEmpty,
	HTTPError,
	handleRequest,
	parseMongoError,
	password as bPassword,
} from '@helpers'

const {
	CREATED,
	NOT_FOUND,
	UNAUTHORIZED,
	UNPROCESSABLE_ENTITY,
	INTERNAL_SERVER_ERROR,
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

	let refreshToken
	const accessToken = token.generate(object(user).partial('_id', 'role', 'name'))
	const eRefreshToken = await RefreshTokens.findOne({ user: user._id })

	if (eRefreshToken) refreshToken = eRefreshToken.token
	else {
		refreshToken = token.generate({ user: { _id: user._id } }, '100y')
		RefreshTokens.create({ user: user._id, token: refreshToken })
	}

	oRes.cookie('user-id', user._id, { maxAge: _time.day * 7 })
	oRes.cookie('access-token', accessToken, { maxAge: _time.day * 7 })
	oRes.cookie('refresh-token', refreshToken, { maxAge: _time.year * 100 })

	return res.success({
		user,
		accessToken,
		refreshToken,
		expiresIn: _time.day * 7
	})
})

export const verifyAuth = async (req: Request, res: Response, next: NextFunction) => {
	const isAuth = req.isAuthenticated()
	const accessToken = req.cookies['access-token']
	const refreshToken = req.cookies['refresh-token']
	const decodedToken = await token.verify(req.cookies['access-token'])
	if (isAuth && decodedToken) return res.json({
		user: req.user,
		accessToken, refreshToken,
		expiresIn: decodedToken.exp
	})
	return next()
}

export const isAuthenticated = handleRequest(async (req, res) => {
	if (req.isAuthenticated()) return res.success({ message: 'Authenticated' })
	return res.status(UNAUTHORIZED).error({ message: 'Unauthorized' })
})

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

export const newToken = handleRequest(async (req, res, oRes) => {
	if (isEmpty(req.body) || !req.body.refreshToken) return res.status(UNPROCESSABLE_ENTITY).error({
		message: 'Request body must have a refresh token'
	})

	let refreshToken = await RefreshTokens
		.findOne({ token: req.body.refreshToken })
		.populate({ path: 'user', select: 'name role' }) as IRefreshTokenDoc

	if (!refreshToken) return res.status(NOT_FOUND).error({ message: 'Refresh Token not found' })
	const decodedToken = await token.verify(refreshToken.token)
	if (!decodedToken) return res.status(UNAUTHORIZED).error({ message: 'Refresh token has been expired.' })


	const user = refreshToken.user as IUserDoc
	const accessToken = token.generate(object(user).partial('_id', 'role', 'name'))

	oRes.cookie('user-id', user._id, { maxAge: _time.day * 7 })
	oRes.cookie('access-token', accessToken, { maxAge: _time.day * 7 })
	oRes.cookie('refresh-token', refreshToken.token, { maxAge: new Date(refreshToken.createdAt).getTime() - Date.now() })

	return res.success({
		user,
		accessToken,
		refreshToken: refreshToken.token,
		expiresIn: _time.day * 7
	})

})

export const signout = handleRequest(async (req, res) => {
	req.logout();
	return res.success({
		message: 'Successfully logged out.'
	})
})

export const updatePassword = handleRequest(async (req, res) => {
	
	return res.success({
		//
	})
})

export const resetPassword = handleRequest(async (req, res) => {
	
	return res.success({
		//
	})
})

export const sendPasswordResetEmail = handleRequest(async (req, res) => {
	
	return res.success({
		//
	})
})