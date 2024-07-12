import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

import Box from "@mui/material/Box";

function NameForm({ onJoin }) {
  const [open, setOpen] = React.useState(true);
  const [role, setRole] = React.useState("Voter");

  const handleChange = (event) => {
    setRole(event.target.value);
  };

  const handleSubmit = (name) => {
    if (name) {
      setOpen(false);
      onJoin({ name, role });
    }
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        PaperProps={{
          component: "form",
          onSubmit: (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const name = formJson.name;
            handleSubmit(name);
          },
        }}
      >
        <Box display="grid" margin="10px 50px">
          <DialogTitle sx={{ color: "#333" }}>Enter Name</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please enter your name to join the planning poker session.
            </DialogContentText>
            <TextField
              autoFocus
              required
              margin="dense"
              id="name"
              name="name"
              label="Name:"
              type="input"
              fullWidth
              variant="outlined"
            />
          </DialogContent>
          <FormControl>
            <FormLabel id="demo-controlled-radio-buttons-group">
              Join as a:
            </FormLabel>
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              row
              value={role}
              onChange={handleChange}
            >
              <FormControlLabel
                value="Voter"
                control={
                  <Radio
                    sx={{
                      color: "var(--accent)",
                      "&.Mui-checked": {
                        color: "var(--secondary)",
                      },
                    }}
                  />
                }
                label="Voter"
              />
              <FormControlLabel
                value="Observer"
                control={
                  <Radio
                    sx={{
                      color: "var(--accent)",
                      "&.Mui-checked": {
                        color: "var(--secondary)",
                      },
                    }}
                  />
                }
                label="Observer"
              />
            </RadioGroup>
          </FormControl>
          <DialogActions>
            <Button
              sx={{
                background: "var(--secondary)",
              }}
              variant="contained"
              type="submit"
            >
              Join Session
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </React.Fragment>
  );
}

export default NameForm;
