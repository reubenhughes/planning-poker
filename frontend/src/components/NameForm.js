import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function NameForm({ onJoin }) {
  const [open, setOpen] = React.useState(true);

  const handleSubmit = (name) => {
    if (name) {
        setOpen(false);
        onJoin(name);
    };
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        PaperProps={{
          component: 'form',
          onSubmit: (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const name = formJson.name;
            handleSubmit(name);
          },
        }}
      >
        <DialogTitle>Enter Name</DialogTitle>
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
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button type="submit">Join Session</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default NameForm;