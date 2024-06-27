import { useState } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [room, setRoom] = useState("667976bf28f5c029332fcef7");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/session/${room}`);
  };

  const createRoom = () => {
    navigate("/create-session");
  };

  return (
    <div className="home-page">
      <h1>Home Page</h1>
      <form onSubmit={handleSubmit}>
        <label>Enter the room ID you want to join: </label>
        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <input type="submit" value="join" />
      </form>
      <button onClick={createRoom}>Create Session</button>
    </div>
  );
}

export default HomePage;
