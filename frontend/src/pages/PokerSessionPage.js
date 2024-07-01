import io from "socket.io-client";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import NameForm from "../components/NameForm";
import ParticipantList from "../components/ParticipantList";
import LeaveSessionAlert from "../components/LeaveSessionAlert";
import VoteButtonGroup from "../components/VoteButtonGroup";
import Button from '@mui/material/Button';

const socket = io.connect("http://localhost:3001");

function PokerSessionPage() {
  const { room } = useParams();
  const navigate = useNavigate();
  const [userID, setUserID] = useState("");
  const [username, setUsername] = useState("");
  const [session, setSession] = useState("");
  const [voteList, setVoteList] = useState([]);
  const [vote, setVote] = useState("");
  const [userVoted, setUserVoted] = useState(false)
  const [showVotes, setShowVotes] = useState(false);

  useEffect(() => {
    const handleUserJoined = (data) => {
      setVoteList((prevUserList) => [
        ...prevUserList,
        { id: data.userID, name: data.name, vote: "0", voteMessage: "Participant has not voted"},
      ]);
      console.log(voteList)
    };

    const handleUserLeft = (data) => {
      setVoteList((prevUserList) =>
        prevUserList.filter((user) => user.id !== data.userID),
      );
    };

    const handleUserVoted = (data) => {
        setVoteList((prevUserList) =>
            prevUserList.map((user) => {
                if (user.id === data.userID) {
                    return {...user, voteMessage: "Participant has voted", vote: data.vote}
                } else {
                    return user
                }
            })
        )
    }

    const handleRefresh = async (data) => {
        setShowVotes(true);
        const response = await fetch(`http://localhost:3001/api/sessions/${room}`)
        const json = await response.json()
        console.log(json)

        if (response.ok) {
            setVoteList(
                json.votes.map((user) => ({
                  id: user.userID,
                  name: user.name,
                  vote: user.vote,
                  voteMessage: "Participant has not voted"
                })),
              );
              setSession(json)
        } else {
            console.error("Failed to fetch session")
        }
    }

    const handleVotesReset = (data) => {
        setVoteList(
            voteList.map((user) => ({
              id: user.id,
              name: user.name,
              vote: "0",
              voteMessage: "Participant has not voted"
            })),
        );
        setShowVotes(false)
    }

    socket.on("user_joined", handleUserJoined);
    socket.on("user_left", handleUserLeft);
    socket.on("user_voted", handleUserVoted);
    socket.on("votes_shown", handleRefresh);
    socket.on("votes_reset", handleVotesReset);

    return () => {
      socket.off("user_joined", handleUserJoined);
      socket.off("user_left", handleUserLeft);
      socket.off("user_voted", handleUserVoted);
      socket.off("votes_shown", handleRefresh);
      socket.off("votes_reset", handleVotesReset);
    };
  }, [voteList, room]);

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
      setVoteList(
        json.session.votes.map((user) => ({
          id: user.userID,
          name: user.name,
          vote: user.vote,
          voteMessage: "Participant has not voted"
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

  const handleVoteUpdate = (userVote) => {
    console.log(session)
    if (!userVoted) {
        setUserVoted(true);
        setVoteList(voteList.map((user) => {
            if (user.id === userID) {
                return {...user, vote: userVote, voteMessage: "Participated has voted"}
            } else {
                return user
            }
        }));
    } else {
        setVoteList(voteList.map((user) => {
            if (user.id === userID) {
                return {...user, vote: userVote}
            } else {
                return user
            }
        }));
    }
    setVote(userVote)
    socket.emit("select_vote", { userID, room, vote: userVote })
  }

  const handleTestClick = () => {
    setShowVotes(!showVotes)
    console.log(voteList)
    console.log(session.participants)
  }

  const handleRefresh = async () => {
    const response = await fetch(`http://localhost:3001/api/sessions/${room}`)
    const json = await response.json()
    console.log(json)

    if (response.ok) {
        setVoteList(
            json.votes.map((user) => ({
              id: user.userID,
              name: user.name,
              vote: user.vote,
              voteMessage: "Participant has not voted"
            })),
          );
          setSession(json)
    } else {
        console.error("Failed to fetch session")
    }
}
    
  const handleShowVotes = async () => {
    setShowVotes(true)
    const response = await fetch(`http://localhost:3001/api/sessions/${room}/updateSession`, {
        method: "PATCH",
        body: JSON.stringify({ id: room, session, oldVoteList: voteList}),
        headers: {"Content-Type": "application/json"}
    })
    await response.json()
    if (response.ok) {
        socket.emit("show_votes", { room })
        handleRefresh()
    } else {
        console.error("Failed to update session")
    }
  }

  const handleResetVotes = () => {
    setVoteList(
        voteList.map((user) => ({
          id: user.id,
          name: user.name,
          vote: "0",
          voteMessage: "Participant has not voted"
        })),
    );
    setShowVotes(false);
    console.log(voteList)
    socket.emit("reset_votes", { room })
}

  return (
    <div className="App">
      <NameForm onJoin={handleJoin} />
      <h2>Room: {room}</h2>
      <h3>Hello, {username}</h3>
      <ParticipantList voteList={voteList} showVotes={showVotes} />
      <VoteButtonGroup selectVote={handleVoteUpdate}/>
      <LeaveSessionAlert leaveSession={handleLeave}></LeaveSessionAlert>
      <h3>{vote}</h3>
      <Button onClick={handleShowVotes} variant="contained" disabled={showVotes}>Show Votes</Button>
      <button onClick={handleTestClick}>Show votes toggler</button>
      <button onClick={handleResetVotes}>Reset Votes</button>
      {showVotes &&
        <div className="votingStats">
            <h4>Majority vote: {session.majorityVote}</h4>
            <h4>Average vote: {session.averageVote}</h4>
        </div>
      }
    </div>
  );
}

export default PokerSessionPage;
