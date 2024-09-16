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

// all projects 

const getAllProjects = async (req, res) => {
  try {
    const { status, user , client ,start_date_from,start_date_to,end_date_from,end_date_to,search } = req.query; 
    const projectsCollection = getDB("taskify").collection("projects");

    const filter = {};
    if (status) filter["status.title"] = status;

    if (user) {
      if (!ObjectId.isValid(user)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID format",
        });
      }
      filter["users._id"] = (user);
    }

    if (client) {
      if (!ObjectId.isValid(client)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID format",
        });
      }
      filter["clients._id"] = (client);
    }

    // dates
    if (start_date_from || start_date_to) {
      filter.startsAt = {};
      if (start_date_from) {
        filter.startsAt.$gte = start_date_from; // Start date is greater than or equal to start_date_from
      }
      if (start_date_to) {
        filter.startsAt.$lte = start_date_to; // Start date is less than or equal to start_date_to
      }
    }

    // end  
    if (end_date_from || end_date_to) {
      filter.endsAt = {};
      if (end_date_from) {
        filter.endsAt.$gte = end_date_from; // Start date is greater than or equal to start_date_from
      }
      if (end_date_to) {
        filter.endsAt.$lte = end_date_to; // Start date is less than or equal to start_date_to
      }
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } }
      ];
    }

    const result = await projectsCollection.find(filter).toArray();

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
    const { status, user, client,start_date_from,start_date_to,end_date_from,end_date_to,search} = req.query; 
    const projectsCollection = getDB("taskify").collection("projects");

    const filter = { favourite: true }; // Filter for favourite projects

    
    if (status) filter["status.title"] = status;

    if (user) {
      if (!ObjectId.isValid(user)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID format",
        });
      }
      filter["users._id"] = (user);
    }

    if (client) {
      if (!ObjectId.isValid(client)) {
        return res.status(400).json({
          success: false,
          message: "Invalid client ID format",
        });
      }
      filter["clients._id"] = (client);
    }
    if (start_date_from || start_date_to) {
      filter.startsAt = {};
      if (start_date_from) {
        filter.startsAt.$gte = start_date_from; // Start date is greater than or equal to start_date_from
      }
      if (start_date_to) {
        filter.startsAt.$lte = start_date_to; // Start date is less than or equal to start_date_to
      }
    }

    // end  
    if (end_date_from || end_date_to) {
      filter.endsAt = {};
      if (end_date_from) {
        filter.endsAt.$gte = end_date_from; // Start date is greater than or equal to start_date_from
      }
      if (end_date_to) {
        filter.endsAt.$lte = end_date_to; // Start date is less than or equal to start_date_to
      }
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } }
      ];
    }

    const result = await projectsCollection.find(filter).toArray();

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

  // Validate the favourite field (optional)
  if (typeof favourite !== "undefined" && typeof favourite !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Invalid value for favourite. It must be a boolean (true or false).",
    });
  }

  // Construct the $set object dynamically based on provided fields
  const updateFieldsToSet = {};

  // Include only fields present in the request
  if (status !== undefined) {
    updateFieldsToSet.status = status;
  }

  if (favourite !== undefined) {
    updateFieldsToSet.favourite = favourite;
  }

  // Include other fields for update if provided
  Object.entries(updateFields).forEach(([key, value]) => {
    updateFieldsToSet[key] = value;
  });

  // Ensure that some fields are provided for the update
  if (Object.keys(updateFieldsToSet).length === 0) {
    return res.status(400).json({
      success: false,
      message: "No valid fields provided for update.",
    });
  }

  try {
    // Perform the update operation
    const result = await projectsCollection.findOneAndUpdate(
      { _id: new ObjectId(projectId) }, // Find the project by ID
      { $set: updateFieldsToSet }, // Update only the fields present in the request
      { returnDocument: "after" } // Return the updated document after modification
    );

    // Log the result of the update operation
    console.log("Update result:", result);

    const updatedProject = result.value;

    // Successfully updated project
    res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      data: updatedProject,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the project.",
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
