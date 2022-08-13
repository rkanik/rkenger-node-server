import { ConnectOptions } from 'mongoose'

import { _mongodbConnectionString } from '../../consts'

export const connectString = _mongodbConnectionString
export const connectOptions: ConnectOptions = {
	useCreateIndex: true,
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: true,
}
