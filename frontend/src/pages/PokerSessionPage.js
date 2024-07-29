import io from "socket.io-client";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";

// imports from components folder
import NameForm from "../components/NameForm";
import LeaveSessionButton from "../components/LeaveSessionButton";
import ParticipantList from "../components/ParticipantList";
import VoteButtonGroup from "../components/VoteButtonGroup";

//const socket = io.connect("https://planning-poker-server-seven.vercel.app", {
  //  withCredentials: true
  //});

function PokerSessionPage() {
  const navigate = useNavigate();
  const { room } = useParams();

  // user variables
  const [userID, setUserID] = useState("");
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("voter");
  const [userVoted, setUserVoted] = useState(false);
  const [vote, setVote] = useState("0");

  // session variables
  const [participantList, setParticipantList] = useState([]);
  const [session, setSession] = useState("");
  const [sessionStatus, setSessionStatus] = useState("");
  const [showVotes, setShowVotes] = useState(false);
  const [voteDeck, setVoteDeck] = useState([]);
  const [voteList, setVoteList] = useState([]);

  // listens for web socket messages
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
      if (data.role === "voter") {
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
        setShowVotes(false);
      }
    };

    const handleUserLeft = (data) => {
      setParticipantList((prevUserList) =>
        prevUserList.filter(
          (participant) => participant.userID !== data.userID,
        ),
      );
      if (data.userRole === "voter") {
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
        `https://planning-poker-server-seven.vercel.app/api/sessions/${room}`,
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
        setSessionStatus(json.status);
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
      setSessionStatus("voting");
      setVote("0");
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

    //socket.on("user_joined", handleUserJoined);
    //socket.on("user_left", handleUserLeft);
    //socket.on("user_voted", handleUserVoted);
    //socket.on("votes_shown", handleRefresh);
    //socket.on("votes_reset", handleVotesReset);
    //socket.on("user_kicked", handleUserKicked);

    // cleans up sockets after disconnect
    return () => {
      //socket.off("user_joined", handleUserJoined);
      //socket.off("user_left", handleUserLeft);
      //socket.off("user_voted", handleUserVoted);
      //socket.off("votes_shown", handleRefresh);
      //socket.off("votes_reset", handleVotesReset);
      //socket.off("user_kicked", handleUserKicked);
    };
  }, [navigate, room, userID, voteList]);

  // sends web socket messages on actions from the user
  const handleJoin = async ({ name, role }) => {
    const response = await fetch(
      `https://planning-poker-server-seven.vercel.app/api/sessions/${room}/addUser`,
      {
        method: "PATCH",
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
      },
    );
    const json = await response.json();

    if (response.ok) {
      setSession(json.session);
      setUserID(json.userID);
      setUsername(name);
      setUserRole(role);
      setVoteDeck(json.session.voteDeck);
      setSessionStatus(json.session.status);
      if (role === "observer" && json.session.status === "finished") {
        setShowVotes(true);
      }
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

      //socket.emit("join_room", {
        //room,
        //name,
        //role,
        //participantID: json.participantArrayID,
        //voteID: json.voteArrayID,
        //userID: json.userID,
      //});
    } else {
      console.error("Failed to join session: ", json);
    }
  };

  const handleLeave = async () => {
    const response = await fetch(
      `https://planning-poker-server-seven.vercel.app/api/sessions/${room}/removeUser`,
      {
        method: "PATCH",
        body: JSON.stringify({
          sessionID: room,
          userID,
          participantList,
          voteList,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const json = await response.json();

    if (response.ok) {
      //socket.emit("leave_room", { room, userID, username, userRole });
      navigate("/");
    } else {
      console.error("Failed to leave session ", json);
    }
  };

  const handleVoteUpdate = async (userVote) => {
    if (!userVoted) {
      setUserVoted(true);
      const response = await fetch(
        `https://planning-poker-server-seven.vercel.app/api/sessions/${room}/updateUserHasVoted`,
        {
          method: "PATCH",
          body: JSON.stringify({ sessionID: room, userID, userVote, voteList }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const json = await response.json();
      if (response.ok) {
      } else {
        console.error("Couldn't update user vote", json);
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
      const response = await fetch(
        `https://planning-poker-server-seven.vercel.app/api/sessions/${room}/updateUserHasVoted`,
        {
          method: "PATCH",
          body: JSON.stringify({ sessionID: room, userID, userVote, voteList }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const json = await response.json();
      if (response.ok) {
      } else {
        console.error("Couldn't update user vote", json);
      }

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
    //socket.emit("select_vote", { room, userID, vote: userVote });
  };

  const handleRefresh = async () => {
    const response = await fetch(`https://planning-poker-server-seven.vercel.app/api/sessions/${room}`);
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
      setSessionStatus(json.status);
    } else {
      console.error("Failed to refresh session");
    }
  };

  const handleShowVotes = async () => {
    setShowVotes(true);
    const response = await fetch(
      `https://planning-poker-server-seven.vercel.app/api/sessions/${room}/updateSession`,
      {
        method: "PATCH",
        body: JSON.stringify({
          sessionID: room,
          session,
          participantList,
          oldVoteList: voteList,
        }),
        headers: { "Content-Type": "application/json" },
      },
    );
    await response.json();
    if (response.ok) {
      //socket.emit("show_votes", { room });
      handleRefresh();
    } else {
      console.error("Failed to update session");
    }
  };

  const handleResetVotes = async () => {
    const response = await fetch(
      `https://planning-poker-server-seven.vercel.app/api/sessions/${room}/clearVotes`,
      {
        method: "PATCH",
        body: JSON.stringify({ sessionID: room, voteList }),
        headers: { "Content-Type": "application/json" },
      },
    );
    await response.json();
    if (response.ok) {
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
    setSessionStatus("voting");
    setVote("0");
    //socket.emit("reset_votes", { room });
  };

  const handleKick = async (kickedUserID) => {
    const response = await fetch(
      `https://planning-poker-server-seven.vercel.app/api/sessions/${room}/removeUser`,
      {
        method: "PATCH",
        body: JSON.stringify({
          sessionID: room,
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
      console.log("Kicked user");
      //socket.emit("kick_user", { room, userID: kickedUserID });
    } else {
      console.error("Failed to kick user ", json);
    }
  };

  return (
    <div className="poker-session">
      <NameForm onJoin={handleJoin} />
      <div className="room-info">
        <h3>{session.title}</h3>
        <h4>Description:</h4>
        <h5>{session.description}</h5>
        <Divider variant="middle" />
        <h4>Status: {sessionStatus}</h4>
        <LeaveSessionButton leaveSession={handleLeave}></LeaveSessionButton>
      </div>
      <div className="user-info">
        <h3>Hello, {username}</h3>
        <h4>Role: {userRole}</h4>
        {userRole === "voter" && <h4>Vote: {vote}</h4>}
      </div>
      <div className="session-link">
        <h3>Room Invite</h3>
        <h4>Room ID: {room}</h4>
        <h5>Click this button to copy the link to the session:</h5>
        <Button
          variant="outlined"
          onClick={() =>
            navigator.clipboard.writeText(
              `https://planning-poker-frontend-nu.vercel.app/session/${room}`,
            )
          }
        >
          Copy link
        </Button>
      </div>
      <div className="participant-list">
        <h3>Participants in session</h3>
        <ParticipantList
          voteList={voteList}
          showVotes={showVotes}
          userID={userID}
          onKick={handleKick}
        />
      </div>
      <div className="session-buttons">
        <Stack spacing={2} direction="column">
          <Button
            onClick={handleShowVotes}
            variant="contained"
            disabled={showVotes}
          >
            <span className="material-symbols-outlined">visibility</span>
            Show Votes
          </Button>
          <Divider />
          <Button
            onClick={handleResetVotes}
            variant="contained"
            disabled={!showVotes}
          >
            <span className="material-symbols-outlined">add</span>
            New Round
          </Button>
        </Stack>
      </div>
      <div className="voting-stats">
        <h3>Stats</h3>
        {showVotes ? (
          <>
            <h4>Majority vote: {session.majorityVote}</h4>
            <h4>Average vote: {session.averageVote}</h4>
          </>
        ) : (
          <>
            <h4>Reveal Votes to calculate vote stats</h4>
          </>
        )}
      </div>
      <div className="vote-buttons">
        <VoteButtonGroup
          selectVote={handleVoteUpdate}
          userRole={userRole}
          voteDeck={voteDeck}
          disabled={showVotes}
        />
      </div>
    </div>
  );
}

export default PokerSessionPage;
