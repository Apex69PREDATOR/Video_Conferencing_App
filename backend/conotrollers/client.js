import { io } from "socket.io-client";

const socket = io("ws://localhost:5000"); // or http://localhost:5000

socket.on("connect", () => {
  console.log("Connected to server:", socket.id);
});
socket.emit("join-call",{path:'jh2wkjrf'})
socket.emit("chat-message",{data:"hello from client"})
socket.on("disconnect", () => {
  console.log("Disconnected");
});
