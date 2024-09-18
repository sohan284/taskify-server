const express = require("express");
const { upsertUser, getUserList, getSingleUser, deleteUser } = require("../controllers/userController");


const router = express.Router();

router.get("/users", getUserList);
router.get("/users/:id", getSingleUser);
router.post("/users", upsertUser);
router.delete("/users/:id", deleteUser);

module.exports = router;
