import socketIO from "socket.io";
import http from "http";

export let io: socketIO.Server;

export function attachServer(server: http.Server) {
  io = new socketIO.Server(server);
  io.on("connection", (socket) => {
    console.log("socket connected:", socket.id);
    socket.on("join-room", (id) => {
      console.log("join:", id);

      socket.join("room:" + id);
    });
    socket.on("disconnect", () => {
      console.log("socket disconnected:", socket.id);
    });
  });
}
