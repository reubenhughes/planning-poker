import * as React from "react";
import Button from "@mui/material/Button";

function ShowVotesButton({ showVotes }, props) {
  const [disabled, setDisabled] = React.useState(props.disabled);

  const handleClick = () => {
    showVotes(true);
    setDisabled(true);
  };

  return (
    <Button onClick={handleClick} variant="contained" disabled={disabled}>
      Show Votes
    </Button>
  );
}

export default ShowVotesButton;
