
'use client';
import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTranslations } from 'next-intl';

const Header = () => {
  const t = useTranslations('Header');

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Zayto
        </Typography>
        <Button color="inherit">{t('login')}</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
