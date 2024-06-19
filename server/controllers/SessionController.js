const Session = require("../models/SessionSchema");

const getSession = async (req, res) => {
    const { id } = req.params;
    try {
        const session = await Session.findById(id);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const createSession = async (req, res) => {
    const {
        participants,
        votes,
        createdAt
    } = req.body;

    try {
        const session = await Session.create({
            participants,
            votes,
            createdAt
        });
        res.status(200).json(session);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getSession,
    createSession
};