import React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

const chips = ['Filter', 'Sort By', 'Fast Delivery', 'New on Zayto', 'Ratings 4.0+', 'Pure Veg', 'Rs. 300-Rs. 600', 'Less than Rs. 300'];

export default function FilterChips() {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {chips.map((c) => (
        <Chip key={c} label={c} variant="outlined" sx={{ borderRadius: 3 }} clickable />
      ))}
    </Box>
  );
}


