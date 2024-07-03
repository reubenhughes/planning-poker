import io from "socket.io-client";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import NameForm from "../components/NameForm";
import ParticipantList from "../components/ParticipantList";
import LeaveSessionAlert from "../components/LeaveSessionAlert";
import VoteButtonGroup from "../components/VoteButtonGroup";
import Button from "@mui/material/Button";

const socket = io.connect("http://localhost:3001");

function PokerSessionPage() {
  const { room } = useParams();
  const navigate = useNavigate();
  const [userID, setUserID] = useState("");
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");
  const [session, setSession] = useState("");
  const [participantList, setParticipantList] = useState([]);
  const [voteList, setVoteList] = useState([]);
  const [vote, setVote] = useState("");
  const [userVoted, setUserVoted] = useState(false);
  const [showVotes, setShowVotes] = useState(false);

  useEffect(() => {
    const handleUserJoined = (data) => {
      setParticipantList((prevUserList) => [
        ...prevUserList,
        {
          id: data.participantID,
          userID: data.userID,
          name: data.name,
          role: data.role,
        },
      ]);
      if (data.role === "Voter") {
        setVoteList((prevUserList) => [
          ...prevUserList,
          {
            id: data.voteID,
            userID: data.userID,
            name: data.name,
            vote: "0",
            voteMessage: "Participant has not voted",
          },
        ]);
      }
    };

    const handleUserLeft = (data) => {
      setParticipantList((prevUserList) =>
        prevUserList.filter((user) => user.userID !== data.userID),
      );
      if (data.userRole === "Voter") {
        setVoteList((prevUserList) =>
          prevUserList.filter((user) => user.userID !== data.userID),
        );
      }
    };

    const handleUserVoted = (data) => {
      setVoteList((prevUserList) =>
        prevUserList.map((user) => {
          if (user.userID === data.userID) {
            return {
              ...user,
              vote: data.vote,
              voteMessage: "Participant has voted"
            };
          } else {
            return user;
          }
        }),
      );
    };

    const handleRefresh = async (data) => {
      setShowVotes(true);
      const response = await fetch(
        `http://localhost:3001/api/sessions/${room}`,
      );
      const json = await response.json();

      if (response.ok) {
        setParticipantList(
          json.participants.map((user) => ({
            id: user._id,
            userID: user.userID,
            name: user.name,
            role: user.role,
          })),
        );
        setVoteList(
          json.votes.map((user) => ({
            id: user._id,
            userID: user.userID,
            name: user.name,
            vote: user.vote,
            voteMessage: user.voteMessage,
          })),
        );
        setSession(json);
      } else {
        console.error("Failed to fetch session");
      }
    };

    const handleVotesReset = (data) => {
      setVoteList(
        voteList.map((user) => ({
            ...user,
          vote: "0",
          voteMessage: "Participant has not voted",
        })),
      );
      setShowVotes(false);
      setUserVoted(false)
    };

    const handleUserKicked = (data) => {
        if (userID === data.userID) {
            alert("You have been kicked from the session!")
            navigate("/")
        } else {
            setParticipantList((prevUserList) =>
                prevUserList.filter((user) => user.userID !== data.userID),
              );
            setVoteList((prevUserList) =>
                prevUserList.filter((user) => user.userID !== data.userID),
            );
        }
    }

    socket.on("user_joined", handleUserJoined);
    socket.on("user_left", handleUserLeft);
    socket.on("user_voted", handleUserVoted);
    socket.on("votes_shown", handleRefresh);
    socket.on("votes_reset", handleVotesReset);
    socket.on("user_kicked", handleUserKicked);

    return () => {
      socket.off("user_joined", handleUserJoined);
      socket.off("user_left", handleUserLeft);
      socket.off("user_voted", handleUserVoted);
      socket.off("votes_shown", handleRefresh);
      socket.off("votes_reset", handleVotesReset);
      socket.off("user_kicked", handleUserKicked);
    };
  }, [participantList, voteList, room]);

  const handleJoin = async ({ name, role }) => {
    const response = await fetch("http://localhost:3001/api/sessions/addUser", {
      method: "POST",
      body: JSON.stringify({ sessionID: room, name, role, vote: "0", voteMessage: "Participant has not voted"}),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await response.json();

    if (response.ok) {
      setSession(json.session);
      setUserID(json.userID);
      setUsername(name);
      setUserRole(role);
      setParticipantList(
        json.session.participants.map((user) => ({
          id: user._id,
          userID: user.userID,
          name: user.name,
          role: user.role,
        })),
      );
      setVoteList(
        json.session.votes.map((user) => ({
          id: user._id,
          userID: user.userID,
          name: user.name,
          vote: user.vote,
          voteMessage: user.voteMessage,
        })),
      );

      console.log("participantslist:", json.session.participants.map((user) => ({
        id: user._id,
        userID: user.userID,
        name: user.name,
        role: user.role,
      })))
      console.log("vote list:", json.session.votes.map((user) => ({
        id: user._id,
        userID: user.userID,
        name: user.name,
        vote: user.vote,
        voteMessage: user.voteMessage,
      })))

      socket.emit("join_room", { name, role, room, participantID: json.participantArrayID, voteID: json.voteArrayID, userID: json.userID });
    } else {
      console.error("Failed to join session: ", json);
    }
  };

  const handleLeave = async () => {
    const response = await fetch(
      `http://localhost:3001/api/sessions/${room}/removeUser`,
      {
        method: "PATCH",
        body: JSON.stringify({ id: room, userID, participantList, voteList }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const json = await response.json();

    if (response.ok) {
      socket.emit("leave_room", { userID, username, userRole, room });
      navigate("/");
    } else {
      console.error("Failed to leave session ", json);
    }
  };

  const handleVoteUpdate = async (userVote) => {
    testThing()
    console.log("user voted?", userVoted)
    if (!userVoted) {
        console.log("step into here")
        console.log("voteList:", voteList)
      setUserVoted(true);
      const response = await fetch(
        `http://localhost:3001/api/sessions/${room}/updateUserHasVoted`,
        {
          method: "PATCH",
          body: JSON.stringify({ id: room, userID, userVote, voteList }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const json = await response.json()
      if (response.ok) {
      } else {
        console.error("couldn't update user vote", json)
      }

      console.log(voteList)
      setVoteList(
        voteList.map((user) => {
          if (user.userID === userID) {
            return {
              ...user,
              vote: userVote,
              voteMessage: "Participant has voted",
            };
          } else {
            return user;
          }
        }),
      );
      console.log("vote list:", voteList.map((user) => {
        if (user.userID === userID) {
          return {
            ...user,
            vote: userVote,
            voteMessage: "Participant has voted",
          };
        } else {
          return user;
        }
      }))
    } else {
      setVoteList(
        voteList.map((user) => {
          if (user.userID === userID) {
            return { ...user, vote: userVote };
          } else {
            return user;
          }
        }),
      );
    }
    setVote(userVote);
    socket.emit("select_vote", { userID, room, vote: userVote });
  };

  const handleTestClick = () => {
    setShowVotes(!showVotes);
  };

  const testThing = () => {
    console.log("testing")
    console.log("vote list:", voteList)
    console.log("participant list:", participantList)
  }

  const handleRefresh = async () => {
    const response = await fetch(`http://localhost:3001/api/sessions/${room}`);
    const json = await response.json();

    console.log("participants list:", json.participants.map((user) => ({
        id: user._id,
        userID: user.userID,
        name: user.name,
        role: user.role,
      })))

      console.log("vote list:", json.votes.map((user) => ({
        id: user._id,
        userID: user.userID,
        name: user.name,
        vote: user.vote,
        voteMessage: user.voteMessage,
      })))

    if (response.ok) {
      setParticipantList(
        json.participants.map((user) => ({
          id: user._id,
          userID: user.userID,
          name: user.name,
          role: user.role,
        })),
      );
      setVoteList(
        json.votes.map((user) => ({
          id: user._id,
          userID: user.userID,
          name: user.name,
          vote: user.vote,
          voteMessage: user.voteMessage,
        })),
      );
      setSession(json);
    } else {
      console.error("Failed to fetch session");
    }
  };

  const handleShowVotes = async () => {
    setShowVotes(true);
    const response = await fetch(
      `http://localhost:3001/api/sessions/${room}/updateSession`,
      {
        method: "PATCH",
        body: JSON.stringify({ id: room, session, participantList, oldVoteList: voteList }),
        headers: { "Content-Type": "application/json" },
      },
    );
    const json = await response.json();
    if (response.ok) {
      socket.emit("show_votes", { room });
      handleRefresh();
    } else {
      console.error("Failed to update session");
    }
  };

  const handleResetVotes = async () => {
    const response = await fetch(
        `http://localhost:3001/api/sessions/${room}/clearVotes`,
        {
          method: "PATCH",
          body: JSON.stringify({ id: room, voteList }),
          headers: { "Content-Type": "application/json" },
        },
      );
      const json = await response.json()
      if (response.ok) {
        console.log("votes cleared")
      } else {
        console.error("Failed to clear votes")
      }
    console.log("voteList before changes:", voteList)
    setVoteList(
      voteList.map((user) => ({
        ...user,
        vote: "0",
        voteMessage: "Participant has not voted",
      })),
    );
    setUserVoted(false);
    setShowVotes(false);
    console.log("handleResetvotes:", voteList.map((user) => ({
        ...user,
        vote: "0",
        voteMessage: "Participant has not voted",
      })));
    testThing()
    socket.emit("reset_votes", { room });
  };

  const handleTestKick = async (kickedUserID) => {
    const response = await fetch(
        `http://localhost:3001/api/sessions/${room}/removeUser`,
        {
          method: "PATCH",
          body: JSON.stringify({ id: room, userID: kickedUserID, participantList, voteList }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const json = await response.json();

      setParticipantList((prevUserList) =>
        prevUserList.filter((user) => user.userID !== kickedUserID),
      );
        setVoteList((prevUserList) =>
          prevUserList.filter((user) => user.userID !== kickedUserID),
        );

      if (response.ok) {
        socket.emit("kick_user", { room, userID: kickedUserID });
      } else {
        console.error("Failed to kick user ", json);
      }
  }

  return (
    <div className="App">
      <NameForm onJoin={handleJoin} />
      <h2>Room: {room}</h2>
      <h3>Hello, {username}</h3>
      <h3>Role: {userRole}</h3>
      <ParticipantList voteList={voteList} showVotes={showVotes} userID={userID} onKick={handleTestKick}/>
      <VoteButtonGroup selectVote={handleVoteUpdate} />
      <LeaveSessionAlert leaveSession={handleLeave}></LeaveSessionAlert>
      {userVoted && <h3>Vote: {vote}</h3>}
      {participantList.map((user) => (
        <h3 key={user.id}>
          Participant: {user.name} Role: {user.role}
        </h3>
      ))}
      <Button
        onClick={handleShowVotes}
        variant="contained"
        disabled={showVotes}
      >
        Show Votes
      </Button>
      <button onClick={handleTestClick}>Show votes toggler</button>
      <button onClick={handleResetVotes}>New Round</button>
      {showVotes && (
        <div className="votingStats">
          <h4>Majority vote: {session.majorityVote}</h4>
          <h4>Average vote: {session.averageVote}</h4>
        </div>
      )}
      <button onClick={testThing}>testingthing</button>
    </div>
  );
}

export default PokerSessionPage;
