import React from 'react';
import { View, FlatList, Image } from 'react-native';
import { TextInput, Card, Text, Chip } from 'react-native-paper';
import { api } from '../../api/client';
import Shimmer from '../../components/Shimmer';

type Restaurant = { id: number; name: string; rating: number; image_url?: string };

const tags = ['Pizza', 'Burger', 'Sushi', 'Salad', 'Dessert'];

export default function SearchScreen() {
  const [query, setQuery] = React.useState('');
  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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

  const filtered = React.useMemo(() => {
    if (!query.trim()) return restaurants;
    const q = query.toLowerCase();
    return restaurants.filter(r => r.name.toLowerCase().includes(q));
  }, [restaurants, query]);

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <TextInput placeholder="Search restaurants" value={query} onChangeText={setQuery} left={<TextInput.Icon icon="magnify" />} />
      <FlatList
        data={tags}
        keyExtractor={(t) => t}
        renderItem={({ item }) => <Chip onPress={() => setQuery(item)} style={{ marginRight: 8 }}>{item}</Chip>}
        horizontal
        showsHorizontalScrollIndicator={false}
      />

      {loading && (
        <View style={{ gap: 12 }}>
          <Shimmer height={200} />
          <Shimmer height={200} />
        </View>
      )}
      {!loading && error && <Text style={{ color: '#d32f2f' }}>{error}</Text>}
      {!loading && !error && (
        <FlatList
          data={filtered}
          keyExtractor={(r) => String(r.id)}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: 12 }}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={{ height: 160, width: '100%' }} />
              ) : (
                <Shimmer height={160} />
              )}
              <Card.Title title={item.name} subtitle={`⭐ ${item.rating.toFixed(1)}`} />
            </Card>
          )}
        />
      )}
    </View>
  );
}
