
'use client';
import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useTranslations } from 'next-intl';

const Hero = () => {
  const t = useTranslations('Hero');

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        pt: 8,
        pb: 6,
      }}
    >
      <Container maxWidth="sm">
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
        >
          {t('title')}
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          {t('subtitle')}
        </Typography>
        <Box sx={{ pt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained">{t('primaryCta')}</Button>
          <Button variant="outlined" sx={{ ml: 2 }}>{t('secondaryCta')}</Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;
