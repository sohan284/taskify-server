const express = require("express");
const {
  getDashboardCount,
  updateProject,
  deleteProject,
  getAllProjects,
  createProject,
  getAllFavouriteProjects,
} = require("../controllers/projectController");
const { createTask, getAllTasks, updateTask, deleteTask } = require("../controllers/taskController");

const router = express.Router();

router.get("/dashboardCount", getDashboardCount);
router.post("/projects", createProject);
router.get("/projects", getAllProjects);
router.get("/projects/favourite", getAllFavouriteProjects);
router.put("/projects/:id", updateProject);
router.delete("/projects/:id", deleteProject);

router.post("/tasks", createTask);
router.get("/tasks", getAllTasks);
router.put("/tasks/:id", updateTask);
router.delete("/tasks/:id", deleteTask);

module.exports = router;
