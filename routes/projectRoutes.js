const express = require("express");
const {
  getDashboardCount,
  updateProject,
  deleteProject,
  getAllProjects,
} = require("../controllers/projectController");

const router = express.Router();

router.get("/dashboardCount", getDashboardCount);
router.get("/projects", getAllProjects);
router.put("/projects/:id", updateProject);
router.delete("/projects/:id", deleteProject);

module.exports = router;
