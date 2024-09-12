const express = require("express");

const { getTodosList,updateTodos } = require("../controllers/todosController");

const router = express.Router();

router.get("/todos", getTodosList);
router.put("/todos/:id",updateTodos)

module.exports = router;
