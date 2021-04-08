import { Request, Response } from 'express'
import { Model, Document, Types } from "mongoose"
import { response } from '@helpers'

export type TModel = Model<Document<any>>

export interface IResponse {
	code: number;
	data?: { [key: string]: any },
	error?: IError;
}
export type ExecuteFunction = (req: Request, res: typeof response, oRes: Response) => Promise<IResponse>
export type TResponseFunc = {
	status(code: number): {
		error(error: IError): {
			code: number
			error: IError
		};
		success(data: any): {
			code: number
			data: any
		}
	}
}

export interface IQuery {
	q?: string
	select?: string
	where?: string
	sort?: string
	role?: string
	page?: number
	limit?: number
}

export enum EMessageTypes {
	Text = 'text',
	Voice = 'voice',
	Image = 'image',
	Link = 'link',
	Video = 'video'
}

export enum ERoles {
	User = 'user',
	Admin = 'admin'
}

export enum EProviders {
	Local = 'local',
	Google = 'google',
	Github = 'github'
}

export enum EGenders {
	Male = 'male',
	Female = 'female',
	Others = 'others'
}

export enum EColors {
	Gray = 'gray',
	Teal = 'teal',
	Blue = 'blue'
}

export type TId = Types.ObjectId
export type TMessageType = keyof typeof EMessageTypes
export type TRoles = keyof typeof ERoles
export type TProviders = keyof typeof EProviders
export type TGender = keyof typeof EGenders
export type TColor = keyof typeof EColors

export type TAnyObject<type> = { [key: string]: type }
export type TOr<type> = { $or: TAnyObject<type>[] }

export type Select<M, K extends keyof M> = Pick<M, K> & Document
export type Populated<M, K extends keyof M> =
	Omit<M, K> & {
		[P in K]: Exclude<M[P], TId[] | TId>
	}


/**
 * ===========================================================
 * === === === === === === Interfaces === === === === === ===
 * ===========================================================
 */

export interface IRefreshTokenDoc extends IRefreshToken, Document {
	_id: string
	createdAt: Date
	updatedAt: Date
}
export interface IRefreshToken {
	user: TId | IUserDoc,
	token: string
}

export interface IImageDoc extends IImage, Document {
	_id: string
	createdAt: Date
	updatedAt: Date
}
export interface IImage {
	title: string
	url: string
	thumb: string
	extension: string
	size: string | number
}

export interface IVideo extends IImage { }

export interface IVoice {
	url: string
}

export interface IUser {
	name: string
	email: string
	role: TRoles
	username: string
	emailVerified: boolean
	provider: TProviders
	friends: {
		friend: TId[] | IUserDoc[],
		acceptedAt: Date
	},
	requests: TId[] | IUserDoc[],

	image?: TId | IImage
	externalId?: string
	password?: string
	phone?: string
	gender?: TGender
	dob?: Date
}
export interface IUserDoc extends IUser, Document {
	_id: string
	createdAt: Date
	updatedAt: Date
}

export interface IMessageDoc extends IMessage, Document {
	createdAt: Date
	updatedAt: Date
}
export interface IMessage {
	type: TMessageType
	text?: string
	image?: IImage
	video?: IVideo
	link?: string
	voice?: {
		duration: number
		url: string
	}

	sender: TId | IUserDoc
	seenBy?: TId[] | IUserDoc[]
	replied?: {
		by: TId | IUserDoc,
		to: TId | IMessageDoc
	}
	forwardedBy?: TId | IUserDoc
	deletedBy?: TId[] | IUserDoc[]
	isUnsent?: boolean
}

export interface IConversationDoc extends IConversation, Document {
	createdAt: Date
	updatedAt: Date
}
export interface IConversation {
	color: TColor
	emoji: string
	isGroup: boolean
	createdBy: TId | IUserDoc
	mutedBy: {
		user: TId | IUserDoc
		unMuteAt?: Date
	}[]
	deletedBy: TId | IUserDoc
	members: {
		user: TId[] | IUserDoc[]
		addedBy: TId | IUserDoc
		removedAt?: Date
	}[]
	messages: TId[] | IMessageDoc[]

	name?: string
	image?: IImage
}

export interface IError {
	message: string
	errors?: any
}
