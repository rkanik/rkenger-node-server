import { NextFunction, Response, Request } from "express";
import { HTTPError } from "../helpers";

export const handleError = (
	err: HTTPError, req: Request,
	res: Response,
	next: NextFunction
) => {
	if (res.headersSent) { return next(err) }
	const { statusCode, statusText, message } = err;
	res.status(statusCode).json({
		error: true,
		statusCode,
		statusText,
		message
	});
};