import React from 'react';
import { View } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { api } from '../../api/client';
import EventSource from 'react-native-event-source';

export default function TrackingScreen({ route }: any) {
  const { orderId } = route.params as { orderId: number | string };
  const [order, setOrder] = React.useState<any>(null);

  React.useEffect(() => {
    let mounted = true;
    const fetchOnce = async () => {
      try {
        const r = await api.get(`/api/orders/${orderId}`);
        if (mounted && r.data?.success) setOrder(r.data.data);
      } catch {}
    };
    fetchOnce();

    // Try SSE
    let es: EventSource | null = null;
    try {
      const base = (api.defaults.baseURL || '').replace(/\/$/, '');
      es = new EventSource(`${base}/api/orders/${orderId}/stream`, { headers: {} });
      es.addEventListener('message', (e: any) => {
        try { const data = JSON.parse(e.data); if (data?.type === 'status' && mounted) setOrder((o: any) => ({ ...(o||{}), status: data.status })); } catch {}
      });
      es.addEventListener('error', () => { /* ignore; polling will continue via fallback below */ });
    } catch {}

    const t = setInterval(fetchOnce, 15000); // slow fallback
    return () => { mounted = false; clearInterval(t); es && es.close(); };
  }, [orderId]);

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text variant="titleLarge">Track Order #{orderId}</Text>
      <Card style={{ height: 200, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Map placeholder</Text>
      </Card>
      <Card style={{ padding: 12 }}>
        <Text variant="titleMedium">Status</Text>
        <Text>{order?.status || 'Loading...'}</Text>
        <Text style={{ marginTop: 8 }}>Total: ${order ? (order.total_cents/100).toFixed(2) : '--'}</Text>
        <Button mode="contained" style={{ marginTop: 8 }}>Call Restaurant</Button>
      </Card>
    </View>
  );
}
