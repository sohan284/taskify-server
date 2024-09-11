const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

// Get all Tasks
const getAllTasks = async (req, res) => {
  try {
    const TasksCollection = getDB("taskify").collection("Tasks");
    const result = await TasksCollection.find().toArray();
    res.status(200).json({
      success: true,
      data: result,
      message: "Tasks retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching Tasks:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch Tasks",
      message: error.message,
    });
  }
};
const getAllFavouriteTasks = async (req, res) => {
  try {
    const TasksCollection = getDB("taskify").collection("Tasks");
    // Filter Tasks where favourite is true
    const result = await TasksCollection.find({ favourite: true }).toArray();

    // Check if no favourite Tasks are found
    if (result.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No favourite Tasks found",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: "Favourite Tasks retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching favourite Tasks:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch favourite Tasks",
      message: error.message,
    });
  }
};

const createTask = async (req, res) => {
  try {
    const TaskData = req.body;
    const TasksCollection = getDB("taskify").collection("Tasks");
    const result = await TasksCollection.insertOne(TaskData);
    res.status(201).json({
      success: true,
      data: { _id: result.insertedId, ...TaskData },
      message: "Task created successfully",
    });
  } catch (error) {
    console.error("Error creating Task:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create Task",
      error: error.message,
    });
  }
};

// Update a Task
const updateTask = async (req, res) => {
  const TaskId = req.params.id;
  const { status, favourite, ...updateFields } = req.body;
  const TasksCollection = getDB("taskify").collection("Tasks");

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
    const result = await TasksCollection.findOneAndUpdate(
      { _id: new ObjectId(TaskId) }, // Find the Task by ID
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
    console.error("Error updating Task:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the Task",
      error: error.message,
    });
  }
};





// Delete a Task
const deleteTask = async (req, res) => {
  const TaskId = req.params.id;

  try {
    const TasksCollection = getDB("taskify").collection("Tasks");
    const result = await TasksCollection.deleteOne({
      _id: new ObjectId(TaskId),
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
    console.error("Error deleting Task:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete Task",
      message: error.message,
    });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  getAllFavouriteTasks,
};
