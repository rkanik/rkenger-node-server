import mongoose from 'mongoose'
import { connectString, connectOptions } from './config'

const connect = async () => {
	try {
		await mongoose.connect(
			connectString,
			connectOptions
		)
		console.log('Database 	: Connected')
	}
	catch (error) {
		console.log('Database	: Connection failed')
		console.log('Database	:', error.message)
	}

}

export default {
	connect
}