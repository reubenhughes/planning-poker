const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SessionSchema = new Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId
            }
        ],
        votes: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId
                },
                vote: String
            }
        ],
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
);

module.exports = mongoose.model('Session', SessionSchema);