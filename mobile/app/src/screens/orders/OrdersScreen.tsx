import React from 'react';
import { View, FlatList } from 'react-native';
import { Card, Text, SegmentedButtons, Button } from 'react-native-paper';
import { api } from '../../api/client';

export default function OrdersScreen({ navigation }: any) {
  const [tab, setTab] = React.useState<'process' | 'history'>('process');
  const [orders, setOrders] = React.useState<any[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/api/orders');
        if (r.data?.success) setOrders(Array.isArray(r.data.data) ? r.data.data : []);
      } catch {}
    })();
  }, []);

  const process = orders.filter(o => ['NEW', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status));
  const history = orders.filter(o => ['PICKED_UP','DELIVERED','COMPLETED','CANCELED','REJECTED'].includes(o.status));
  const data = tab === 'process' ? process : history;

  return (
    <View style={{ padding: 16, flex: 1 }}>
      <SegmentedButtons
        value={tab}
        onValueChange={(v: any) => setTab(v)}
        buttons={[{ value: 'process', label: 'Process' }, { value: 'history', label: 'History' }]}
        style={{ marginBottom: 12 }}
      />

      <FlatList
        data={data}
        keyExtractor={(o) => String(o.id)}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 12 }}>
            <Card.Title title={`Order #${item.id}`} subtitle={`${item.status}  ·  $${(item.total_cents/100).toFixed(2)}`} />
            <Card.Actions>
              <Button onPress={() => navigation.navigate('Tracking', { orderId: item.id })}>
                {tab === 'process' ? 'Track' : 'View'}
              </Button>
            </Card.Actions>
          </Card>
        )}
      />
    </View>
  );
}
