import * as React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Stack from '@mui/material/Stack';

function VoteButtonGroup({ selectVote }) {

    const voteList = [
        {id: "1", value: "1"},
        {id: "2", value: "2"},
        {id: "3", value: "3"},
        {id: "4", value: "5"},
        {id: "5", value: "8"},
        {id: "6", value: "13"},
        {id: "7", value: "21"},
        {id: "8", value: "34"},
        {id: "9", value: "?"}
    ]

  return (
    <div>
        <ButtonGroup variant="outlined" aria-label="Basic button group">
        <Stack spacing={2} direction="row">
        {voteList.map((vote) => (
            <Button value={vote.value} onClick={(e) => selectVote(e.target.value)} key={vote.id}>{vote.value}</Button>
        ))}
        </Stack>
    </ButtonGroup>
    </div>
  );
}

export default VoteButtonGroup;