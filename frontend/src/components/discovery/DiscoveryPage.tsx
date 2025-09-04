import React, { useState, useEffect, useCallback } from 'react';
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
        <button onClick={handleSearch} className={styles.searchButton}>
          🔍 Search
        </button>
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
  };

  const closeModal = () => {
    setSelectedRestaurant(null);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading restaurants...</p>
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoveryPage;
