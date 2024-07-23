require("dotenv").config();

const cors = require("cors");
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const app = express();

// routes
const sessionRoutes = require("./routes/sessions");

app.use(cors());
app.use(express.json());
app.use("/api/sessions", sessionRoutes);

// creates the server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://planning-poker-frontend-nu.vercel.app",
    methods: ["GET", "POST"],
  },
});

// handles web socket messages
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data.room);
    console.log(`User ${data.name} joined room: ${data.room}`);
    socket.to(data.room).emit("user_joined", data);
  });
  socket.on("select_vote", (data) => {
    console.log(`User ${data.userID} has voted`);
    socket.to(data.room).emit("user_voted", data);
  });
  socket.on("leave_room", (data) => {
    console.log(`User ${data.username} left room: ${data.room}`);
    socket.to(data.room).emit("user_left", data);
    socket.leave(data.room);
  });
  socket.on("show_votes", (data) => {
    console.log("Showing votes");
    socket.to(data.room).emit("votes_shown");
  });
  socket.on("reset_votes", (data) => {
    console.log("Resetting votes");
    socket.to(data.room).emit("votes_reset");
  });
  socket.on("kick_user", (data) => {
    console.log("Kicking user");
    socket.to(data.room).emit("user_kicked", data);
  });
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  server.listen(3001, () => {
    console.log("Connected to database and listening on port 3001.");
  });
});
