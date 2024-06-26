const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
});

const SessionSchema = new Schema({
  participants: [
    {
      type: Schema.Types.ObjectId,
    },
  ],
  votes: [voteSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Session", SessionSchema);
