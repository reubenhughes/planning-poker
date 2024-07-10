import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";

function HomePage() {
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/session/${room}`);
  };

  const handleClick = () => {
    navigate("/create-session");
  };

  return (
    <div className="home">
      <div className="begin-planning">
        <h3>Begin Planning</h3>
        <h5>Click the button below to begin planning</h5>
        <Button variant="contained" onClick={handleClick}>
          CLick Here
        </Button>
      </div>
    </div>
  );
}

export default HomePage;
