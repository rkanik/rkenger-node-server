import { isEmpty } from '@helpers'
import { TModel, IUser, IQuery } from '@types'


interface IOptions { user: IUser, query: IQuery }
export const createFind = (Model: TModel, { query }: IOptions) => {

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
	return find
}

import * as auth from './auth.controller'

export { auth }