const express = require("express");

const { getTodosList,updateTodos, createTodos, deleteTodos } = require("../controllers/todosController");

const router = express.Router();

router.get("/todos", getTodosList);
router.post("/todos",createTodos)
router.put("/todos/:id",updateTodos)
router.delete("/todos/:id", deleteTodos);

module.exports = router;
