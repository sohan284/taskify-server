const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");


// all meetings 


// All meetings
const getAllMeetings = async (req, res) => {
  try {
    const { status, user, client, start_date_from, start_date_to, end_date_from, end_date_to, search } = req?.query;
    const meetingsCollection = getDB("taskify").collection("meetings");

    const filter = {};

    // Handle status filtering
    if (status) {
      if (status == "Ongoing") {
        filter.startsAt = { $lte: new Date() };
        filter.endsAt = { $gte: new Date() };
      } else if (status == "Yet to Start") {
        filter.startsAt = { $gt: new Date() };
      } else if (status == "Ended") {
        filter.endsAt = { $lt: new Date() };
      }
    }
    

    // Validate and add user filter
    if (user) {
      if (!ObjectId.isValid(user)) {
        return res?.status(400).json({
          success: false,
          message: "Invalid user ID format",
        });
      }
      filter["users._id"] = user;
    }

    // Validate and add client filter
    if (client) {
      if (!ObjectId.isValid(client)) {
        return res?.status(400).json({
          success: false,
          message: "Invalid client ID format",
        });
      }
      filter["clients._id"] = client;
    }

    // Date filters
    if (start_date_from || start_date_to) {
      filter.startsAt = {};
      if (start_date_from) filter.startsAt.$gte = new Date(start_date_from);
      if (start_date_to) filter.startsAt.$lte = new Date(start_date_to);
    }

    if (end_date_from || end_date_to) {
      filter.endsAt = {};
      if (end_date_from) filter.endsAt.$gte = new Date(end_date_from);
      if (end_date_to) filter.endsAt.$lte = new Date(end_date_to);
    }

    // Search filter
    if (search) {
      filter.$or = [{ title: { $regex: search, $options: "i" } }];
    }

    // Fetch meetings from the database
    let meetings = await meetingsCollection.find(filter).toArray();

 
    const currentTime = new Date();

    // Update the status dynamically for each meeting
    meetings = meetings.map(meeting => {
      const meetingStartTime = new Date(meeting.startsAt);
      const meetingEndTime = new Date(meeting.endsAt);

      let status = '';

      if (currentTime < meetingStartTime) {
        // If meeting hasn't started
        const diffInMs = meetingStartTime - currentTime;
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);
        const minutes = diffInMinutes % 60;
        const hours = diffInHours % 24;

        status = diffInDays > 0
          ? `In ${diffInDays} days ${hours} hours and ${minutes} minutes`
          : diffInHours > 0
          ? `In ${hours} hours and ${minutes} minutes`
          : `In ${minutes} minutes`;

      } else if (currentTime >= meetingStartTime && currentTime <= meetingEndTime) {
        status = "Ongoing";
      } else {
        const diffInMs = currentTime - meetingEndTime;
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);
        const minutes = diffInMinutes % 60;
        const hours = diffInHours % 24;

        status = diffInDays > 0
          ? `${diffInDays} days ${hours} hours and ${minutes} minutes ago`
          : diffInHours > 0
          ? `${hours} hours and ${minutes} minutes ago`
          : `${minutes} minutes ago`;
      }

      // Update the status in the meeting object
      return { ...meeting, status };
    });

    res?.status(200).json({
      success: true,
      data: meetings,
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


const createMeeting = async (req, res) => {
  const meetingData = req.body;
  const meetingsCollection = getDB("taskify").collection("meetings");

  const meetingStartTime = new Date(meetingData?.startsAt); // Start time of the meeting
  const meetingEndTime = new Date(meetingData?.endsAt);     // End time of the meeting
  const currentTime = new Date();                            // Current time

  let status = '';

  if (currentTime < meetingStartTime) {
      // If the meeting is in the future (hasn't started yet)
      const diffInMs = meetingStartTime - currentTime; // Time left until meeting starts
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      const minutes = diffInMinutes % 60;
      const hours = diffInHours % 24;

      if (diffInDays > 0) {
          status = `In ${diffInDays} days ${hours} hours and ${minutes} minutes`;
      } else if (diffInHours > 0) {
          status = `In ${hours} hours and ${minutes} minutes`;
      } else {
          status = `In ${minutes} minutes`;
      }

  } else if (currentTime >= meetingStartTime && currentTime <= meetingEndTime) {
      // If the meeting is currently happening
      status = "Ongoing";

  } else {
      // If the meeting has already ended
      const diffInMs = currentTime - meetingEndTime;
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      const minutes = diffInMinutes % 60;
      const hours = diffInHours % 24;

      if (diffInDays > 0) {
          status = `${diffInDays} days ${hours} hours and ${minutes} minutes ago`;
      } else if (diffInHours > 0) {
          status = `${hours} hours and ${minutes} minutes ago`;
      } else {
          status = `${minutes} minutes ago`;
      }
  }

  // Add status to meeting data before storing it in the database
  const meetingWithStatus = {
      ...meetingData,
      status: status, // Include status in meeting data
  };

  try {
      const result = await meetingsCollection.insertOne(meetingWithStatus);
      res?.status(201).json({
          success: true,
          data: { _id: result.insertedId, status: status, ...meetingWithStatus },
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
  const { startsAt, endsAt, ...updateFields } = req.body; // Extract startsAt and endsAt separately
  const meetingsCollection = getDB("taskify").collection("meetings");

  // Construct the $set object dynamically based on provided fields
  const updateFieldsToSet = { ...updateFields }; // Include other fields for update if provided

  try {
    // Find the meeting before updating it to recalculate status if necessary
    const existingMeeting = await meetingsCollection.findOne({ _id: new ObjectId(meetingId) });

    if (!existingMeeting) {
      return res?.status(404).json({
        success: false,
        message: "Meeting not found.",
      });
    }

    // Update startsAt and endsAt if provided, or keep the existing values
    const meetingStartTime = startsAt ? new Date(startsAt) : existingMeeting.startsAt;
    const meetingEndTime = endsAt ? new Date(endsAt) : existingMeeting.endsAt;

    // Update the startsAt and endsAt fields
    updateFieldsToSet.startsAt = meetingStartTime;
    updateFieldsToSet.endsAt = meetingEndTime;

    const currentTime = new Date();

    // Recalculate status based on the updated or existing times
    let updatedStatus = existingMeeting.status;

    if (currentTime < meetingStartTime) {
      const diffInMs = meetingStartTime - currentTime;
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      const minutes = diffInMinutes % 60;
      const hours = diffInHours % 24;

      if (diffInDays > 0) {
        updatedStatus = `In ${diffInDays} days ${hours} hours and ${minutes} minutes`;
      } else if (diffInHours > 0) {
        updatedStatus = `In ${hours} hours and ${minutes} minutes`;
      } else {
        updatedStatus = `In ${minutes} minutes`;
      }
    } else if (currentTime >= meetingStartTime && currentTime <= meetingEndTime) {
      updatedStatus = "Ongoing";
    } else {
      const diffInMs = currentTime - meetingEndTime;
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      const minutes = diffInMinutes % 60;
      const hours = diffInHours % 24;

      if (diffInDays > 0) {
        updatedStatus = `${diffInDays} days ${hours} hours and ${minutes} minutes ago`;
      } else if (diffInHours > 0) {
        updatedStatus = `${hours} hours and ${minutes} minutes ago`;
      } else {
        updatedStatus = `${minutes} minutes ago`;
      }
    }

    // Include the updated status
    updateFieldsToSet.status = updatedStatus;

    // Perform the update operation
    const result = await meetingsCollection.findOneAndUpdate(
      { _id: new ObjectId(meetingId) },
      { $set: updateFieldsToSet },
      { returnDocument: "after" }
    );

    const updatedMeeting = result.value;

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
  createMeeting,
  getAllMeetings,
  updateMeeting,
  deleteMeeting,
};
