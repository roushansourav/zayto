import React, { useState, useEffect, useCallback } from 'react';
import SkeletonCard from './SkeletonCard';
import LoadingButton from '../layout/LoadingButton';
import styles from './Discovery.module.css';

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
    <div className={styles.restaurantCard} onClick={() => onClick(restaurant)}>
      <div className={styles.imageContainer}>
        <img 
          src={restaurant.image_url} 
          alt={restaurant.name}
          loading="eager"
          className={styles.restaurantImage}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400';
          }}
        />
        <div className={styles.rating}>
          ⭐ {restaurant.rating.toFixed(1)}
        </div>
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.restaurantName}>{restaurant.name}</h3>
        <p className={styles.cuisineType}>{restaurant.cuisine_type}</p>
        <p className={styles.description}>{restaurant.description}</p>
        <p className={styles.address}>{restaurant.address}</p>
        <p className={styles.phone}>{restaurant.phone}</p>
      </div>
    </div>
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
    <div className={styles.searchContainer}>
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search restaurants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <LoadingButton onClick={handleSearch} className={styles.searchButton}>
          🔍 Search
        </LoadingButton>
      </div>
      <div className={styles.filterContainer}>
        <span className={styles.filterLabel}>Filter by cuisine:</span>
        <div className={styles.cuisineFilters}>
          {cuisineTypes.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => handleCuisineFilter(cuisine)}
              className={`${styles.cuisineFilter} ${
                selectedCuisine === cuisine ? styles.active : ''
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </div>
    </div>
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
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchRestaurants} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.discoveryPage}>
      <div className={styles.header}>
        <h1>Discover Amazing Restaurants</h1>
        <p>Find the best places to eat in your area</p>
      </div>

      <SearchBar onSearch={handleSearch} onFilterChange={handleFilterChange} />

      <div className={styles.resultsContainer}>
        <div className={styles.resultsHeader}>
          <h2>Restaurants ({filteredRestaurants.length})</h2>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className={styles.noResults}>
            <p>No restaurants found matching your criteria.</p>
            <button onClick={() => setFilteredRestaurants(restaurants)} className={styles.clearFiltersButton}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={styles.restaurantsGrid}>
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onClick={handleRestaurantClick}
              />
            ))}
          </div>
        )}
      </div>

      {selectedRestaurant && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeModal}>
              ✕
            </button>
            <div className={styles.modalContent}>
              <img
                src={selectedRestaurant.image_url}
                alt={selectedRestaurant.name}
                loading="eager"
                className={styles.modalImage}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400';
                }}
              />
              <div className={styles.modalInfo}>
                <h2>{selectedRestaurant.name}</h2>
                <p className={styles.modalCuisine}>{selectedRestaurant.cuisine_type}</p>
                <p className={styles.modalRating}>⭐ {selectedRestaurant.rating.toFixed(1)}</p>
                <p className={styles.modalDescription}>{selectedRestaurant.description}</p>
                <p className={styles.modalAddress}>{selectedRestaurant.address}</p>
                <p className={styles.modalPhone}>{selectedRestaurant.phone}</p>
                <p className={styles.modalEmail}>{selectedRestaurant.email}</p>

                <div style={{ marginTop: 24 }}>
                  <h3>Reviews</h3>
                  {reviews.length === 0 ? (
                    <p>No reviews yet.</p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {reviews.map((rev) => (
                        <li key={rev.id} style={{ borderTop: '1px solid #eee', padding: '8px 0' }}>
                          <strong>⭐ {rev.rating}</strong>
                          <div>{rev.comment}</div>
                          <small style={{ color: '#666' }}>{new Date(rev.created_at).toLocaleString()}</small>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <label>
                      Rating:
                      <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))} style={{ marginLeft: 6 }}>
                        {[1,2,3,4,5].map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </label>
                    <input
                      type="text"
                      placeholder="Write a review..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
                    />
                    <LoadingButton onClick={submitReview} loading={submitting} className={styles.searchButton}>
                      Submit
                    </LoadingButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoveryPage;
