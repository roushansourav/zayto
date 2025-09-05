import React from 'react';
import { View, FlatList, Image, TouchableOpacity } from 'react-native';
import { Chip, Text, Card, ActivityIndicator, IconButton } from 'react-native-paper';
import * as Location from 'expo-location';
import { api } from '../../api/client';
import Shimmer from '../../components/Shimmer';

type Restaurant = { id: number; name: string; rating: number; image_url?: string };

const categories = ['Fast Food', 'Vegan', 'Chinese', 'Biryani', 'Dessert'];

export default function HomeScreen({ navigation }: any) {
  const [coords, setCoords] = React.useState<string>('Locating...');
  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <IconButton icon="magnify" onPress={() => navigation.navigate('Search')} />
    });
  }, [navigation]);

  React.useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setCoords('Location off');
        } else {
          const pos = await Location.getCurrentPositionAsync({});
          setCoords(`${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`);
        }
      } catch {}
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      setError(null); setLoading(true);
      try {
        const res = await api.get('/api/restaurants');
        if (!res.data?.success) throw new Error(res.data?.error || 'Failed to load');
        const list: Restaurant[] = (res.data.data || []).map((r: any) => ({
          id: r.id ?? 0,
          name: r.name ?? '',
          rating: typeof r.rating === 'number' ? r.rating : parseFloat(r.rating || '0') || 0,
          image_url: r.image_url
        }));
        setRestaurants(list);
      } catch (e: any) { setError(e?.message || 'Error'); } finally { setLoading(false); }
    })();
  }, []);

  const renderItem = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Restaurant', { restaurant: item })}>
      <Card style={{ marginBottom: 12 }}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={{ height: 160, width: '100%' }} />
        ) : (
          <Shimmer height={160} />
        )}
        <Card.Title title={item.name} subtitle={`⭐ ${item.rating.toFixed(1)}`} />
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={{ padding: 16 }}>
      <Chip icon="map-marker" style={{ alignSelf: 'flex-start', marginBottom: 12 }}>{coords}</Chip>

      <FlatList
        data={categories}
        keyExtractor={(c) => c}
        renderItem={({ item }) => <Chip style={{ marginRight: 8 }}>{item}</Chip>}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
      />

      {loading && (
        <View style={{ gap: 12 }}>
          <Shimmer height={200} />
          <Shimmer height={200} />
          <Shimmer height={200} />
        </View>
      )}
      {!loading && error && <Text style={{ color: '#d32f2f' }}>{error}</Text>}
      {!loading && !error && (
        <FlatList
          data={restaurants}
          keyExtractor={(r) => String(r.id)}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}
