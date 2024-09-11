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
        // const email = req.params.email;
        const { photoURL, displayName ,email } = req.body;

        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
            $set: { photoURL, displayName ,email },
        };

        const result = await usersCollection.updateOne(filter, updateDoc, options);
        // const token = jwt.encode({ email: email }, process.env.ACCESS_TOKEN_SECRET, 'HS256', { expiresIn: '1h' });

        res.status(200).json({
            success: true,
            data: result,
            // token: token,
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
