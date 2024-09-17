const { ObjectId } = require("mongodb");
// const jwt = require("jwt-simple");
const { getDB } = require("../config/db");

const getUserList = async (req, res) => {
    try {
        const usersCollection = getDB("taskify").collection("users");
        const result = await usersCollection.find().toArray();
        res.status(200).json({
            success: true,
            data: result,
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

module.exports = {
    getUserList,
    upsertUser,
};
