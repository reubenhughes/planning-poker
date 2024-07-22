const Mongoose = require("mongoose");
const Session = require("../models/SessionSchema");

const getSession = async (req, res) => {
  const { id } = req.params;
  console.log("req.params:", req.params);
  try {
    const session = await Session.findById(id);
    if (!session) {
      return res
        .status(404)
        .json({ message: "Session not found", status: 404 });
    }
    res.status(200).json(session);
    console.log(`Fetched session ${id}`);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const createSession = async (req, res) => {
  const {
    participants,
    votes,
    title,
    description,
    voteDeck,
    status,
    majorityVote,
    averageVote,
    createdAt,
  } = req.body;
  try {
    const session = await Session.create({
      participants,
      votes,
      title,
      description,
      voteDeck,
      status,
      majorityVote,
      averageVote,
      createdAt,
    });
    res.status(200).json(session);
    console.log(`Created session ${res.params}`);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

const updateSession = async (req, res) => {
  const { sessionID, session, participantList, oldVoteList } = req.body;
  let majorityVote = "0";
  let averageVote = "0";
  let totalVotes = 0;
  let mf = 1;
  let m = 0;

  console.log("vote list:", oldVoteList);
  console.log("session participants:", participantList);
  console.log("session:", session);

  const voteList = oldVoteList
    .filter((voter) => voter.vote != "0" && voter.vote != "?")
    .map((voter) => voter.vote);
  console.log("votes:", voteList);
  console.log("votes length:", voteList.length);
  console.log("voteList at position 0:", voteList[0]);
  console.log("voteList at position 1:", voteList[1]);

  if (voteList.length == 0) {
    majorityVote = 0;
  } else {
    majorityVote = voteList[0];
  }
  // iterates through the array to find the most frequent item
  for (var i = 0; i < voteList.length; i++) {
    // nested loop to compare the current item with others in the array
    for (var j = i; j < voteList.length; j++) {
      // checks if the current item matches with another item in the array
      if (voteList[i] == voteList[j]) m++;
      // updates the most frequent item and its frequency if the current item's frequency is higher
      if (mf < m) {
        mf = m;
        majorityVote = voteList[i];
      }
    }
    if (voteList[i] != "0" && voteList[i] != "?") {
      totalVotes += Number(voteList[i]);
    }
    // resets the current item's frequency for the next iteration
    m = 0;
  }

  if (voteList.length == 0) {
    averageVote = "0";
  } else {
    averageVote = (totalVotes / voteList.length).toFixed(1);
  }

  // outputs the most frequent item and its frequency
  console.log(majorityVote + " ( " + mf + " times ) ");
  console.log("Total count:", totalVotes);
  console.log("Majority vote:", majorityVote);
  console.log("Average vote:", averageVote);

  try {
    const updatedSession = await Session.findOneAndUpdate(
      { _id: sessionID },
      {
        participants: participantList,
        votes: oldVoteList,
        status: "finished",
        majorityVote: majorityVote,
        averageVote: averageVote,
        createdAt: session.createdAt,
      },
      { new: true },
    );
    res.status(200).json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.messsage });
    console.log(error);
  }
};

const addUserToSession = async (req, res) => {
  const { sessionID, name, role, vote, voteMessage } = req.body;
  const userID = new Mongoose.Types.ObjectId();
  const participantArrayID = new Mongoose.Types.ObjectId();
  const voteArrayID = new Mongoose.Types.ObjectId();
  console.log("user added to session");
  console.log("session id:", sessionID);

  try {
    const session = await Session.findById(sessionID);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // adds the user to participant and vote lists
    if (!session.participants.includes(userID)) {
      session.participants.push({
        _id: participantArrayID,
        userID,
        name,
        role,
      });
      if (role === "voter") {
        session.votes.push({
          _id: voteArrayID,
          userID,
          name,
          vote,
          voteMessage,
        });
      }
      await session.save();
    }
    res.status(200).json({
      session: session,
      userID: userID,
      participantArrayID: participantArrayID,
      voteArrayID: voteArrayID,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const removeUserFromSession = async (req, res) => {
  const { sessionID, userID, participantList, voteList } = req.body;
  console.log("Participant list:", participantList);

  // removes user from participant and vote lists through the array.filter() method
  const updatedParticipantList = participantList.filter(
    (participant) => participant.userID !== userID,
  );
  const updatedVoteList = voteList.filter((voter) => voter.userID !== userID);
  try {
    const updatedSession = await Session.findOneAndUpdate(
      { _id: sessionID },
      {
        participants: updatedParticipantList,
        votes: updatedVoteList,
      },
      { new: true },
    );
    console.log("updated session:", updatedSession);
    res.status(200).json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.messsage });
    console.log(error);
  }
};

const updateUserHasVoted = async (req, res) => {
  console.log("this route being called");
  const { sessionID, userID, userVote, voteList } = req.body;
  const updatedVoteList = voteList.map((voter) => {
    if (voter.userID === userID) {
      return {
        ...voter,
        vote: userVote,
        voteMessage: "Participant has voted",
      };
    } else {
      return voter;
    }
  });
  console.log("old vote list:", voteList);
  console.log("updated vote list:", updatedVoteList);

  // updates session with user vote
  try {
    const updatedSession = await Session.findOneAndUpdate(
      { _id: sessionID },
      {
        votes: updatedVoteList,
      },
      { new: true },
    );
    console.log("updated session:", updatedSession);
    res.status(200).json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log(error);
  }
};

const clearVotes = async (req, res) => {
  const { sessionID, voteList } = req.body;

  // sets all votes to 0
  const updatedVoteList = voteList.map((voter) => ({
    ...voter,
    vote: "0",
    voteMessage: "Participant has not voted",
  }));
  try {
    const session = await Session.findOneAndUpdate(
      { _id: sessionID },
      {
        votes: updatedVoteList,
        status: "voting",
      },
      { new: true },
    );
    console.log("Cleared votes");
    res.status(200).json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log(error);
  }
};

module.exports = {
  getSession,
  createSession,
  updateSession,
  addUserToSession,
  removeUserFromSession,
  updateUserHasVoted,
  clearVotes,
};
