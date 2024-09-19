const express = require("express");
const { createMeeting, getAllMeetings, updateMeeting, deleteMeeting } = require("../controllers/meetingController");

const router = express.Router();

router.post("/meetings", createMeeting);
router.get("/meetings", getAllMeetings);
router.put("/meetings/:id", updateMeeting);
router.delete("/meetings/:id", deleteMeeting);

module.exports = router;
