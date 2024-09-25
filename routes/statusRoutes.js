const express = require("express");

const { getAllStatus, createStatus, deleteStatus, updateStatus, deleteStatuses } = require("../controllers/statusController");

const router = express.Router();

router.post("/statuses", createStatus);
router.get("/statuses", getAllStatus);
router.put("/statuses/:id", updateStatus);
router.delete("/statuses/:id", deleteStatus);
router.delete("/statuses/delete/multiple", deleteStatuses);

module.exports = router;
