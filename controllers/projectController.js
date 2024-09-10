const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

// Get dashboard count
const getDashboardCount = async (req, res) => {
  try {
    const dashboardCountCollection =
      getDB("taskify").collection("dashboardCount");
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
const createProject = async (req, res) => {
  try {
    const projectData = req.body;

    // Get the database and collection
    const projectsCollection = getDB("taskify").collection("projects");

    // Insert the new project
    const result = await projectsCollection.insertOne(projectData);

    // Respond with the created project
    res.status(201).json({
      success: true,
      data: { _id: result.insertedId, ...projectData }, // Return the inserted project with the ID
      message: "Project created successfully",
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create project",
      error: error.message,
    });
  }
};

// Update a project
const updateProject = async (req, res) => {
  const projectId = req.params.id;
  const { status, ...updateFields } = req.body;

  // Define allowed status values
  const allowedStatuses = ["default", "started", "on going", "in review"];

  // Check if the status is valid
  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status value: ${status}. Allowed values are: ${allowedStatuses.join(
        ", "
      )}`,
    });
  }

  try {
    const projectsCollection = getDB("taskify").collection("projects");

    // Prepare the update object
    const updateObject = { $set: { ...updateFields } };
    if (status) {
      updateObject.$set.status = status;
    }

    const result = await projectsCollection.updateOne(
      { _id: new ObjectId(projectId) },
      updateObject
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
    const result = await projectsCollection.deleteOne({
      _id: new ObjectId(projectId),
    });

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
  createProject,
  getAllProjects,
  updateProject,
  deleteProject,
};
