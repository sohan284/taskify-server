const express = require("express");
const { upsertUser, getUserList } = require("../controllers/userController");


const router = express.Router();

router.get("/users", getUserList);
router.post("/users", upsertUser);

module.exports = router;
