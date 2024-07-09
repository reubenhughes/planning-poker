import * as React from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Stack from "@mui/material/Stack";

function VoteButtonGroup({ selectVote, userRole, disabled }) {
  const voteList = [
    { id: "1", value: "1" },
    { id: "2", value: "2" },
    { id: "3", value: "3" },
    { id: "4", value: "5" },
    { id: "5", value: "8" },
    { id: "6", value: "13" },
    { id: "7", value: "21" },
    { id: "8", value: "34" },
    { id: "9", value: "?" },
  ];

  return (
    <div>
        {userRole === "Voter" ? (
            <Stack spacing={4} useFlexGap flexWrap="wrap" direction="row">
            {voteList.map((vote) => (
              <Button
                variant="contained"
                value={vote.value}
                onClick={(e) => selectVote(e.target.value)}
                key={vote.id}
                disabled={disabled}
              >
                {vote.value}
              </Button>
            ))}
          </Stack>
        )
        :
        (
            <h4>As an observer, you can't vote</h4>
        )}
    </div>
  );
}

export default VoteButtonGroup;
