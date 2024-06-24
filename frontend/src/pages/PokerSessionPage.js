import io from 'socket.io-client';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import NameForm from '../components/NameForm';

const socket = io.connect("http://localhost:3001");

function PokerSessionPage() {

    const { room } = useParams();
    const [username, setUsername] = useState("");
    const [userList, setUserList] = useState([]);
    const [session, setSession] = useState("");

    useEffect(() => {
        socket.on('user_joined', (data) => {
            alert(`User ${data.name} joined room: ${data.room}`);
            setUserList((prevUserList) => [
                ...prevUserList,
                { id: data.userID, name: data.name }
            ]);
        });
        socket.on('receive_message', (data) => {
        });
    }, [socket]);

    socket.onClose = () => {
        socket.emit('disconnect');
    };

    const handleJoin = async (name) => {
        socket.emit('join_room', { name, room });
        setUsername(name);

        const response = await fetch("http://localhost:3001/api/sessions/addUser", {
            method: "POST",
            body: JSON.stringify({ sessionID: room, name, vote: '0' }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const json = await response.json();

        if (response.ok) {
            setSession(json);
            setUserList(json.votes.map((user) => ({ id: user.userID, name: user.name })));
            console.log(json.votes);
        } else {
            console.error('Failed to join session: ', json);
        }
    };

    return (
        <div className="App">
            <NameForm onJoin={handleJoin} />
            <h2>Room: {room}</h2>
            <ol>
                {userList.map((user) => (
                    <li key={user.id}>{user.name}</li>
                ))}
            </ol>
            {session &&
                <h3>{session.createdAt}</h3>
            }
            <h3>Hello, {username}</h3>
        </div>
    );
};

export default PokerSessionPage;