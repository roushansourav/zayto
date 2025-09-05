import React, { useEffect, useMemo, useState } from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import PartnerGuard from '../../src/components/partner/PartnerGuard';
import { useAuth } from '../../src/lib/AuthContext';

type DayRow = { day_of_week: number; open_time: string | null; close_time: string | null; is_closed: boolean };

export default function PartnerHoursPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const { auth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Array<{ id: number; name: string }>>([]);
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [rows, setRows] = useState<DayRow[]>(Array.from({ length: 7 }, (_, d) => ({ day_of_week: d, open_time: '09:00', close_time: '18:00', is_closed: false })));

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${auth.token}`
  }), [auth.token]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/partner/restaurants`, { headers });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load restaurants');
        setRestaurants(data.data || []);
        if ((data.data || []).length && !restaurantId) setRestaurantId(String(data.data[0].id));
      } catch (e) { setError(e instanceof Error ? e.message : 'Unexpected error'); }
    };
    load();
  }, [API_BASE_URL, headers]);

  useEffect(() => {
    if (!restaurantId) return;
    const loadHours = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/partner/restaurants/${restaurantId}/hours`, { headers });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load hours');
        const serverRows = (data.data || []) as DayRow[];
        if (serverRows.length) setRows(serverRows);
      } catch (e) { setError(e instanceof Error ? e.message : 'Unexpected error'); }
    };
    loadHours();
  }, [API_BASE_URL, headers, restaurantId]);

  const save = async () => {
    if (!restaurantId) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/partner/restaurants/${restaurantId}/hours`, {
        method: 'PUT', headers, body: JSON.stringify(rows)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unexpected error'); } finally { setLoading(false); }
  };

  return (
    <PartnerGuard>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h5" gutterBottom>Business Hours</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Restaurant</Typography>
          <TextField select value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)} sx={{ minWidth: 320 }}>
            {restaurants.map(r => (
              <MenuItem key={r.id} value={String(r.id)}>{r.name}</MenuItem>
            ))}
          </TextField>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Grid container spacing={1}>
            {rows.map((row, idx) => (
              <Grid key={row.day_of_week} size={{ xs: 12 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: idx ? 2 : 0 }}>Day {row.day_of_week} ({['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][row.day_of_week]})</Typography>
                <FormControlLabel control={<Checkbox checked={row.is_closed} onChange={(e) => setRows(prev => prev.map((r,i) => i===idx ? { ...r, is_closed: e.target.checked } : r))} />} label="Closed" />
                {!row.is_closed && (
                  <>
                    <TextField label="Open" type="time" value={row.open_time || ''} onChange={(e) => setRows(prev => prev.map((r,i) => i===idx ? { ...r, open_time: e.target.value } : r))} size="small" sx={{ mr: 2 }} />
                    <TextField label="Close" type="time" value={row.close_time || ''} onChange={(e) => setRows(prev => prev.map((r,i) => i===idx ? { ...r, close_time: e.target.value } : r))} size="small" />
                  </>
                )}
              </Grid>
            ))}
          </Grid>
          <Button onClick={save} disabled={loading || !restaurantId} variant="contained" sx={{ mt: 2 }}>Save</Button>
        </Paper>
      </Container>
    </PartnerGuard>
  );
}


