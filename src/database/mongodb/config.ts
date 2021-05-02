import mongoose from 'mongoose'

import { _mongodbConnectionString } from '../../consts'

export const connectString = _mongodbConnectionString
export const connectOptions: mongoose.ConnectOptions = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: true
}
