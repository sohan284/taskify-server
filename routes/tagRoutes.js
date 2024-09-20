const express = require("express");
const { createTag, getAllTag, updateTag, deleteTag } = require("../controllers/tagController");

const router = express.Router();

router.post("/tags", createTag);
router.get("/tags", getAllTag);
router.put("/tags/:id", updateTag);
router.delete("/tags/:id", deleteTag);

module.exports = router;
