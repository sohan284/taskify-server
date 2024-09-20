const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const getAllTag = async (req, res) => {
    try {
      const tagsCollection = getDB("taskify").collection("tags");
      const result = await tagsCollection.find().toArray();
      res.status(200).json({
        success: true,
        data: result,
        message: "Tag retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching Tag:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch Tag",
        message: error.message,
      });
    }
  };

const createTag = async (req, res) => {
    try {
        const data = req.body;
        const tagsCollection = getDB("taskify").collection("tags");
        const result = await tagsCollection.insertOne(data);
        res.status(201).json({
            success: true,
            data: { _id: result.insertedId, ...data },
            message: "Tag created successfully",
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

const updateTag = async (req, res) => {
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
        const tagsCollection = getDB("taskify").collection("tags");
        const updateFields = {};

        // Update fields only if they are provided in the request body
        if (title !== undefined) updateFields.title = title;
        if (txColor !== undefined) updateFields.txColor = txColor;
        if (bgColor !== undefined) updateFields.bgColor = bgColor;

        const result = await tagsCollection.updateOne(
            { _id: new ObjectId(statusId) },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            console.error("Tag not found:", statusId);
            return res.status(404).json({
                success: false,
                message: "Tag not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Tag updated successfully",
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
const deleteTag = async (req, res) => {
    const statusId = req.params.id;

    try {
        const tagsCollection = getDB("taskify").collection("tags");
        const result = await tagsCollection.deleteOne({
            _id: new ObjectId(statusId),
        });

        if (result.deletedCount === 1) {
            res.status(200).json({
                success: true,
                message: "Tag deleted successfully",
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Tag not found",
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

module.exports = {
    getAllTag,
    createTag,
    updateTag,
    deleteTag
};
