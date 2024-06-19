const express = require("express");
const router = express.Router();
const {
    getSession,
    createSession
} = require("../controllers/SessionController");

// GET session
router.get("/:id", getSession);

// CREATE session
router.post("/", createSession);

module.exports = router;