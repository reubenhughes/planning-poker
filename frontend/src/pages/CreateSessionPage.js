import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

function CreateSessionPage() {
  const navigate = useNavigate();

  // vote card decks, can easily add more decks here
  const standardDeck = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "?"];
  const fibonacciDeck = ["1", "2", "3", "5", "8", "13", "21", "34", "?"];

  // session option variables
  const [description, setDescription] = useState("No Description");
  const [selectValue, setSelectValue] = useState("Standard");
  const [title, setTitle] = useState("Untitled Session");
  const [voteDeck, setVoteDeck] = useState(standardDeck);

  const handleCreateSession = async () => {
    const session = {
      participants: [],
      votes: [],
      title: title,
      description: description,
      voteDeck: voteDeck,
      status: "voting",
      majorityVote: 0,
      averageVote: 0,
      createdAt: Date.now,
    };

    console.log(session);
    console.log("vote deck", voteDeck);

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

  const handleChange = (event) => {
    setSelectValue(event.target.value);
    if (event.target.value === "Standard") {
      setVoteDeck(standardDeck);
    } else {
      setVoteDeck(fibonacciDeck);
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
        <h4>Required</h4>
        <FormControl required sx={{ m: 2, width: 300 }}>
          <InputLabel id="demo-simple-select-label">Vote Deck</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectValue}
            label="Card Deck"
            onChange={handleChange}
          >
            <MenuItem value="Standard">Standard (1 through to 10)</MenuItem>
            <MenuItem value="Fibonacci">
              Fibonacci (1, 2, 3, 5, 8 etc.)
            </MenuItem>
          </Select>
        </FormControl>
        <Divider variant="middle" />
        <h4>Optional</h4>
        <Stack spacing={1}>
          <h5>Title</h5>
          <TextField
            sx={{ pl: 2, pb: 3, width: 500 }}
            id="standard-basic"
            variant="outlined"
            size="small"
            onChange={(e) => setTitle(e.target.value)}
          />
          <h5>Description</h5>
          <TextField
            sx={{ pl: 2, pb: 4, width: 800 }}
            id="standard-basic"
            variant="outlined"
            size="small"
            onChange={(e) => setDescription(e.target.value)}
          />
        </Stack>
      </div>
    </div>
  );
}

export default CreateSessionPage;
