const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const todosRoutes = require("./routes/todosRoutes");
const statusesRoutes = require("./routes/statusRoutes");
const noteRoutes = require("./routes/noteRoutes");
const meetingRoutes = require("./routes/meetingRoutes");
const tagRoutes = require("./routes/tagRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const priorityRoutes = require("./routes/priorityRoutes");
const logRoutes = require("./routes/LogRoutes");
const port = 5000;

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

// Routes
app.use(
  "/",
  projectRoutes,
  taskRoutes,
  userRoutes,
  todosRoutes,
  statusesRoutes,
  noteRoutes,
  meetingRoutes,
  tagRoutes,
  paymentRoutes,
  priorityRoutes,
  logRoutes
);

app.get("/", (req, res) => {
  res.send("Hello From Taskify!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
