import React from 'react';
import { View, Image } from 'react-native';
import { Text, TextInput, Button, Card, IconButton } from 'react-native-paper';
import { api } from '../../api/client';
import { useFavorites } from '../../context/FavoritesContext';

export default function RestaurantDetailScreen({ route }: any) {
  const { restaurant } = route.params as { restaurant: { id: number; name: string; image_url?: string; rating: number } };
  const [reviews, setReviews] = React.useState<Array<{ id: number; rating: number; comment: string; created_at: string }>>([]);
  const [comment, setComment] = React.useState('');
  const [rating, setRating] = React.useState(5);
  const { isFavorite, toggleFavorite } = useFavorites();

  React.useEffect(() => {
    (async () => {
      try {
        const r = await api.get(`/api/reviews?restaurant_id=${restaurant.id}`);
        if (r.data?.success) setReviews(Array.isArray(r.data.data) ? r.data.data : []);
      } catch {}
    })();
  }, [restaurant.id]);

  const submit = async () => {
    try {
      const r = await api.post('/api/reviews', { restaurant_id: restaurant.id, rating, comment });
      if (r.data?.success && r.data.data) setReviews(prev => [r.data.data, ...prev]);
      setComment(''); setRating(5);
    } catch {}
  };

  const fav = isFavorite(restaurant.id);

  return (
    <View style={{ padding: 16, gap: 12 }}>
      {restaurant.image_url && <Image source={{ uri: restaurant.image_url }} style={{ height: 200, width: '100%' }} />}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text variant="titleLarge">{restaurant.name}</Text>
          <Text variant="bodyMedium">⭐ {restaurant.rating.toFixed(1)}</Text>
        </View>
        <IconButton icon={fav ? 'heart' : 'heart-outline'} onPress={() => toggleFavorite(restaurant.id)} accessibilityLabel="Toggle favorite" />
      </View>

      <Card style={{ padding: 12 }}>
        <Text variant="titleSmall">Write a review</Text>
        <TextInput label="Comment" value={comment} onChangeText={setComment} multiline />
        <TextInput label="Rating (1-5)" value={String(rating)} onChangeText={(v) => setRating(Number(v) || 1)} keyboardType="number-pad" />
        <Button mode="contained" onPress={submit} style={{ marginTop: 8 }}>Submit</Button>
      </Card>

      {reviews.map(r => (
        <Card key={r.id} style={{ marginTop: 12 }}>
          <Card.Title title={`⭐ ${r.rating}`} subtitle={new Date(r.created_at).toLocaleString()} />
          <Card.Content>
            <Text>{r.comment}</Text>
          </Card.Content>
        </Card>
      ))}
    </View>
  );
}
