const Session = require("../models/SessionSchema");
const Mongoose = require("mongoose");

const getSession = async (req, res) => {
  const { id } = req.params;
  try {
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.status(200).json(session);
    console.log(`Fetched session ${id}`);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const createSession = async (req, res) => {
  const { participants, votes, createdAt } = req.body;

  try {
    const session = await Session.create({
      participants,
      votes,
      createdAt,
    });
    res.status(200).json(session);
    console.log(`Created session ${res.params}`);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateSession = async (req, res) => {
  const { id } = req.params;
  try {
    const session = await Session.findOneAndUpdate(
      { _id: id },
      {
        ...req.body,
      },
    );
    res.status(200).json(session);
    console.log(`Updated session ${id}`);
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.log(error);
  }
};

const addUserToSession = async (req, res) => {
  const { sessionID, name, vote } = req.body;
  const userID = new Mongoose.Types.ObjectId();
  const participantVote = { userID, name, vote };

  try {
    const session = await Session.findById(sessionID);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (!session.participants.includes(userID)) {
      session.participants.push(userID);
      session.votes.push(participantVote);
      await session.save();
    }
    res.status(200).json({ session: session, userID: userID });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const removeUserFromSession = async (req, res) => {
  const { id, userID, session } = req.body;
  const updatedParticipantList = session.participants.filter(
    (participant) => participant !== userID,
  );
  const updatedVoteList = session.votes.filter(
    (vote) => vote.userID !== userID,
  );
  try {
    const updatedSession = await Session.findOneAndUpdate(
      { _id: id },
      {
        participants: updatedParticipantList,
        votes: updatedVoteList,
        createdAt: session.createdAt,
      },
    );
    res.status(200).json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.messsage });
    console.log(error);
  }
};

module.exports = {
  getSession,
  createSession,
  updateSession,
  addUserToSession,
  removeUserFromSession,
};
