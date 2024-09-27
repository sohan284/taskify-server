const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const getAllPriority = async (req, res) => {
    try {
      const prioritiesCollection = getDB("taskify").collection("priorities");
      const result = await prioritiesCollection.find().toArray();
      res.status(200).json({
        success: true,
        data: result,
        message: "Priority retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching Priority:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch Priority",
        message: error.message,
      });
    }
  };

const createPriority = async (req, res) => {
    try {
        const data = req.body;
        const prioritiesCollection = getDB("taskify").collection("priorities");
        const result = await prioritiesCollection.insertOne(data);
        res.status(201).json({
            success: true,
            data: { _id: result.insertedId, ...data },
            message: "Priority created successfully",
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

const updatePriority = async (req, res) => {
    const priorityId = req.params.id;
    const { title, txColor ,bgColor } = req.body;

    // Check if the ID is valid
    if (!ObjectId.isValid(priorityId)) {
        console.error("Invalid priority ID:", priorityId);
        return res.status(400).json({
            success: false,
            message: "Invalid priority ID",
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
        const prioritiesCollection = getDB("taskify").collection("priorities");
        const updateFields = {};

        // Update fields only if they are provided in the request body
        if (title !== undefined) updateFields.title = title;
        if (txColor !== undefined) updateFields.txColor = txColor;
        if (bgColor !== undefined) updateFields.bgColor = bgColor;

        const result = await prioritiesCollection.updateOne(
            { _id: new ObjectId(priorityId) },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            console.error("Priority not found:", priorityId);
            return res.status(404).json({
                success: false,
                message: "Priority not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Priority updated successfully",
        });
    } catch (error) {
        console.error("Error updating priority:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update priority",
            error: error.message,
        });
    }
};
const deletePriority = async (req, res) => {
    const priorityId = req.params.id;

    try {
        const prioritiesCollection = getDB("taskify").collection("priorities");
        const result = await prioritiesCollection.deleteOne({
            _id: new ObjectId(priorityId),
        });

        if (result.deletedCount === 1) {
            res.status(200).json({
                success: true,
                message: "Priority deleted successfully",
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Priority not found",
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


const deletePriorities = async (req, res) => {
    const priorityIds = req.body.ids; // Expecting an array of IDs

    if (!Array.isArray(priorityIds) || priorityIds.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid input: Please provide an array of priority IDs.",
        });
    }

    try {
        const prioritiesCollection = getDB("taskify").collection("priorities");

        // Filter out invalid IDs and log invalid ones for debugging
        const objectIds = priorityIds.map(id => {
            if (!ObjectId.isValid(id)) {
                console.error(`Invalid ObjectId: ${id}`);  // Log the invalid ID for debugging
                throw new Error(`Invalid ObjectId: ${id}`);
            }
            return new ObjectId(id); // Only convert valid IDs
        });

        // Proceed with the deletion only if all IDs are valid
        const result = await prioritiesCollection.deleteMany({
            _id: { $in: objectIds },
        });

        if (result.deletedCount > 0) {
            return res.status(200).json({
                success: true,
                message: `${result.deletedCount} priorities deleted successfully`,
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "No priorities found for the given IDs",
            });
        }
    } catch (error) {
        console.error("Error deleting priorities:", error);  // Log the actual error for debugging
        return res.status(500).json({
            success: false,
            message: `Failed to delete priorities: ${error.message}`,
        });
    }
};





module.exports = {
    getAllPriority,
    createPriority,
    updatePriority,
    deletePriority,
    deletePriorities
};
