const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

// Get dashboard count
const getDashboardCount = async (req, res) => {
  try {
    const dashboardCountCollection =
      getDB("taskify").collection("dashboardCount");
    const result = await dashboardCountCollection.find().toArray();
    res?.status(200).json({
      success: true,
      data: result,
      message: "Dashboard counts retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching dashboardCount:", error);
    res?.status(500).json({
      success: false,
      error: "Failed to fetch dashboardCount",
      message: error.message,
    });
  }
};

// all meetings 

 const getAllMeetings = async (req, res) => {
  try {
    const { status, user , client ,start_date_from,start_date_to,end_date_from,end_date_to,search } = req?.query; 
    const meetingsCollection = getDB("taskify").collection("meetings");

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

    const result = await meetingsCollection.find(filter).toArray();

    res?.status(200).json({
      success: true,
      data: result,
      message: "Meetings retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res?.status(500).json({
      success: false,
      error: "Failed to fetch meetings",
      message: error.message,
    });
  }
};

const getAllFavouriteMeetings = async (req, res) => {
  try {
    const { status, user, client,start_date_from,start_date_to,end_date_from,end_date_to,search} = req.query; 
    const meetingsCollection = getDB("taskify").collection("meetings");

    const filter = { favourite: true }; // Filter for favourite meetings

    
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

    const result = await meetingsCollection.find(filter).toArray();

    // Check if no favourite meetings are found
    if (result.length === 0) {
      return res?.status(200).json({
        success: true,
        data: [],
        message: "No favourite meetings found",
      });
    }

    res?.status(200).json({
      success: true,
      data: result,
      message: "Favourite meetings retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching favourite meetings:", error);
    res?.status(500).json({
      success: false,
      error: "Failed to fetch favourite meetings",
      message: error.message,
    });
  }
};

const createMeeting = async (req, res) => {
  try {
    const meetingData = req.body;
    const meetingsCollection = getDB("taskify").collection("meetings");
    const result = await meetingsCollection.insertOne(meetingData);
    res?.status(201).json({
      success: true,
      data: { _id: result.insertedId, ...meetingData },
      message: "Meeting created successfully",
    });
  } catch (error) {
    console.error("Error creating meeting:", error);
    res?.status(500).json({
      success: false,
      message: "Failed to create meeting",
      error: error.message,
    });
  }
};
// Update a meeting
const updateMeeting = async (req, res) => {
  const meetingId = req.params.id;
  const { status, favourite, ...updateFields } = req.body;
  const meetingsCollection = getDB("taskify").collection("meetings");

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
    const result = await meetingsCollection.findOneAndUpdate(
      { _id: new ObjectId(meetingId) }, // Find the meeting by ID
      { $set: updateFieldsToSet }, // Update only the fields present in the request
      { returnDocument: "after" } // Return the updated document after modification
    );

    // Log the result of the update operation
    console.log("Update result:", result);

    const updatedMeeting = result.value;

    // Successfully updated meeting
    res?.status(200).json({
      success: true,
      message: "Meeting updated successfully.",
      data: updatedMeeting,
    });
  } catch (error) {
    console.error("Error updating meeting:", error);
    res?.status(500).json({
      success: false,
      message: "An error occurred while updating the meeting.",
      error: error.message,
    });
  }
};

// Delete a meeting
const deleteMeeting = async (req, res) => {
  const meetingId = req.params.id;

  try {
    const meetingsCollection = getDB("taskify").collection("meetings");
    const result = await meetingsCollection.deleteOne({
      _id: new ObjectId(meetingId),
    });

    if (result.deletedCount === 1) {
      res?.status(200).json({
        success: true,
        message: "Meeting deleted successfully",
      });
    } else {
      res?.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }
  } catch (error) {
    console.error("Error deleting meeting:", error);
    res?.status(500).json({
      success: false,
      error: "Failed to delete meeting",
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardCount,
  createMeeting,
  getAllMeetings,
  updateMeeting,
  deleteMeeting,
  getAllFavouriteMeetings,
};
