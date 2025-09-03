
'use client';
import React from 'react';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const Features = () => {
  const t = useTranslations('Features');

  const features = [
    {
      title: t('feature1.title'),
      description: t('feature1.description'),
      icon: '/file.svg',
    },
    {
      title: t('feature2.title'),
      description: t('feature2.description'),
      icon: '/globe.svg',
    },
    {
      title: t('feature3.title'),
      description: t('feature3.description'),
      icon: '/window.svg',
    },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', py: 8 }}>
      <Container maxWidth="lg">
        <Typography
          component="h2"
          variant="h4"
          align="center"
          color="text.primary"
          gutterBottom
        >
          {t('title')}
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Image src={feature.icon} alt={feature.title} width={64} height={64} />
                <Typography variant="h6" component="h3" sx={{ mt: 2 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Features;
