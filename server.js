import { Server } from "socket.io";
import app from "./app.js";

const httpServer = app.listen(3000, () => {
  console.log("Server is running. Use our API on port: 3000");
});

// socket.io
export const io = new Server(httpServer, { cors: { origin: "*" } });

// Odata conectat
io.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected`);

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });

  socket.on("chat-txt", (data) => {
    // socket.emit -> va trimite la toti clientii conectacti
    // socket.broadcast.emit -> va trimite la toti clientii, inafara de cel care a apelat socket.emit()
    socket.broadcast.emit("chat-text-received", data);
  });

  socket.on("Product-added", (data) => {
    socket.broadcast.emit("product-added", data);
  });
});
