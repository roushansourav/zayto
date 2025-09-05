import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';

const SkeletonCard: React.FC = () => {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <Skeleton variant="rectangular" height={160} animation="wave" />
      <CardContent>
        <Skeleton variant="text" width="60%" height={24} animation="wave" />
        <Skeleton variant="text" width="40%" height={18} animation="wave" />
        <Skeleton variant="text" width="90%" height={16} animation="wave" />
        <Skeleton variant="text" width="80%" height={16} animation="wave" />
      </CardContent>
    </Card>
  );
};

export default SkeletonCard;


