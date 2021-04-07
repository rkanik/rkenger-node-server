import mongoose, { Schema } from 'mongoose'
import { IImage, IImageDoc } from '@types'

const imagesSchemaFields: Record<keyof IImage, any> = {
	title: {
		type: String,
		required: true
	},
	url: {
		type: String,
		required: true
	},
	thumb: {
		type: String,
		required: true
	},
	extension: {
		type: String,
		required: true
	},
	size: {
		type: [String, Number],
		required: true
	}
}

const imageSchema = new Schema(imagesSchemaFields)

const Images = mongoose.model<IImageDoc>('Image', imageSchema)
export default Images