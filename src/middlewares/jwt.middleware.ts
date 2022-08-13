import jwt from "jsonwebtoken"
import statusCodes from 'http-status-codes'

import { NextFunction, Request, Response } from "express"
import { HTTPError } from '@helpers'
import { _jwtSecret } from "@consts"

const { FORBIDDEN, UNAUTHORIZED } = statusCodes

export const verifyToken = (req: Request, _: Response, next: NextFunction) => {
	let token = (req.header("access-token") || req.query['access-token'] || req.header('Authorization')) as string
	if (!token) { throw new HTTPError(UNAUTHORIZED, "Access denied. Unauthorized access!") }
	if (token.startsWith('Bearer')) token = token.replace('Bearer ', '')
	jwt.verify(token, _jwtSecret, (err, decoded) => {
		if (err) throw new HTTPError(FORBIDDEN, err.message)
		if (!req.user) req.user = decoded
		next()
	})
}