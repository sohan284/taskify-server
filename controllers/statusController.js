const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const getAllStatus = async (req, res) => {
    try {
      const statusesCollection = getDB("taskify").collection("statuses");
      const result = await statusesCollection.find().toArray();
      res.status(200).json({
        success: true,
        data: result,
        message: "Status retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching Status:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch Status",
        message: error.message,
      });
    }
  };

const createStatus = async (req, res) => {
    try {
        const data = req.body;
        const statusesCollection = getDB("taskify").collection("statuses");
        const result = await statusesCollection.insertOne(data);
        res.status(201).json({
            success: true,
            data: { _id: result.insertedId, ...data },
            message: "Status created successfully",
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

const updateStatus = async (req, res) => {
    const statusId = req.params.id;
    const { title, txColor ,bgColor } = req.body;

    // Check if the ID is valid
    if (!ObjectId.isValid(statusId)) {
        console.error("Invalid status ID:", statusId);
        return res.status(400).json({
            success: false,
            message: "Invalid status ID",
        });
    }

    // Validate that only title and color fields are allowed
    const allowedFields = ['title', 'txColor', 'bgColor'];
    const invalidFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));
    if (invalidFields.length > 0) {
        console.error("Invalid fields in request body:", invalidFields);
        return res.status(400).json({
            success: false,
            message: "Invalid fields in request body: " + invalidFields.join(', '),
        });
    }

    try {
        const statusesCollection = getDB("taskify").collection("statuses");
        const updateFields = {};

        // Update fields only if they are provided in the request body
        if (title !== undefined) updateFields.title = title;
        if (txColor !== undefined) updateFields.txColor = txColor;
        if (bgColor !== undefined) updateFields.bgColor = bgColor;

        const result = await statusesCollection.updateOne(
            { _id: new ObjectId(statusId) },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            console.error("Status not found:", statusId);
            return res.status(404).json({
                success: false,
                message: "Status not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Status updated successfully",
        });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update status",
            error: error.message,
        });
    }
};
const deleteStatus = async (req, res) => {
    const statusId = req.params.id;

    try {
        const statusesCollection = getDB("taskify").collection("statuses");
        const result = await statusesCollection.deleteOne({
            _id: new ObjectId(statusId),
        });

        if (result.deletedCount === 1) {
            res.status(200).json({
                success: true,
                message: "Status deleted successfully",
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Status not found",
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


const deleteStatuses = async (req, res) => {
    const statusIds = req.body.ids; // Expecting an array of IDs

    if (!Array.isArray(statusIds) || statusIds.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid input: Please provide an array of status IDs.",
        });
    }

    try {
        const statusesCollection = getDB("taskify").collection("statuses");

        // Filter out invalid IDs and log invalid ones for debugging
        const objectIds = statusIds.map(id => {
            if (!ObjectId.isValid(id)) {
                console.error(`Invalid ObjectId: ${id}`);  // Log the invalid ID for debugging
                throw new Error(`Invalid ObjectId: ${id}`);
            }
            return new ObjectId(id); // Only convert valid IDs
        });

        // Proceed with the deletion only if all IDs are valid
        const result = await statusesCollection.deleteMany({
            _id: { $in: objectIds },
        });

        if (result.deletedCount > 0) {
            return res.status(200).json({
                success: true,
                message: `${result.deletedCount} statuses deleted successfully`,
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "No statuses found for the given IDs",
            });
        }
    } catch (error) {
        console.error("Error deleting statuses:", error);  // Log the actual error for debugging
        return res.status(500).json({
            success: false,
            message: `Failed to delete statuses: ${error.message}`,
        });
    }
};





module.exports = {
    getAllStatus,
    createStatus,
    updateStatus,
    deleteStatus,
    deleteStatuses
};
