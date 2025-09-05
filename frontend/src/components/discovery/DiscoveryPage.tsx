import React, { useState, useEffect, useCallback } from 'react';
import SkeletonCard from './SkeletonCard';
import LoadingButton from '../layout/LoadingButton';
import styles from './Discovery.module.css';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Rating from '@mui/material/Rating';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

interface Restaurant {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  cuisine_type: string;
  rating: number;
  image_url: string;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: (restaurant: Restaurant) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, cursor: 'pointer' }} onClick={() => onClick(restaurant)}>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="160"
          image={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}
          alt={restaurant.name}
          loading="eager"
          onError={(e: any) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'; }}
        />
        <Chip label={`${restaurant.rating.toFixed(1)} ★`} color="success" size="small" sx={{ position: 'absolute', top: 8, right: 8 }} />
      </Box>
      <CardContent>
        <Typography variant="h6" noWrap>{restaurant.name}</Typography>
        <Typography variant="body2" color="text.secondary" noWrap>{restaurant.cuisine_type}</Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }} color="text.secondary" noWrap>{restaurant.address}</Typography>
      </CardContent>
    </Card>
  );
};

const SearchBar: React.FC<{
  onSearch: (query: string) => void;
  onFilterChange: (cuisine: string) => void;
}> = ({ onSearch, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');

  const cuisineTypes = ['All', 'Italian', 'Japanese', 'American', 'Mexican', 'Thai'];

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleCuisineFilter = (cuisine: string) => {
    const filterValue = cuisine === 'All' ? '' : cuisine;
    setSelectedCuisine(cuisine);
    onFilterChange(filterValue);
  };

  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          placeholder="Search restaurants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ flex: 1 }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <LoadingButton onClick={handleSearch} variant="contained">Search</LoadingButton>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary">Filter by cuisine:</Typography>
        {cuisineTypes.map((cuisine) => (
          <Chip
            key={cuisine}
            label={cuisine}
            variant={selectedCuisine === cuisine ? 'filled' : 'outlined'}
            onClick={() => handleCuisineFilter(cuisine)}
            size="small"
            sx={{ borderRadius: 3 }}
          />
        ))}
      </Box>
    </Box>
  );
};

const DiscoveryPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Array<{ id: number; rating: number; comment: string; created_at: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/restaurants`);
      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }
      const data = await response.json();
      if (data.success) {
        const normalized: Restaurant[] = (data.data || []).map((r: Partial<Restaurant>) => ({
          id: (r.id as number) ?? 0,
          name: r.name ?? '',
          rating:
            typeof r.rating === 'number'
              ? r.rating
              : Number.parseFloat((r as unknown as { rating?: string }).rating ?? '0') || 0,
          description: r.description ?? '',
          address: r.address ?? '',
          phone: r.phone ?? '',
          email: r.email ?? '',
          cuisine_type: r.cuisine_type ?? '',
          image_url: r.image_url ?? ''
        }));
        setRestaurants(normalized);
        setFilteredRestaurants(normalized);
      } else {
        throw new Error(data.error || 'Failed to fetch restaurants');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Infinite scroll: fetch more on bottom approach (demo: just re-fetch same list)
  useEffect(() => {
    const onScroll = () => {
      if (loading || error) return;
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        // In real API, pass pagination params; here we just no-op to avoid spamming
        // fetchRestaurants();
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [loading, error, fetchRestaurants]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredRestaurants(restaurants);
      return;
    }

    const filtered = restaurants.filter((restaurant) => {
      const q = query.toLowerCase();
      return (
        (restaurant.name || '').toLowerCase().includes(q) ||
        (restaurant.description || '').toLowerCase().includes(q) ||
        (restaurant.cuisine_type || '').toLowerCase().includes(q)
      );
    });
    setFilteredRestaurants(filtered);
  };

  const handleFilterChange = (cuisine: string) => {
    if (!cuisine) {
      setFilteredRestaurants(restaurants);
      return;
    }

    const filtered = restaurants.filter(
      (restaurant) => (restaurant.cuisine_type || '').toLowerCase() === cuisine.toLowerCase()
    );
    setFilteredRestaurants(filtered);
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    // Fetch reviews
    fetch(`${API_BASE_URL}/api/reviews?restaurant_id=${restaurant.id}`)
      .then((r) => r.json())
      .then((data) => setReviews(Array.isArray(data.data) ? data.data : []))
      .catch(() => setReviews([]));
  };

  const closeModal = () => {
    setSelectedRestaurant(null);
    setReviews([]);
    setNewRating(5);
    setNewComment('');
  };

  const submitReview = async () => {
    if (!selectedRestaurant) return;
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurant_id: selectedRestaurant.id, rating: newRating, comment: newComment })
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      if (data.success && data.data) {
        setReviews((prev) => [data.data, ...prev]);
        setNewRating(5);
        setNewComment('');
      }
    } catch (_) {
      // noop for demo
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.resultsContainer}>
        <div className={styles.resultsHeader}>
          <h2>Restaurants (loading...)</h2>
        </div>
        <div className={styles.restaurantsGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Box sx={{ border: '1px solid #eee', borderRadius: 2, p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>Error</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{error}</Typography>
        <Button onClick={fetchRestaurants} variant="contained">Try Again</Button>
      </Box>
    );
  }

  return (
    <div className={styles.discoveryPage}>
      {/* Header content now lives at page-level; remove inner hero */}

      <SearchBar onSearch={handleSearch} onFilterChange={handleFilterChange} />

      <div className={styles.resultsContainer}>
        <div className={styles.resultsHeader}>
          <h2>Restaurants ({filteredRestaurants.length})</h2>
        </div>

        {filteredRestaurants.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography>No restaurants found matching your criteria.</Typography>
            <Button onClick={() => setFilteredRestaurants(restaurants)} sx={{ mt: 1 }} variant="outlined">Clear Filters</Button>
          </Box>
        ) : (
          <Box className={styles.restaurantsGrid}>
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onClick={handleRestaurantClick}
              />
            ))}
          </Box>
        )}
      </div>

      <Dialog open={Boolean(selectedRestaurant)} onClose={closeModal} maxWidth="md" fullWidth>
        {selectedRestaurant && (
          <>
            <DialogTitle>{selectedRestaurant.name}</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '320px 1fr' } }}>
                <Box>
                  <img
                    src={selectedRestaurant.image_url}
                    alt={selectedRestaurant.name}
                    loading="eager"
                    className={styles.modalImage}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400';
                    }}
                    style={{ width: '100%', borderRadius: 8 }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle1" color="text.secondary">{selectedRestaurant.cuisine_type}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Rating value={selectedRestaurant.rating} readOnly precision={0.1} size="small" />
                    <Typography variant="body2">{selectedRestaurant.rating.toFixed(1)}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>{selectedRestaurant.description}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{selectedRestaurant.address}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedRestaurant.phone}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedRestaurant.email}</Typography>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6">Reviews</Typography>
                    {reviews.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No reviews yet.</Typography>
                    ) : (
                      <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                        {reviews.map((rev) => (
                          <Box key={rev.id} component="li" sx={{ borderTop: '1px solid #eee', py: 1 }}>
                            <strong>⭐ {rev.rating}</strong>
                            <div>{rev.comment}</div>
                            <Typography variant="caption" color="text.secondary">{new Date(rev.created_at).toLocaleString()}</Typography>
                          </Box>
                        ))}
                      </Box>
                    )}

                    <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                      <label>
                        <Typography variant="caption">Rating:</Typography>
                        <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))} style={{ marginLeft: 6 }}>
                          {[1,2,3,4,5].map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </label>
                      <TextField
                        placeholder="Write a review..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        size="small"
                        fullWidth
                      />
                      <LoadingButton onClick={submitReview} loading={submitting} variant="contained">
                        Submit
                      </LoadingButton>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeModal}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default DiscoveryPage;
