import { Realtime } from "ably";
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

const ably = new Realtime({
  key: "6IU7TA.IELGww:d-oIjlDQosW33FkgLwAe7e8CMxs-U6-KlT7jfbaflRg",
  echoMessages: false,
});

function PokerSessionPage() {
  const navigate = useNavigate();
  const { room } = useParams();
  const channel = ably.channels.get(`planning-poker-${room}`);

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
    const handleUserJoined = (message) => {
      setParticipantList((prevUserList) => [
        ...prevUserList,
        {
          id: message.data.participantID,
          userID: message.data.userID,
          name: message.data.name,
          role: message.data.role,
        },
      ]);
      if (message.data.role === "voter") {
        setVoteList((prevUserList) => [
          ...prevUserList,
          {
            id: message.data.voteID,
            userID: message.data.userID,
            name: message.data.name,
            vote: "0",
            voteMessage: "Participant has not voted",
          },
        ]);
        setShowVotes(false);
      }
    };

    const handleUserLeft = (message) => {
      setParticipantList((prevUserList) =>
        prevUserList.filter(
          (participant) => participant.userID !== message.data.userID,
        ),
      );
      if (message.data.userRole === "voter") {
        setVoteList((prevUserList) =>
          prevUserList.filter((voter) => voter.userID !== message.data.userID),
        );
      }
    };

    const handleUserVoted = (message) => {
      setVoteList((prevUserList) =>
        prevUserList.map((voter) => {
          if (voter.userID === message.data.userID) {
            return {
              ...voter,
              vote: message.data.vote,
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

    const handleUserKicked = (message) => {
      if (userID === message.data.userID) {
        alert("You have been kicked from the session!");
        navigate("/");
      } else {
        setParticipantList((prevUserList) =>
          prevUserList.filter(
            (participant) => participant.userID !== message.data.userID,
          ),
        );
        setVoteList((prevUserList) =>
          prevUserList.filter((voter) => voter.userID !== message.data.userID),
        );
      }
    };

    channel.subscribe("join_room", handleUserJoined);
    channel.subscribe("leave_room", handleUserLeft);
    channel.subscribe("select_vote", handleUserVoted);
    channel.subscribe("show_votes", handleRefresh);
    channel.subscribe("reset_votes", handleVotesReset);
    channel.subscribe("kick_user", handleUserKicked);

    // cleans up sockets after disconnect
    return () => {
      channel.unsubscribe("join_room", handleUserJoined);
      channel.unsubscribe("leave_room", handleUserLeft);
      channel.unsubscribe("select_vote", handleUserVoted);
      channel.unsubscribe("show_votes", handleRefresh);
      channel.unsubscribe("reset_votes", handleVotesReset);
      channel.unsubscribe("kick_user", handleUserKicked);
    };
  }, [navigate, channel, room, userID, voteList]);

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

      channel.publish("join_room", {
        room,
        name,
        role,
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
      channel.publish("leave_room", { room, userID, username, userRole });
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
    channel.publish("select_vote", { room, userID, vote: userVote });
  };

  const handleRefresh = async () => {
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
      channel.publish("show_votes", { room });
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
    channel.publish("reset_votes", { room });
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
      channel.publish("kick_user", { room, userID: kickedUserID });
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
