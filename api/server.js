const express = require("express");
const cors = require("cors");
const { connectDB } = require("../config/db");
const projectRoutes = require("../routes/projectRoutes");
const taskRoutes = require("../routes/taskRoutes");
const userRoutes = require("../routes/userRoutes");
const todosRoutes = require("../routes/todosRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/", projectRoutes, taskRoutes, userRoutes, todosRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("Hello From Taskify!");
});

// Export the Express app
module.exports = app;
