const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const sessionController = require("../controllers/SessionController");
const Session = require("../models/SessionSchema");

const app = express();
app.use(express.json());
app.get("/session/:id", sessionController.getSession);
app.post("/session", sessionController.createSession);
app.put("/session", sessionController.updateSession);
app.put("/session/addUser", sessionController.addUserToSession);
app.put("/session/removeUser", sessionController.removeUserFromSession);
app.put("/session/vote", sessionController.updateUserHasVoted);
app.put("/session/clearVotes", sessionController.clearVotes);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Session.deleteMany({});
});

describe("Session Controller", () => {
  it("should create a new session", async () => {
    const res = await request(app)
      .post("/session")
      .send({
        participants: [],
        votes: [],
        title: "Test Session",
        description: "No Description",
        voteDeck: ["1", "2", "3", "5", "8", "13", "21", "34", "?"],
        status: "voting",
        majorityVote: "0",
        averageVote: "0",
        createdAt: new Date(),
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("_id");
  });

  it("should get a session by id", async () => {
    const session = await Session.create({
      participants: [],
      votes: [],
      title: "Test Session",
      description: "No Description",
      voteDeck: ["1", "2", "3", "5", "8", "13", "21", "34", "?"],
      status: "voting",
      majorityVote: "0",
      averageVote: "0",
      createdAt: new Date(),
    });
    const res = await request(app).get(`/session/${session._id}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(session._id.toString());
  });

  it("should return 404 if session not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/session/${fakeId}`);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Session not found", status: 404 });
  });

  it("should add a user to a session", async () => {
    const session = await Session.create({
      participants: [],
      votes: [],
      title: "Test Session",
      description: "No Description",
      voteDeck: ["1", "2", "3", "5", "8", "13", "21", "34", "?"],
      status: "voting",
      majorityVote: "0",
      averageVote: "0",
      createdAt: new Date(),
    });
    const res = await request(app).put("/session/addUser").send({
      sessionID: session._id,
      name: "John Doe",
      role: "voter",
      vote: "5",
      voteMessage: "Participant has not voted",
    });
    expect(res.status).toBe(200);
    expect(res.body.session.participants.length).toBe(1);
  });

  it("should remove a user from a session", async () => {
    const participantId = new mongoose.Types.ObjectId();
    const session = await Session.create({
      participants: [
        { userID: participantId, name: "John Doe", role: "voter" },
      ],
      votes: [
        {
          userID: participantId,
          name: "John Doe",
          vote: "5",
          voteMessage: "Participant has not voted",
        },
      ],
      title: "Test Session",
      description: "No Description",
      voteDeck: ["1", "2", "3", "5", "8", "13", "21", "34", "?"],
      status: "voting",
      majorityVote: "5",
      averageVote: "5",
      createdAt: new Date(),
    });
    const res = await request(app).put("/session/removeUser").send({
      sessionID: session._id,
      userID: participantId,
      participantList: session.participants,
      voteList: session.votes,
    });
    expect(res.status).toBe(200);
    expect(res.body.participants.length).toBe(0);
  });

  it("should update user vote", async () => {
    const participantId = new mongoose.Types.ObjectId();
    const session = await Session.create({
      participants: [
        { userID: participantId, name: "John Doe", role: "voter" },
      ],
      votes: [
        {
          userID: participantId,
          name: "John Doe",
          vote: "0",
          voteMessage: "Participant has not voted",
        },
      ],
      title: "Test Session",
      description: "No Description",
      voteDeck: ["1", "2", "3", "5", "8", "13", "21", "34", "?"],
      status: "voting",
      majorityVote: "0",
      averageVote: "0",
      createdAt: new Date(),
    });
    const res = await request(app).put("/session/vote").send({
      sessionID: session._id,
      userID: participantId,
      userVote: "5",
      voteList: session.votes,
    });
    expect(res.status).toBe(200);
    expect(res.body.votes[0].vote).toBe("5");
  });

  it("should clear votes", async () => {
    const session = await Session.create({
      participants: [],
      votes: [
        {
          userID: new mongoose.Types.ObjectId(),
          name: "John Doe",
          vote: "5",
          voteMessage: "Participant has not voted",
        },
      ],
      title: "Test Session",
      description: "No Description",
      voteDeck: ["1", "2", "3", "5", "8", "13", "21", "34", "?"],
      status: "finished",
      majorityVote: "5",
      averageVote: "5",
      createdAt: new Date(),
    });
    const res = await request(app).put("/session/clearVotes").send({
      sessionID: session._id,
      voteList: session.votes,
    });
    expect(res.status).toBe(200);
    expect(res.body.votes[0].vote).toBe("0");
    expect(res.body.status).toBe("voting");
  });
});
