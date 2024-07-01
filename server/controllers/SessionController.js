const Session = require("../models/SessionSchema");
const Mongoose = require("mongoose");

const getSession = async (req, res) => {
  const { id } = req.params;
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
  const { participants, votes, majorityVote, averageVote, createdAt } =
    req.body;
  try {
    const session = await Session.create({
      participants,
      votes,
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
  const { id, session, oldVoteList } = req.body;
  let majorityVote = "0";
  let averageVote = "0";
  let totalVotes = 0;

  let voteCounts = [
    { id: "1", value: "1", count: "0" },
    { id: "2", value: "2", count: "0" },
    { id: "3", value: "3", count: "0" },
    { id: "4", value: "5", count: "0" },
    { id: "5", value: "8", count: "0" },
    { id: "6", value: "13", count: "0" },
    { id: "7", value: "21", count: "0" },
    { id: "8", value: "34", count: "0" },
    { id: "9", value: "?", count: "0" },
  ];
  let mf = 1;
  let m = 0;
  let item;

  console.log("vote list:", oldVoteList);
  console.log("session participants:", session.participants);
  console.log("session:", session);

  const updatedVoteList = oldVoteList.map((user) => ({
    ...user,
    userID: user.id,
  }));

  const voteList = updatedVoteList
    .filter((user) => user.vote != "0" && user.vote != "?")
    .map((user) => user.vote);
  //const voteList = filteredVoteList.map((user) => (user.vote))
  console.log("votes:", voteList);
  console.log(voteList.length);

  try {
    majorityVote = voteList[0];
  } catch {
    majorityVote = "0";
  }
  // Iterate through the array to find the most frequent item
  for (var i = 0; i < voteList.length; i++) {
    // Nested loop to compare the current item with others in the array
    for (var j = i; j < voteList.length; j++) {
      // Check if the current item matches with another item in the array
      if (voteList[i] == voteList[j]) m++;
      // Update the most frequent item and its frequency if the current item's frequency is higher
      if (mf < m) {
        mf = m;
        majorityVote = voteList[i];
      }
    }
    if (voteList[i] != "0" && voteList[i] != "?") {
      totalVotes += Number(voteList[i]);
    }
    // Reset the current item's frequency for the next iteration
    m = 0;
  }

  if (voteList.length == 0) {
    averageVote = "0";
  } else {
    averageVote = (totalVotes / voteList.length).toFixed(1);
  }

  // Output the most frequent item and its frequency
  console.log(majorityVote + " ( " + mf + " times ) ");
  console.log("Total count:", totalVotes);
  console.log("Majority vote:", majorityVote);
  console.log("Average vote:", averageVote);

  try {
    const updatedSession = await Session.findOneAndUpdate(
      { _id: id },
      {
        participants: session.participants,
        votes: updatedVoteList,
        majorityVote: majorityVote,
        averageVote: averageVote,
        createdAt: session.createdAt,
      },
    );
    res.status(200).json(updatedSession);
  } catch (error) {
    res.status(400).json({ message: error.messsage });
    console.log(error);
  }
};

const addUserToSession = async (req, res) => {
  const { sessionID, name, role, vote } = req.body;
  const userID = new Mongoose.Types.ObjectId();
  const userParticipantObj = { userID, name, role };
  const userVoteObj = { userID, name, vote };

  try {
    const session = await Session.findById(sessionID);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (!session.participants.includes(userID)) {
      session.participants.push(userParticipantObj);
      if (role == "Voter") {
        session.votes.push(userVoteObj);
      }
      await session.save();
    }
    res.status(200).json({ session: session, userID: userID });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const removeUserFromSession = async (req, res) => {
  const { id, userID, participantList, voteList } = req.body;
  console.log("Participant list:", participantList);
  const updatedParticipantList = participantList.filter(
    (participant) => participant.userID !== userID,
  );
  const updatedVoteList = voteList.filter((vote) => vote.userID !== userID);
  try {
    const updatedSession = await Session.findOneAndUpdate(
      { _id: id },
      {
        participants: updatedParticipantList,
        votes: updatedVoteList,
      },
    );
    console.log("updated session:", updatedSession);
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
