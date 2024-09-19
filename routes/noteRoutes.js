const express = require("express");
const { createNote, getNotes, updateNote, deleteNote } = require("../controllers/NoteController");

const router = express.Router();

router.post("/notes", createNote);
router.get("/notes", getNotes);
router.put("/notes/:id", updateNote);
router.delete("/notes/:id", deleteNote);

module.exports = router;
