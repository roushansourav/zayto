
'use client';
import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';
import { useTranslations } from 'next-intl';

const Footer = () => {
  const t = useTranslations('Footer');

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h6" align="center" gutterBottom>
          Zayto
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
        >
          {t('subtitle')}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {'Copyright © '}
          <Link color="inherit" href="https://zayto.com/">
            Zayto
          </Link>{' '}
          {new Date().getFullYear()}
          {'.'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
