const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

// Get dashboard count


// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const tasksCollection = getDB("taskify").collection("tasks");
    const result = await tasksCollection.find().toArray();
    res.status(200).json({
      success: true,
      data: result,
      message: "Tasks retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch tasks",
      message: error.message,
    });
  }
};
const getAllFavouriteTasks = async (req, res) => {
  try {
    const tasksCollection = getDB("taskify").collection("tasks");
    // Filter tasks where favourite is true
    const result = await tasksCollection.find({ favourite: true }).toArray();

    // Check if no favourite tasks are found
    if (result.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No favourite tasks found",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: "Favourite tasks retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching favourite tasks:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch favourite tasks",
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

  // Define allowed status values
  const allowedStatuses = ["default", "started", "on going", "in review"];

  // Check if the status is valid
  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status value: ${status}. Allowed values are: ${allowedStatuses.join(", ")}`,
    });
  }

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
  for (const [key, value] of Object.entries(updateFields)) {
    updateFieldsToSet[key] = value;
  }

  if (Object.keys(updateFieldsToSet).length === 0) {
    return res.status(400).json({
      success: false,
      message: "No valid fields provided for update.",
    });
  }

  try {
    // Perform the update operation
    const result = await tasksCollection.findOneAndUpdate(
      { _id: new ObjectId(taskId) }, // Find the task by ID
      { $set: updateFieldsToSet }, // Update only the fields present in the request
      { returnDocument: "after" } // Return the updated document
    );

    // Log the result of the update operation
    console.log("Update result:", result);

    const updatedTask = result.value;

    // if (!updatedTask) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Task not found",
    //   });
    // }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the task",
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
