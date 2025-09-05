import React from 'react';
import * as SecureStore from 'expo-secure-store';

type FavoritesContextState = {
  favoriteIds: string[];
  isFavorite: (id: string | number) => boolean;
  toggleFavorite: (id: string | number) => void;
  addFavorite: (id: string | number) => void;
  removeFavorite: (id: string | number) => void;
};

const FavoritesContext = React.createContext<FavoritesContextState | undefined>(undefined);

const STORAGE_KEY = 'favorites_restaurants';

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(STORAGE_KEY);
        if (raw) setFavoriteIds(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  const persist = React.useCallback(async (ids: string[]) => {
    setFavoriteIds(ids);
    try { await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(ids)); } catch {}
  }, []);

  const isFavorite = React.useCallback((id: string | number) => favoriteIds.includes(String(id)), [favoriteIds]);
  const addFavorite = React.useCallback((id: string | number) => {
    const key = String(id);
    if (favoriteIds.includes(key)) return;
    persist([...favoriteIds, key]);
  }, [favoriteIds, persist]);
  const removeFavorite = React.useCallback((id: string | number) => {
    const key = String(id);
    if (!favoriteIds.includes(key)) return;
    persist(favoriteIds.filter(x => x !== key));
  }, [favoriteIds, persist]);
  const toggleFavorite = React.useCallback((id: string | number) => {
    (isFavorite(id) ? removeFavorite : addFavorite)(id);
  }, [isFavorite, addFavorite, removeFavorite]);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite, addFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = React.useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}


