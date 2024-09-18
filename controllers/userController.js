const { ObjectId } = require("mongodb");
// const jwt = require("jwt-simple");
const { getDB } = require("../config/db");
const { getAllProjects } = require("./projectController");

const getUserList = async (req, res) => {
  try {
    const usersCollection = getDB("taskify").collection("users");
    const projectsCollection = getDB("taskify").collection("projects");

    const users = await usersCollection.find().toArray();

    // Use Promise.all to handle the asynchronous mapping
    const usersWithProjectCount = await Promise.all(users.map(async (user) => {
      const filter = { "users._id": `${user._id}` };
      const projectResult = await projectsCollection.find(filter).toArray();

      // Add projectCount to user
      return {
        ...user,
        projectCount: projectResult.length,
      };
    }));
    
    res.status(200).json({
      success: true,
      data: usersWithProjectCount,
      message: "Users retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
      message: error.message,
    });
  }
};

const getSingleUser = async (req, res) => {
  try {
    const userId = req.params.id; // Assuming the ID is passed as a URL parameter
    const usersCollection = getDB("taskify").collection("users");

    const result = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: "User retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user",
      message: error.message,
    });
  }
};
const upsertUser = async (req, res) => {
  try {
    const usersCollection = getDB("taskify").collection("users");
    const {
      displayName,
      lastName,
      email,
      countryCode,
      phoneNumber,
      password,
      confirmPassword,
      dateOfBirth,
      dateOfJoining,
      role,
      address,
      city,
      state,
      country,
      zipCode,
      status,
      requireEmailVerification,
      photoURL,
    } = req.body;

    // Ensure password matches confirmPassword
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Passwords do not match",
      });
    }

    // Build the filter based on the user's email (upsert will either update or insert)
    const filter = { email };
    const options = { upsert: true };

    const updateDoc = {
      $set: {
        displayName,
        lastName,
        email,
        countryCode,
        phoneNumber,
        password, // You should hash this before saving it in production for security
        dateOfBirth,
        dateOfJoining,
        role,
        address,
        city,
        state,
        country,
        zipCode,
        status,
        requireEmailVerification,
        photoURL,
      },
    };

    const result = await usersCollection.updateOne(filter, updateDoc, options);

    res.status(200).json({
      success: true,
      data: result,
      message: "User upserted successfully",
    });
  } catch (error) {
    console.error("Error upserting user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upsert user",
      message: error.message,
    });
  }
};
const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const usersCollection = getDB("taskify").collection("users");
    const result = await usersCollection.deleteOne({
      _id: new ObjectId(userId),
    });

    if (result.deletedCount === 1) {
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};
module.exports = {
  getUserList,
  upsertUser,
  getSingleUser,
  deleteUser,
};
