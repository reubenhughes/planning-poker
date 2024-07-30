require("dotenv").config();

const cors = require("cors");
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const app = express();

// routes
const sessionRoutes = require("./routes/sessions");

app.use(cors())
app.use(express.json());
app.use("/api/sessions", sessionRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(3001, () => {
    console.log("Connected to database and listening on port 3001.");
  });
}).catch(err => {
  console.error('Database connection error:', err);
});
