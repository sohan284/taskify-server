const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

// Get dashboard count
const getDashboardCount = async (req, res) => {
  try {
    const dashboardCountCollection = getDB("taskify").collection("dashboardCount");
    const result = await dashboardCountCollection.find().toArray();
    res.status(200).json({
      success: true,
      data: result,
      message: "Dashboard counts retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching dashboardCount:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch dashboardCount",
      message: error.message,
    });
  }
};

// Get all projects
const getAllProjects = async (req, res) => {
  try {
    const projectsCollection = getDB("taskify").collection("projects");
    const result = await projectsCollection.find().toArray();
    res.status(200).json({
      success: true,
      data: result,
      message: "Projects retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch projects",
      message: error.message,
    });
  }
};

// Update a project
const updateProject = async (req, res) => {
  const projectId = req.params.id;
  const updatedData = req.body;
  const { _id, ...updateFields } = updatedData;

  try {
    const projectsCollection = getDB("taskify").collection("projects");
    const result = await projectsCollection.updateOne(
      { _id: new ObjectId(projectId) },
      { $set: updateFields }
    );

    if (result.modifiedCount === 1) {
      res.status(200).json({
        success: true,
        message: "Project updated successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Project not found or no changes made",
      });
    }
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update project",
      message: error.message,
    });
  }
};

// Delete a project
const deleteProject = async (req, res) => {
  const projectId = req.params.id;

  try {
    const projectsCollection = getDB("taskify").collection("projects");
    const result = await projectsCollection.deleteOne({ _id: new ObjectId(projectId) });

    if (result.deletedCount === 1) {
      res.status(200).json({
        success: true,
        message: "Project deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete project",
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardCount,
  getAllProjects,
  updateProject,
  deleteProject,
};
