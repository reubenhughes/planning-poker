const express = require("express");
const router = express.Router();
const {
  getSession,
  createSession,
  updateSession,
  addUserToSession,
  removeUserFromSession,
  updateUserHasVoted,
  clearVotes
} = require("../controllers/SessionController");

// GET session
router.get("/:id", getSession);

// CREATE session
router.post("/", createSession);

// UPDATE session
router.patch("/:id/updateSession", updateSession);

// ADD user to session
router.post("/addUser", addUserToSession);

// REMOVE user from session
router.post("/removeUser", removeUserFromSession);

// TEST Patch
router.patch("/:id/removeUser", removeUserFromSession);

// TEST update user vote
router.patch("/:id/updateUserHasVoted", updateUserHasVoted)

// Test clear votes
router.patch("/:id/clearVotes", clearVotes)

module.exports = router;
