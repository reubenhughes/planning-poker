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
    }
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
  }
});

const SessionSchema = new Schema({
  //participants: [],
  participants: [
    {
        type: Schema.Types.ObjectId
    }
  ],
  votes: [voteSchema],
  majorityVote: {
    type: Number
  },
  averageVote: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Session", SessionSchema);
