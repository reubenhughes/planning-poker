import io from "socket.io-client";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import NameForm from "../components/NameForm";
import ParticipantList from "../components/ParticipantList";
import LeaveSessionAlert from "../components/LeaveSessionAlert";

const socket = io.connect("http://localhost:3001");

function PokerSessionPage() {
  const { room } = useParams();
  const navigate = useNavigate();
  const [userID, setUserID] = useState("");
  const [username, setUsername] = useState("");
  const [userList, setUserList] = useState([]);
  const [session, setSession] = useState("");

  useEffect(() => {
    const handleUserJoined = (data) => {
      setUserList((prevUserList) => [
        ...prevUserList,
        { id: data.userID, name: data.name, vote: "0" },
      ]);
      alert(`user ${data.name} joined`);
    };

    const handleUserLeft = (data) => {
      setUserList((prevUserList) =>
        prevUserList.filter((user) => user.id !== data.userID),
      );
    };

    socket.on("user_joined", handleUserJoined);
    socket.on("user_left", handleUserLeft);

    socket.on("receive_message", (data) => {});

    return () => {
      socket.off("user_joined", handleUserJoined);
      socket.off("user_left", handleUserLeft);
    };
  }, [socket]);

  const handleJoin = async (name) => {
    const response = await fetch("http://localhost:3001/api/sessions/addUser", {
      method: "POST",
      body: JSON.stringify({ sessionID: room, name, vote: "0" }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await response.json();

    if (response.ok) {
      setSession(json.session);
      setUsername(name);
      setUserID(json.userID);
      setUserList(
        json.session.votes.map((user) => ({
          id: user.userID,
          name: user.name,
          vote: user.vote,
        })),
      );
      socket.emit("join_room", { name, room, userID: json.userID });
    } else {
      console.error("Failed to join session: ", json);
    }
  };

  const handleLeave = async () => {
    const response = await fetch(
      `http://localhost:3001/api/sessions/${room}/removeUser`,
      {
        method: "PATCH",
        body: JSON.stringify({ id: room, userID, session }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const json = await response.json();

    if (response.ok) {
      socket.emit("leave_room", { userID, username, room });
      navigate("/");
    } else {
      console.error("Failed to leave session ", json);
    }
  };

  return (
    <div className="App">
      <NameForm onJoin={handleJoin} />
      <h2>Room: {room}</h2>
      <h3>Hello, {username}</h3>
      <ParticipantList userList={userList} />
      <LeaveSessionAlert leaveSession={handleLeave}></LeaveSessionAlert>
    </div>
  );
}

export default PokerSessionPage;
