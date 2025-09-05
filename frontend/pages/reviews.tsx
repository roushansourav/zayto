import React, { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import LoadingButton from '../src/components/layout/LoadingButton';

interface Review { id: number; rating: number; comment: string; created_at: string }

export default function ReviewsPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const [restaurantId, setRestaurantId] = useState<string>('1');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    setError(null); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews?restaurant_id=${restaurantId}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load reviews');
      setReviews(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error');
    } finally { setLoading(false); }
  };

  const submitReview = async () => {
    setError(null); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant_id: Number(restaurantId), rating: newRating, comment: newComment })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to submit review');
      setReviews((prev) => [data.data, ...prev]);
      setNewRating(5); setNewComment('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [restaurantId]);

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Reviews</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          <TextField select label="Restaurant" value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)}>
            {[1,2,3,4,5].map((id) => (
              <MenuItem key={id} value={String(id)}>Restaurant #{id}</MenuItem>
            ))}
          </TextField>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <TextField
              label="Rating"
              select
              value={newRating}
              onChange={(e) => setNewRating(Number(e.target.value))}
              sx={{ width: 120 }}
            >
              {[1,2,3,4,5].map((n) => (
                <MenuItem key={n} value={n}>{n}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Write a review"
              fullWidth
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <LoadingButton onClick={submitReview} loading={loading} variant="contained">Submit</LoadingButton>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={0}>
        <List>
          {reviews.map((rev) => (
            <React.Fragment key={rev.id}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={`⭐ ${rev.rating}`}
                  secondary={
                    <>
                      <Typography variant="body2">{rev.comment}</Typography>
                      <Typography variant="caption" color="text.secondary">{new Date(rev.created_at).toLocaleString()}</Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
          {reviews.length === 0 && (
            <ListItem><ListItemText primary="No reviews yet." /></ListItem>
          )}
        </List>
      </Paper>
    </Container>
  );
}


