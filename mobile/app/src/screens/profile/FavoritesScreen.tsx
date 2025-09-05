import React from 'react';
import { View } from 'react-native';
import { Text, List } from 'react-native-paper';
import { useFavorites } from '../../context/FavoritesContext';

export default function FavoritesScreen() {
  const { favoriteIds, removeFavorite } = useFavorites();
  return (
    <View style={{ padding: 16 }}>
      <Text variant="titleLarge">Favorites</Text>
      {favoriteIds.length === 0 ? (
        <Text style={{ marginTop: 12 }}>No favorites yet.</Text>
      ) : (
        favoriteIds.map(id => (
          <List.Item key={id} title={`Restaurant #${id}`} right={props => <List.Icon {...props} icon="delete" onPress={() => removeFavorite(id)} />} />
        ))
      )}
    </View>
  );
}


