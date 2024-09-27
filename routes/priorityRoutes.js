const express = require("express");
const { createPriority, getAllPriority, updatePriority, deletePriority, deletePriorities } = require("../controllers/priotiryController");


const router = express.Router();

router.post("/priorities", createPriority);
router.get("/priorities", getAllPriority);
router.put("/priorities/:id", updatePriority);
router.delete("/priorities/:id", deletePriority);
router.delete("/priorities/delete/multiple", deletePriorities);

module.exports = router;
