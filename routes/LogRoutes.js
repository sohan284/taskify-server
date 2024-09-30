const express = require("express");
const { createLog, getAllLog, deleteLog, deleteLogs } = require("../controllers/logController");


const router = express.Router();

router.post("/logs", createLog);
router.get("/logs", getAllLog);
router.delete("/logs/:id", deleteLog);
router.delete("/logs/delete/multiple", deleteLogs);

module.exports = router;
