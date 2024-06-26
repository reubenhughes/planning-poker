import io from 'socket.io-client';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import NameForm from '../components/NameForm';
import ParticipantList from '../components/ParticipantList';

const socket = io.connect("http://localhost:3001");

function PokerSessionPage() {

    const { room } = useParams();
    const [userID, setUserID] = useState("");
    const [username, setUsername] = useState("");
    const [userList, setUserList] = useState([]);
    const [session, setSession] = useState("");

    useEffect(() => {

        const handleUserJoined = (data) => {
            setUserList((prevUserList) => [
                ...prevUserList,
                { id: data.userID, name: data.name }
            ]);
        }

        socket.on('user_joined', handleUserJoined)

        socket.on('receive_message', (data) => {
        });

        return () => {
            socket.off('user_joined', handleUserJoined)
        }
    }, [socket]);

    const handleJoin = async (name) => {
        const response = await fetch("http://localhost:3001/api/sessions/addUser", {
            method: "POST",
            body: JSON.stringify({ sessionID: room, name, vote: '0' }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const json = await response.json();

        if (response.ok) {
            setSession(json.session);
            setUsername(name);
            setUserID(json.userID);
            setUserList(json.session.votes.map((user) => ({ id: user.userID, name: user.name })));
            socket.emit('join_room', { name, room, userID: json.userID });
        } else {
            console.error('Failed to join session: ', json);
        }
    };

    const handleLeave = async () => {
        const response = await fetch(`http://localhost:3001/api/sessions/${room}/removeUser`, {
            method: "PATCH",
            body: JSON.stringify({ id: room, userID, session }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const json = await response.json()

        if (response.ok) {
            socket.emit('leave_room', { room })
        } else {
            console.error('Failed to leave session ', json)
        }
    }

    return (
        <div className="App">
            <NameForm onJoin={handleJoin} />
            <h2>Room: {room}</h2>
            <h3>Hello, {username}</h3>
            <ParticipantList userList={userList} />
            <Link to="/">
                <button onClick={handleLeave}>Leave Room</button>
            </Link>
            <button onClick={handleLeave}>Leave Room 2</button>
        </div>
    );
};

export default PokerSessionPage;