import * as React from 'react';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

// A chevron that opens and closes a panel of prompts, turned up while it is open
export default function ExpandButton({open, label, onClick}: {
  open: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Tooltip title={open ? 'Hide the prompts' : 'Show the prompts'}>
      <IconButton
        size="small"
        aria-label={label}
        aria-expanded={open}
        onClick={onClick}
        sx={{transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s'}}
      >
        <ExpandMoreRoundedIcon fontSize="small"/>
      </IconButton>
    </Tooltip>
  );
}
