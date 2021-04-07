require('dotenv').config()
import 'module-alias/register'

import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import path from 'path'
import passport from './auth/passport'
import router from './router'
import { createSocket } from './socket';
import { createServer } from 'http'

import { app, _baseUrl, _isProd, _port, _sessionSecret } from './consts';

import { mongodb } from './database'
import { handleError } from './middlewares/error.middleware';

const publicPath = _isProd
	? path.join(__dirname, '/public')
	: path.join(__dirname, '../client/dist')

const httpServer = createServer(app);
const socket = createSocket(httpServer)

// socket.use()

app.use('/', express.static(publicPath))

app.use(cors());
app.use(helmet());
app.use(cookieParser())

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: _sessionSecret
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(router)

app.use(handleError);

const startServer = async () => {
	httpServer.listen(_port, async () => {

		console.log('Dir 		:', __dirname)
		console.log('Mode		:', app.get('env'))
		console.log('Server		: Running')
		console.log('URL 		:', _baseUrl)

		await mongodb.connect()
	})
}

startServer().catch(err => {
	console.log('Server Error:', err.message)
})