const express = require("express");
const router = express.Router();
const {
  getSession,
  createSession,
  updateSession,
  addUserToSession,
  removeUserFromSession,
  updateUserHasVoted,
  clearVotes,
} = require("../controllers/SessionController");

// GET session
router.get("/:id", getSession);

// CREATE session
router.post("/", createSession);

// UPDATE session
router.patch("/:id/updateSession", updateSession);

// ADD user to session
router.patch("/:id/addUser", addUserToSession);

// Remove user from session
router.patch("/:id/removeUser", removeUserFromSession);

// Update user vote
router.patch("/:id/updateUserHasVoted", updateUserHasVoted);

// Clear votes
router.patch("/:id/clearVotes", clearVotes);

module.exports = router;
