const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const participantSchema = new mongoose.Schema({
  userID: {
    type: Schema.Types.ObjectId,
  },
  name: {
    type: String,
  },
  role: {
    type: String,
  },
});

const voteSchema = new mongoose.Schema({
  userID: {
    type: Schema.Types.ObjectId,
  },
  name: {
    type: String,
  },
  vote: {
    type: String,
  },
  voteMessage: {
    type: String,
    default: "Participant has not voted",
  },
});

const storySchema = new mongoose.Schema({
    title: {
        type: String
    },
    description: {
        type: String
    },
    number: {
        type: Number
    },
    storyLink: {
        type: String
    }
})

const SessionSchema = new Schema({
  participants: [participantSchema],
  votes: [voteSchema],
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  voteDeck: {
    type: Array,
  },
  status: {
    type: String,
    default: "voting",
  },
  majorityVote: {
    type: Number,
  },
  averageVote: {
    type: Number,
  },
  highestVote: {
    type: Number,
  },
  lowestVote: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Session", SessionSchema);
