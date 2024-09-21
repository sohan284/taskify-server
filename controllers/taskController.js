const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");


// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const { status, user , client ,start_date_from,start_date_to,end_date_from,end_date_to,search } = req?.query; 
    const tasksCollection = getDB("taskify").collection("tasks");

    const filter = {};
    if (status) filter["status.title"] = status;

    if (user) {
      if (!ObjectId.isValid(user)) {
        return res?.status(400).json({
          success: false,
          message: "Invalid user ID format",
        });
      }
      filter["users._id"] = (user);
    }

    if (client) {
      if (!ObjectId.isValid(client)) {
        return res?.status(400).json({
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

    const result = await tasksCollection.find(filter).toArray();

    res?.status(200).json({
      success: true,
      data: result,
      message: "Task retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res?.status(500).json({
      success: false,
      error: "Failed to fetch tasks",
      message: error.message,
    });
  }
};

const createTask = async (req, res) => {
  try {
    const taskData = req.body;
    const tasksCollection = getDB("taskify").collection("tasks");
    const result = await tasksCollection.insertOne(taskData);
    res.status(201).json({
      success: true,
      data: { _id: result.insertedId, ...taskData },
      message: "Task created successfully",
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message,
    });
  }
};

// Update a task
const updateTask = async (req, res) => {
  const taskId = req.params.id;
  const { status, favourite, ...updateFields } = req.body;
  const tasksCollection = getDB("taskify").collection("tasks");

  // Validate the favourite field (optional)
  if (typeof favourite !== "undefined" && typeof favourite !== "boolean") {
    return res?.status(400).json({
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
    return res?.status(400).json({
      success: false,
      message: "No valid fields provided for update.",
    });
  }

  try {
    // Perform the update operation
    const result = await tasksCollection.findOneAndUpdate(
      { _id: new ObjectId(taskId) }, // Find the task by ID
      { $set: updateFieldsToSet }, // Update only the fields present in the request
      { returnDocument: "after" } // Return the updated document after modification
    );

    // Log the result of the update operation

    const updatedProject = result.value;

    // Successfully updated task
    res?.status(200).json({
      success: true,
      message: "Project updated successfully.",
      data: updatedProject,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res?.status(500).json({
      success: false,
      message: "An error occurred while updating the task.",
      error: error.message,
    });
  }
};





// Delete a task
const deleteTask = async (req, res) => {
  const taskId = req.params.id;

  try {
    const tasksCollection = getDB("taskify").collection("tasks");
    const result = await tasksCollection.deleteOne({
      _id: new ObjectId(taskId),
    });

    if (result.deletedCount === 1) {
      res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete task",
      message: error.message,
    });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
};
