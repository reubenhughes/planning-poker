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
        prevUserList.filter(
          (participant) => participant.userID !== data.userID,
        ),
      );
      if (data.userRole === "Voter") {
        setVoteList((prevUserList) =>
          prevUserList.filter((voter) => voter.userID !== data.userID),
        );
      }
    };

    const handleUserVoted = (data) => {
      setVoteList((prevUserList) =>
        prevUserList.map((voter) => {
          if (voter.userID === data.userID) {
            return {
              ...voter,
              vote: data.vote,
              voteMessage: "Participant has voted",
            };
          } else {
            return voter;
          }
        }),
      );
    };

    const handleRefresh = async () => {
      setShowVotes(true);
      const response = await fetch(
        `http://localhost:3001/api/sessions/${room}`,
      );
      const json = await response.json();

      if (response.ok) {
        setParticipantList(
          json.participants.map((participant) => ({
            id: participant._id,
            userID: participant.userID,
            name: participant.name,
            role: participant.role,
          })),
        );
        setVoteList(
          json.votes.map((voter) => ({
            id: voter._id,
            userID: voter.userID,
            name: voter.name,
            vote: voter.vote,
            voteMessage: voter.voteMessage,
          })),
        );
        setSession(json);
      } else {
        console.error("Failed to fetch session");
      }
    };

    const handleVotesReset = () => {
      setVoteList(
        voteList.map((voter) => ({
          ...voter,
          vote: "0",
          voteMessage: "Participant has not voted",
        })),
      );
      setShowVotes(false);
      setUserVoted(false);
    };

    const handleUserKicked = (data) => {
      if (userID === data.userID) {
        alert("You have been kicked from the session!");
        navigate("/");
      } else {
        setParticipantList((prevUserList) =>
          prevUserList.filter(
            (participant) => participant.userID !== data.userID,
          ),
        );
        setVoteList((prevUserList) =>
          prevUserList.filter((voter) => voter.userID !== data.userID),
        );
      }
    };

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
  }, [participantList, voteList, room, navigate, userID]);

  const handleJoin = async ({ name, role }) => {
    const response = await fetch("http://localhost:3001/api/sessions/addUser", {
      method: "POST",
      body: JSON.stringify({
        sessionID: room,
        name,
        role,
        vote: "0",
        voteMessage: "Participant has not voted",
      }),
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
        json.session.participants.map((participant) => ({
          id: participant._id,
          userID: participant.userID,
          name: participant.name,
          role: participant.role,
        })),
      );
      setVoteList(
        json.session.votes.map((voter) => ({
          id: voter._id,
          userID: voter.userID,
          name: voter.name,
          vote: voter.vote,
          voteMessage: voter.voteMessage,
        })),
      );

      socket.emit("join_room", {
        name,
        role,
        room,
        participantID: json.participantArrayID,
        voteID: json.voteArrayID,
        userID: json.userID,
      });
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
    if (!userVoted) {
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
      const json = await response.json();
      if (response.ok) {
        console.log("user vote updated");
      } else {
        console.error("couldn't update user vote", json);
      }

      setVoteList(
        voteList.map((voter) => {
          if (voter.userID === userID) {
            return {
              ...voter,
              vote: userVote,
              voteMessage: "Participant has voted",
            };
          } else {
            return voter;
          }
        }),
      );
    } else {
      setVoteList(
        voteList.map((voter) => {
          if (voter.userID === userID) {
            return { ...voter, vote: userVote };
          } else {
            return voter;
          }
        }),
      );
    }
    setVote(userVote);
    socket.emit("select_vote", { userID, room, vote: userVote });
  };

  const handleRefresh = async () => {
    const response = await fetch(`http://localhost:3001/api/sessions/${room}`);
    const json = await response.json();
    if (response.ok) {
      setParticipantList(
        json.participants.map((participant) => ({
          id: participant._id,
          userID: participant.userID,
          name: participant.name,
          role: participant.role,
        })),
      );
      
      setVoteList(
        json.votes.map((voter) => ({
          id: voter._id,
          userID: voter.userID,
          name: voter.name,
          vote: voter.vote,
          voteMessage: voter.voteMessage,
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
        body: JSON.stringify({
          id: room,
          session,
          participantList,
          oldVoteList: voteList,
        }),
        headers: { "Content-Type": "application/json" },
      },
    );
    await response.json();
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
    await response.json();
    if (response.ok) {
      console.log("votes cleared");
    } else {
      console.error("Failed to clear votes");
    }

    setVoteList(
      voteList.map((voter) => ({
        ...voter,
        vote: "0",
        voteMessage: "Participant has not voted",
      })),
    );
    setUserVoted(false);
    setShowVotes(false);
    socket.emit("reset_votes", { room });
  };

  const handleKick = async (kickedUserID) => {
    const response = await fetch(
      `http://localhost:3001/api/sessions/${room}/removeUser`,
      {
        method: "PATCH",
        body: JSON.stringify({
          id: room,
          userID: kickedUserID,
          participantList,
          voteList,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const json = await response.json();

    setParticipantList((prevUserList) =>
      prevUserList.filter((participant) => participant.userID !== kickedUserID),
    );
    setVoteList((prevUserList) =>
      prevUserList.filter((voter) => voter.userID !== kickedUserID),
    );

    if (response.ok) {
      socket.emit("kick_user", { room, userID: kickedUserID });
    } else {
      console.error("Failed to kick user ", json);
    }
  };

  return (
    <div className="App">
      <NameForm onJoin={handleJoin} />
      <h2>Room: {room}</h2>
      <h3>Hello, {username}</h3>
      <h3>Role: {userRole}</h3>
      <ParticipantList
        voteList={voteList}
        showVotes={showVotes}
        userID={userID}
        onKick={handleKick}
      />
      <VoteButtonGroup selectVote={handleVoteUpdate} />
      <LeaveSessionAlert leaveSession={handleLeave}></LeaveSessionAlert>
      {userVoted && <h3>Vote: {vote}</h3>}
      <Button
        onClick={handleShowVotes}
        variant="contained"
        disabled={showVotes}
      >
        Show Votes
      </Button>
      <button onClick={handleResetVotes}>New Round</button>
      {showVotes && (
        <div className="votingStats">
          <h4>Majority vote: {session.majorityVote}</h4>
          <h4>Average vote: {session.averageVote}</h4>
        </div>
      )}
    </div>
  );
}

export default PokerSessionPage;
