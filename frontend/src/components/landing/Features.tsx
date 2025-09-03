
import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import { Restaurant, Search, Star } from '@mui/icons-material';

const Features = () => {
  const features = [
    {
      title: 'Restaurant Discovery',
      description: 'Find the best restaurants in your area with detailed information about cuisine, ratings, and reviews.',
      icon: <Restaurant sx={{ fontSize: 64, color: 'primary.main' }} />,
    },
    {
      title: 'Advanced Search',
      description: 'Search restaurants by name, cuisine type, location, and filter by ratings to find exactly what you\'re looking for.',
      icon: <Search sx={{ fontSize: 64, color: 'primary.main' }} />,
    },
    {
      title: 'Reviews & Ratings',
      description: 'Read authentic reviews from other diners and see detailed ratings to make informed dining decisions.',
      icon: <Star sx={{ fontSize: 64, color: 'primary.main' }} />,
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
          Why Choose Zayto?
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 4, 
          mt: 4 
        }}>
          {features.map((feature, index) => (
            <Paper key={index} sx={{ p: 4, textAlign: 'center', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                {feature.icon}
              </Box>
              <Typography variant="h6" component="h3" sx={{ mt: 2, mb: 2 }}>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {feature.description}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Features;
