import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// A voice as the admin shows it everywhere: its color as a dot, then its name
export default function VoiceName({name, color}: { name: string; color: string }) {
  return (
    <Box component="span" sx={{display: 'inline-flex', alignItems: 'center', gap: 1, verticalAlign: 'middle'}}>
      <Box component="span" sx={{width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0}}/>
      <Typography variant="body2" component="span" sx={{whiteSpace: 'nowrap'}}>{name}</Typography>
    </Box>
  );
}
