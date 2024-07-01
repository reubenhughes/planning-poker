import { useNavigate } from "react-router-dom";

function CreateSessionPage() {
    const navigate = useNavigate();

    const handleCreateSession = async () => {
        const session = {
            participants: [],
            votes: [],
            majorityVote: 0,
            averageVote: 0,
            createdAt: Date.now
        }

        console.log(session)

        const response = await fetch("http://localhost:3001/api/sessions/", {
            method: "POST",
            body: JSON.stringify(session),
            headers: {
                "Content-Type": "application/json"
            },
        });
        const json = await response.json();

        if (response.ok) {
            navigate(`/session/${json._id}`)
        } else {
            console.error("Failed to create session ", json)
        }
    }


  return (
    <div>
      <h2>Create Session Page</h2>
      <button onClick={handleCreateSession}>Create New Session</button>
    </div>
  );
}

export default CreateSessionPage;
