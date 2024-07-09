import * as React from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";

function ParticipantList({ voteList, showVotes, userID, onKick }) {
  const handleClick = (kickedUserID) => {
    console.log("kicking user:", kickedUserID);
    onKick(kickedUserID);
  };

  return (
    <Box sx={{ width: "100%", maxHeight: 450, overflow: "auto", '& ul': { padding: 0 } }}>
      <nav aria-label="main mailbox folders">
        <List>
          {voteList.map((voter) => (
            <ListItem key={voter.id}>
              {showVotes ? (
                <ListItemText primary={voter.name} secondary={voter.vote} />
              ) : (
                <ListItemText
                  primary={voter.name}
                  secondary={voter.voteMessage}
                />
              )}
              {voter.userID !== userID && (
                <button onClick={() => handleClick(voter.userID)}>Kick</button>
              )}
            </ListItem>
          ))}
        </List>
      </nav>
    </Box>
  );
}

export default ParticipantList;
