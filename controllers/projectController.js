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
const getAllFavouriteProjects = async (req, res) => {
  try {
    const projectsCollection = getDB("taskify").collection("projects");
    // Filter projects where favourite is true
    const result = await projectsCollection.find({ favourite: true }).toArray();

    // Check if no favourite projects are found
    if (result.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No favourite projects found",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: "Favourite projects retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching favourite projects:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch favourite projects",
      message: error.message,
    });
  }
};

const createProject = async (req, res) => {
  try {
    const projectData = req.body;
    const projectsCollection = getDB("taskify").collection("projects");
    const result = await projectsCollection.insertOne(projectData);
    res.status(201).json({
      success: true,
      data: { _id: result.insertedId, ...projectData },
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
  const { status, favourite, ...updateFields } = req.body;
  const projectsCollection = getDB("taskify").collection("projects");

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

  // Validate the favourite field (optional)
  if (typeof favourite !== "undefined" && typeof favourite !== "boolean") {
    return res.status(400).json({
      success: false,
      message:
        "Invalid value for favourite. It must be a boolean (true or false).",
    });
  }

  try {
    // Combine the fields to update, including status and favourite
    const result = await projectsCollection.findOneAndUpdate(
      { _id: new ObjectId(projectId) }, // Find the project by ID
      { $set: { ...updateFields, status, favourite } }, // Update fields
      { returnDocument: "after" } // Return the updated document
    );

    const updatedProject = result.value;

    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updatedProject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the project",
      error: error.message,
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
  getAllFavouriteProjects,
};
