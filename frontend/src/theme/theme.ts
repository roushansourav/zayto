'use client';
import { createTheme } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#e23744' },
    secondary: { main: '#1976d2' },
    error: { main: '#d32f2f' },
    background: { default: '#ffffff', paper: '#ffffff' },
    divider: '#eeeeee',
    text: { primary: '#1c1c1c', secondary: '#6b6b6b' }
  },
  shape: { borderRadius: 8 },
  spacing: 8,
  typography: {
    fontFamily: roboto.style.fontFamily,
    h1: { fontWeight: 700, fontSize: '2.25rem' },
    h2: { fontWeight: 700, fontSize: '1.75rem' },
    h3: { fontWeight: 600, fontSize: '1.5rem' },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, paddingLeft: 16, paddingRight: 16 }
      }
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { border: '1px solid #eee' } }
    }
  }
});

export default theme;
