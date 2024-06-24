const express = require("express");
const router = express.Router();
const {
    getSession,
    createSession,
    updateSession,
    addUserToSession
} = require("../controllers/SessionController");

// GET session
router.get("/:id", getSession);

// CREATE session
router.post("/", createSession);

// UPDATE session
router.patch("/:id", updateSession);

// ADD user to session
router.post("/addUser", addUserToSession);

module.exports = router;