import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import { _jwtSecret } from "@consts";
import { Users } from "@models";

let io: Server;

const User = {
  setOnline(_id: any, isOnline = true) {
    return Users.findOneAndUpdate(
      {
        _id,
      },
      {
        isOnline,
        lastSeen: new Date(),
      }
    );
  },
};

const initializeEvents = () => {
  io.on("connection", async (socket) => {
    const { _id, name } = socket.handshake.auth.user;
    console.log(`online :==> ${_id}(${name})`);

    // Update the user to online
    const user = await User.setOnline(_id);

    // @TODO: Only emit to the friends who is online
    socket.broadcast.emit("online", user);

    socket.on("disconnect", () => {
      // Update the user to offline
      User.setOnline(_id, false);

      // @TODO: Only emit to the friends who is online
      io.emit("offline", { _id });

      console.log(`offline <==: ${_id}(${name})`);
    });
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication required"));

    jwt.verify(token, _jwtSecret, (err: any) => {
      if (err) return next(new Error("Invalid Auth Token"));
      next();
    });
  });
};

const createSocket = (httpServer: HTTPServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  return io;
};

export { io, createSocket, initializeEvents };
