import { Server } from 'socket.io'
import { Server as HTTPServer } from 'http'

export const createSocket = (server: HTTPServer) => {

	const io: Server = require('socket.io',)(server, {
		cors: {
			origin: "http://localhost:3000",
			methods: ["GET", "POST"],
			credentials: true
		}
	})

	io.on('connection', (socket) => {
		console.log('Socket:Connected 		:', socket.id)


		socket.on('disconnect', reason => {
			console.log('Socker:Disconnected 		:', reason)
		})
	})


	return io
}
