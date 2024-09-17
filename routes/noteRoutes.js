const express = require("express");

// const { getAllStatus, createStatus, deleteStatus, updateStatus } = require("../controllers/statusController");
const { getNotes, createNote, deleteNote } = require("../controllers/NoteController");

const router = express.Router();

router.post("/notes", createNote);
router.get("/notes", getNotes);
// router.put("/statuses/:id", updateStatus);
router.delete("/notes/:id", deleteNote);

module.exports = router;
