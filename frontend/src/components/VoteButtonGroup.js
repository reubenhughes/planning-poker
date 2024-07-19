import * as React from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

function VoteButtonGroup({ selectVote, voteDeck, userRole, disabled }) {

  return (
    <div>
      {userRole === "Voter" ? (
        <Stack spacing={4} useFlexGap flexWrap="wrap" direction="row">
          {voteDeck.map((vote) => (
            <Button
              variant="contained"
              value={vote}
              onClick={(e) => selectVote(e.target.value)}
              key={vote}
              disabled={disabled}
            >
              {vote}
            </Button>
          ))}
        </Stack>
      ) : (
        <h4>As an observer, you can't vote</h4>
      )}
    </div>
  );
}

export default VoteButtonGroup;
