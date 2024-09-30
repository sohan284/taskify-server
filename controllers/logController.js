const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const getAllLog = async (req, res) => {
    try {
      const logsCollection = getDB("taskify").collection("logs");
      const result = await logsCollection.find().toArray();
      res.status(200).json({
        success: true,
        data: result,
        message: "Log retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching Log:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch Log",
        message: error.message,
      });
    }
  };

const createLog = async (req, res) => {
    try {
        const data = req.body;
        const logsCollection = getDB("taskify").collection("logs");
        const result = await logsCollection.insertOne(data);
        res.status(201).json({
            success: true,
            data: { _id: result.insertedId, ...data },
            message: "Log created successfully",
        });
    } catch (error) {
        console.error("Error creating todos:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create todo",
            error: error.message,
        });
    }
};

const deleteLog = async (req, res) => {
    const logId = req.params.id;

    try {
        const logsCollection = getDB("taskify").collection("logs");
        const result = await logsCollection.deleteOne({
            _id: new ObjectId(logId),
        });

        if (result.deletedCount === 1) {
            res.status(200).json({
                success: true,
                message: "Log deleted successfully",
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Log not found",
            });
        }
    } catch (error) {
        console.error("Error deleting todo:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete todo",
            error: error.message,
        });
    }
};


const deleteLogs = async (req, res) => {
    const logIds = req.body.ids; // Expecting an array of IDs

    if (!Array.isArray(logIds) || logIds.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid input: Please provide an array of log IDs.",
        });
    }

    try {
        const logsCollection = getDB("taskify").collection("logs");

        // Filter out invalid IDs and log invalid ones for debugging
        const objectIds = logIds.map(id => {
            if (!ObjectId.isValid(id)) {
                console.error(`Invalid ObjectId: ${id}`);  // Log the invalid ID for debugging
                throw new Error(`Invalid ObjectId: ${id}`);
            }
            return new ObjectId(id); // Only convert valid IDs
        });

        // Proceed with the deletion only if all IDs are valid
        const result = await logsCollection.deleteMany({
            _id: { $in: objectIds },
        });

        if (result.deletedCount > 0) {
            return res.status(200).json({
                success: true,
                message: `${result.deletedCount} logs deleted successfully`,
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "No logs found for the given IDs",
            });
        }
    } catch (error) {
        console.error("Error deleting logs:", error);  // Log the actual error for debugging
        return res.status(500).json({
            success: false,
            message: `Failed to delete logs: ${error.message}`,
        });
    }
};





module.exports = {
    getAllLog,
    createLog,
    deleteLog,
    deleteLogs
};
