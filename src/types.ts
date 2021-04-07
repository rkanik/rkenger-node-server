import { Request } from 'express'
import { Model, Document, Types } from "mongoose"
import { response } from '@helpers'

export type TModel = Model<Document<any>>

export interface IResponse {
	code: number;
	data?: { [key: string]: any },
	error?: IError;
}
export type ExecuteFunction = (req: Request, res: typeof response) => Promise<IResponse>
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

export type TId = Types.ObjectId
export type TMessageType = keyof typeof EMessageTypes
export type TRoles = keyof typeof ERoles
export type TProviders = keyof typeof EProviders
export type TGender = keyof typeof EGenders
export type Select<M, K extends keyof M> = Pick<M, K> & Document
export type Populated<M, K extends keyof M> =
	Omit<M, K> & {
		[P in K]: Exclude<M[P], TId[] | TId>
	}

export interface IImageDoc extends IImage, Document { }
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

export interface IForeignUser {
	_id: TId
	name: string
	thumb?: string
}

export interface IFriend extends IForeignUser {
	acceptedAt: Date
}

export interface IMember extends IForeignUser {
	addedBy: IForeignUser
}

export interface IUser {
	name: string
	email: string
	role: TRoles
	username: string
	emailVerified: boolean
	provider: TProviders
	friends: TId[] | IUserDoc[]

	image?: IImage
	externalId?: string
	password?: string
	phone?: string
	gender?: TGender
	dob?: Date
}
export interface IUserDoc extends IUser, Document { }

export interface IMessage {
	type: TMessageType
	seenBy: TId[]
	sender: IForeignUser

	text?: string
	image?: IImage
	video?: IVideo
	link?: string
	voice?: IVoice
	isReply?: boolean
	deletedAt?: Date
}

export interface IConversation {
	color: string
	emoji: string
	mutedBy: TId[]
	members: IMember[]
	messages: IMessage[]

	name?: string
	image?: IImage
}

export interface IGroup extends IConversation { }

export interface IError {
	message: string
	errors?: any
}
