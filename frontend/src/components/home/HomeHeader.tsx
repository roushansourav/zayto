import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import SearchIcon from '@mui/icons-material/Search';

export default function HomeHeader() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => void 0,
        { enableHighAccuracy: true, maximumAge: 60_000 }
      );
    }
  }, []);
  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #eee' }}>
      <Toolbar sx={{ maxWidth: 1200, mx: 'auto', width: '100%', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1, minWidth: 0 }}>
          <LocationOnOutlinedIcon color="error" />
          <Box>
            <Typography fontWeight={700} variant="body1">
              {coords ? `${coords.lat.toFixed(3)}, ${coords.lon.toFixed(3)}` : 'Detecting location'}
            </Typography>
            <Typography variant="caption" color="text.secondary">Your area</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1, bgcolor: '#fafafa', px: 1.5, py: 0.5, borderRadius: 2, border: '1px solid #eee', minWidth: { sm: 200, md: 280 } }}>
            <SearchIcon fontSize="small" />
            <TextField size="small" variant="standard" placeholder="Search" InputProps={{ disableUnderline: true }} fullWidth />
          </Box>
          <IconButton size="small" sx={{ display: { xs: 'none', md: 'inline-flex' } }}><LocalOfferOutlinedIcon /></IconButton>
          <IconButton size="small" sx={{ display: { xs: 'none', md: 'inline-flex' } }}><HelpOutlineOutlinedIcon /></IconButton>
          <Link href="/login"><Button size="small" variant="text">Sign In</Button></Link>
          <Link href="/register"><Button size="small" variant="contained" color="error" disableElevation>Sign Up</Button></Link>
          <IconButton size="small">
            <Badge color="error" badgeContent={0}><ShoppingCartOutlinedIcon /></Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}


