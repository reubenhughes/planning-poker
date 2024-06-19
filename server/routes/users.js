const express = require("express");
const router = express.Router();
const {
    getUser,
    createUser
} = require("../controllers/UserController");

// GET user
router.get("/:id", getUser);

// CREATE user
router.post("/", createUser);

module.exports = router;