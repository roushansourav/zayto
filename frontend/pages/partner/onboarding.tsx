import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import LoadingButton from '../../src/components/layout/LoadingButton';
import PartnerGuard from '../../src/components/partner/PartnerGuard';
import { useAuth } from '../../src/lib/AuthContext';

export default function PartnerOnboardingPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const { auth } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [createdId, setCreatedId] = useState<number | null>(null);

  const createRestaurant = async () => {
    setError(null); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/partner/restaurants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ name, description, city })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create');
      setCreatedId(data.data.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error');
    } finally { setLoading(false); }
  };

  return (
    <PartnerGuard>
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Partner Onboarding</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={1.5}>
            <TextField label="Restaurant Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth />
            <TextField label="City" value={city} onChange={(e) => setCity(e.target.value)} fullWidth />
            <LoadingButton onClick={createRestaurant} loading={loading} variant="contained">Create Restaurant</LoadingButton>
            {createdId && <Alert severity="success">Created restaurant #{createdId}</Alert>}
          </Stack>
        </Paper>
      </Container>
    </PartnerGuard>
  );
}


