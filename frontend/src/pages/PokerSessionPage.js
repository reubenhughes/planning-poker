import io from 'socket.io-client';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import NameForm from '../components/NameForm';

const socket = io.connect("http://localhost:3001");

function PokerSessionPage() {

    const { room } = useParams();
    const [username, setUsername] = useState("");
    const [userList, setUserList] = useState([]);
    const [session, setSession] = useState(null);
    const [testUserList, setTestUserList] = useState([])
    let nextId = 0;

    useEffect(() => {
        socket.on('user_joined', (data) => {
            alert(`User ${data.name} joined room: ${data.room}`);
            setUserList([
                ...userList,
                {id: nextId++, name: data.name}
            ]);
        });
        socket.on('receive_message', (data) => {
        });
    }, [socket]);

    socket.onClose = () => {
        socket.emit('disconnect');
    };

    const handleJoin = (name) => {
        socket.emit('join_room', {name, room});
        setUsername(name);
        setUserList([
            ...userList,
            {id: nextId++, name: name}
        ]);
        fetchSession();
    };

    const fetchSession = async () => {
        try {
            const response = await fetch(`/api/sessions/${room}`)
            const json = await response.json()
            setSession(json)
            setTestUserList(json.participants)
        } catch (error) {
            console.error("Error fetching session details.")
        }
    }

    return (
        <div className="App">
            <NameForm onJoin={handleJoin} />
            <h2>Room: {room}</h2>
            <ol>
                {userList.map((user) => (
                    <li key={user.id}>{user.name}</li>
                ))}
            </ol>
            <h3>Hello, {username}</h3>
        </div>
    );
};

export default PokerSessionPage;