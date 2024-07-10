import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";

function CreateSessionPage() {
  const navigate = useNavigate();

  const handleCreateSession = async () => {
    const session = {
      participants: [],
      votes: [],
      status: "voting",
      majorityVote: 0,
      averageVote: 0,
      createdAt: Date.now,
    };

    console.log(session);

    const response = await fetch("http://localhost:3001/api/sessions/", {
      method: "POST",
      body: JSON.stringify(session),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await response.json();

    if (response.ok) {
      navigate(`/session/${json._id}`);
    } else {
      console.error("Failed to create session ", json);
    }
  };

  return (
    <div className="create-session">
      <div className="create-session-button">
        <h3>Create Session</h3>
        <h5>
          Click the button below to create a new session, use the options on the
          right to customise the session
        </h5>
        <Button variant="contained" onClick={handleCreateSession}>
          Create New Session
        </Button>
      </div>
      <div className="session-options">
        <h3>Session Options</h3>
      </div>
    </div>
  );
}

export default CreateSessionPage;
