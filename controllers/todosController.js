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
                            $cond: [ "$status", 1, 0 ]
                        }
                    },
                    falseCount: {
                        $sum: {
                            $cond: [ { $not: "$status" }, 1, 0 ]
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

const updateTodos = async (req, res) => {
    const todosId = req.params.id;
    const { name, status } = req.body;
    console.log(name, status);

    // Check if the ID is valid
    if (!ObjectId.isValid(todosId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid todo ID",
        });
    }

    // Validate that only name and status fields are allowed
    if (Object.keys(req.body).some(key => !['name', 'status'].includes(key))) {
        return res.status(400).json({
            success: false,
            message: "Invalid fields in request body",
        });
    }

    // Validate status value
    if (status !== undefined && typeof status !== 'boolean') {
        return res.status(400).json({
            success: false,
            message: "Status must be a boolean value",
        });
    }

    try {
        const tasksCollection = getDB("taskify").collection("todos");
        const updateFields = {};

        if (name !== undefined) updateFields.name = name;
        if (status !== undefined) updateFields.status = status;

        const result = await tasksCollection.updateOne(
            { _id: new ObjectId(todosId) },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
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
            error: "Failed to update todo",
            message: error.message,
        });
    }
};

module.exports = {
    getTodosList,
    updateTodos,
};
