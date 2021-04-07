import bcrypt from 'bcrypt'
import { getReasonPhrase } from 'http-status-codes'

import { NextFunction, Request, Response } from 'express'
import { ExecuteFunction, IError, IResponse } from '@types'
import { Query, Document } from 'mongoose'

export const isEmpty = (val: any) => {
	if (Array.isArray(val) && !val.length) return true
	if (typeof val === 'object' && !Object.keys(val).length) return true
	return [undefined, null, NaN, ''].includes(val)
}

export const comparePassword = (encrypted: string, data: string) => {
	console.log('comparePassword', encrypted, data)
	return new Promise(resolve => {
		bcrypt.compare(data, encrypted, (_, same: boolean) => {
			return resolve(same)
		});
	})
}

export class HTTPError extends Error {
	statusCode: number
	statusText: string
	message: string
	constructor(code: number, message: string) {
		super();
		this.message = message
		this.statusCode = code
		this.statusText = getReasonPhrase(this.statusCode)
	}
}

export const toError = (
	code: number,
	message?: string,
	errors?: any
) => {
	return {
		error: true,
		statusCode: code,
		message,
		errors
	}
}

export function error() {
	let res = {} as {
		code: number,
		error: IError
	}
	return {
		code(code: number) {
			res.code = code
			return this
		},
		error(err: IError) {
			res.error = { ...err }
			return res
		}
	}
}

export const toSuccess = (data: any, message?: string) => {
	return {
		...data,
		message,
		error: false,
	}
}

export const response = (() => {
	const toError = (error: IError, code: number = 500) => ({ code, error })
	const toSuccess = (data: any, code: number = 200) => ({ code, data })
	return {
		status(code: number) {
			return {
				error: (error: IError) => toError(error, code),
				success: (data: any) => toSuccess(data, code)
			}
		},
		error: (error: IError) => toError(error),
		success: (data: any) => toSuccess(data)
	}
})()

export const handleRequest = (execute: ExecuteFunction) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Executing the request
			const { error, code, data }: IResponse = await execute(req, response)

			// Throwing error 
			if (error) {
				if (error.errors) return res.status(code).json(error)
				throw new HTTPError(code, error.message)
			}

			// Sending success response
			return res.status(code).json(data)
		}
		catch (err) {
			console.log(err)
			return next(err)
		}
	}

export const createFind = (Model: any, query: any): {
	page: number,
	limit: number,
	find: Query<Document<any>[], Document<any>>,
	count: Query<number, Document<any>>,
} => {

	// Conditions
	let filter: any = {}
	if (query.role) filter.role = query.role

	// Search
	let hasQ = query.q && query.q !== ''
	if (hasQ) filter.$text = { $search: query.q }

	if (query.where) {
		let where = JSON.parse(query.where)
		filter = { ...filter, ...where }
	}

	let find = Model.find(filter)

	// Sorting
	let sort: any = {}
	if (query.sort) sort[query.sort.replace('-', '')] = query.sort.startsWith('-') ? -1 : 1
	find = find.sort(isEmpty(sort) ? { createdAt: -1 } : sort)

	// Pagination
	let page = query.page ? query.page * 1 : 1
	let limit = query.limit ? query.limit * 1 : 15
	let skip = (page - 1) * limit
	find = find.skip(skip).limit(limit)

	// Projection
	let select = query.select ? query.select.replace(/,/g, ' ') : '-__v'

	find = find.select(select)
	const count = Model.countDocuments(filter)

	return { find, count, page, limit }

}

export const parseMongoError = (errObject: any) => {
	if (!errObject) return {
		message: 'No Error'
	}
	return {
		message: errObject.message,
		errors: Object
			.entries(errObject.errors)
			.reduce((acc, [key, val]: [string, any]) => {
				return {
					...acc,
					[key]: val.message
				}
			}, {})
	}
}