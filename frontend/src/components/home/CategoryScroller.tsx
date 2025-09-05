import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const categories = [
  { label: 'Pizzas', img: '/file.svg' },
  { label: 'Chinese', img: '/file.svg' },
  { label: 'Rolls', img: '/file.svg' },
  { label: 'Biryani', img: '/file.svg' },
  { label: 'Burgers', img: '/file.svg' },
  { label: 'Momos', img: '/file.svg' },
  { label: 'Cakes', img: '/file.svg' },
  { label: 'Samosa', img: '/file.svg' }
];

export default function CategoryScroller() {
  return (
    <Box component="section" sx={{ borderTop: '1px solid #f2f2f2', borderBottom: '1px solid #f2f2f2', bgcolor: '#fff' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 }, py: 2 }}>
        <Typography variant="h6" sx={{ my: 1 }}>What&apos;s on your mind?</Typography>
        <Box sx={{ display: 'flex', overflowX: 'auto', gap: { xs: 2, md: 3 }, pb: 1 }}>
          {categories.map((c) => (
            <Box key={c.label} sx={{ textAlign: 'center', minWidth: 84 }}>
              <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#fafafa', mx: 'auto', border: '1px solid #eee', display: 'grid', placeItems: 'center' }}>
                <img src={c.img} alt={c.label} width={44} height={44} loading="eager" />
              </Box>
              <Box sx={{ mt: 1 }}>{c.label}</Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}


