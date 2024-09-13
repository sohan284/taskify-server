const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const getTodosList = async (req, res) => {
    try {
        const todosCollection = getDB("taskify").collection("todos");

        // Aggregation to count statuses
        const statusCount = await todosCollection.aggregate([
            {
                $group: {
                    _id: null,
                    trueCount: {
                        $sum: {
                            $cond: ["$status", 1, 0]
                        }
                    },
                    falseCount: {
                        $sum: {
                            $cond: [{ $not: "$status" }, 1, 0]
                        }
                    }
                }
            }
        ]).toArray();

        // Retrieve the todos
        const todos = await todosCollection.find().toArray();

        res.status(200).json({
            success: true,
            data: todos,
            statusCount: statusCount.length > 0 ? statusCount[0] : { trueCount: 0, falseCount: 0 },
            message: "Todos retrieved successfully",
        });
    } catch (error) {
        console.error("Error fetching todos:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch todos",
            message: error.message,
        });
    }
};

const createTodos = async (req, res) => {
    try {
        const data = req.body;
        const todosCollection = getDB("taskify").collection("todos");
        const result = await todosCollection.insertOne(data);
        res.status(201).json({
            success: true,
            data: { _id: result.insertedId, ...data },
            message: "Todo created successfully",
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

const updateTodos = async (req, res) => {
    const todosId = req.params.id;
    const { title, status, description } = req.body;

    // Check if the ID is valid
    if (!ObjectId.isValid(todosId)) {
        console.error("Invalid todo ID:", todosId);
        return res.status(400).json({
            success: false,
            message: "Invalid todo ID",
        });
    }

    // Validate that only title, status, and description fields are allowed
    const allowedFields = ['title', 'status', 'description'];
    const invalidFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));
    if (invalidFields.length > 0) {
        console.error("Invalid fields in request body:", invalidFields);
        return res.status(400).json({
            success: false,
            message: "Invalid fields in request body: " + invalidFields.join(', '),
        });
    }

    // Validate status value
    if (status !== undefined && typeof status !== 'boolean') {
        console.error("Invalid status value:", status);
        return res.status(400).json({
            success: false,
            message: "Status must be a boolean value",
        });
    }

    try {
        const todosCollection = getDB("taskify").collection("todos");
        const updateFields = {};

        if (title !== undefined) updateFields.title = title;
        if (status !== undefined) updateFields.status = status;
        if (description !== undefined) updateFields.description = description;

        const result = await todosCollection.updateOne(
            { _id: new ObjectId(todosId) },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            console.error("Todo not found:", todosId);
            return res.status(404).json({
                success: false,
                message: "Todo not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Todo updated successfully",
        });
    } catch (error) {
        console.error("Error updating todo:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update todo",
            error: error.message,
        });
    }
};

const deleteTodos = async (req, res) => {
    const todoId = req.params.id;

    try {
        const todosCollection = getDB("taskify").collection("todos");
        const result = await todosCollection.deleteOne({
            _id: new ObjectId(todoId),
        });

        if (result.deletedCount === 1) {
            res.status(200).json({
                success: true,
                message: "Todo deleted successfully",
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Todo not found",
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
    getTodosList,
    createTodos,
    updateTodos,
    deleteTodos
};
