import * as React from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";

function ParticipantList(props) {
  return (
    <Box sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
      <nav aria-label="main mailbox folders">
        <ListSubheader>Participants in the Session</ListSubheader>
        <List>
          {props.userList.map((user) => (
            <ListItem disablePadding key={user.id}>
              <ListItemText primary={user.name} secondary={user.vote} />
            </ListItem>
          ))}
        </List>
      </nav>
    </Box>
  );
}

export default ParticipantList;
