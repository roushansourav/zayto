import React, { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import PartnerGuard from '../../src/components/partner/PartnerGuard';
import { useAuth } from '../../src/lib/AuthContext';

export default function PartnerDashboardPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const { auth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Array<{ id: number; name: string; is_open: boolean }>>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/partner/restaurants`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load');
        setRestaurants(data.data || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unexpected error');
      }
    };
    run();
  }, [API_BASE_URL, auth.token]);

  return (
    <PartnerGuard>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h5" gutterBottom>Partner Dashboard</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          {restaurants.map(r => (
            <Grid key={r.id} size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">{r.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Status: {r.is_open ? 'Open' : 'Closed'}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {restaurants.length === 0 && (
            <Grid size={12}><Paper variant="outlined" sx={{ p: 3 }}><Typography>No restaurants yet. Go to onboarding.</Typography></Paper></Grid>
          )}
        </Grid>
      </Container>
    </PartnerGuard>
  );
}


