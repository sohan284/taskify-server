const express = require("express");
const {
  getDashboardCount,
  updateProject,
  deleteProject,
  getAllProjects,
  createProject,
  getAllFavouriteProjects,
} = require("../controllers/projectController");

const router = express.Router();

router.get("/dashboardCount", getDashboardCount);
router.post("/projects", createProject);
router.get("/projects", getAllProjects);
router.get("/projects/favourite", getAllFavouriteProjects);
router.put("/projects/:id", updateProject);
router.delete("/projects/:id", deleteProject);

module.exports = router;
