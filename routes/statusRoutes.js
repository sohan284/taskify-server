const express = require("express");

const { getAllStatus, createStatus, deleteStatus, updateStatus } = require("../controllers/statusController");

const router = express.Router();

router.post("/statuses", createStatus);
router.get("/statuses", getAllStatus);
router.put("/statuses/:id", updateStatus);
router.delete("/statuses/:id", deleteStatus);

module.exports = router;
