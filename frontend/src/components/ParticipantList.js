import * as React from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";

function ParticipantList({ voteList, showVotes, userID, onKick }) {
  const handleClick = (kickedUserID) => {
    console.log("kicking user:", kickedUserID);
    onKick(kickedUserID);
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxHeight: 450,
        overflow: "auto",
        "& ul": { padding: 0 },
      }}
    >
      <nav aria-label="main mailbox folders">
        <List>
          {voteList.map((voter) => (
            <ListItem key={voter.id}>
              {showVotes ? (
                <ListItemText
                primary={voter.name}
                secondary={voter.vote}
                secondaryTypographyProps={{
                    color: "var(--text-color)"
                }}
                 />
              ) : (
                <ListItemText
                  primary={voter.name}
                  secondary={voter.voteMessage}
                  secondaryTypographyProps={{
                    color: "var(--text-color)"
                }}
                />
              )}
              {voter.userID !== userID && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleClick(voter.userID)}
                >
                  Kick
                </Button>
              )}
            </ListItem>
          ))}
        </List>
      </nav>
    </Box>
  );
}

export default ParticipantList;
