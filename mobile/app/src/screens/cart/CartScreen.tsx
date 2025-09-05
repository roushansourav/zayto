import React from 'react';
import { View, FlatList, Linking } from 'react-native';
import { Text, Button, IconButton, Card, SegmentedButtons, Portal, Modal, RadioButton } from 'react-native-paper';
import { useCart } from '../../context/CartContext';
import { api } from '../../api/client';

export default function CartScreen({ navigation }: any) {
  const { items, subtotal_cents, updateQty, removeItem, clear } = useCart();
  const [mode, setMode] = React.useState<'delivery' | 'pickup'>('delivery');
  const [paymentVisible, setPaymentVisible] = React.useState(false);
  const [payment, setPayment] = React.useState<'cash' | 'card' | 'paypal'>('cash');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const createOrder = async () => {
    if (items.length === 0) return;
    setError(null); setLoading(true);
    try {
      // Demo: choose a restaurant id of 1; in real flow attach restaurant context
      const payload = { restaurant_id: 1, items: items.map(i => ({ name: i.name, price_cents: i.price_cents, qty: i.qty })) };
      const r = await api.post('/api/orders', payload);
      if (!r.data?.success) throw new Error(r.data?.error || 'Order failed');
      const orderId = r.data.data.id;

      if (payment === 'cash') {
        // Simulate pay stub
        try { await api.post(`/api/orders/${orderId}/pay`); } catch {}
        clear();
        navigation.navigate('Orders', { screen: 'Tracking', params: { orderId } });
      } else if (payment === 'card') {
        // Use stripe by default for card in this demo
        const resp = await api.post('/api/payments/initiate', { provider: 'stripe', order_id: orderId });
        const url = resp.data?.data?.redirectUrl;
        if (url) Linking.openURL(url);
        clear();
        navigation.navigate('Orders', { screen: 'Tracking', params: { orderId } });
      } else if (payment === 'paypal') {
        const resp = await api.post('/api/payments/initiate', { provider: 'paypal', order_id: orderId });
        const url = resp.data?.data?.redirectUrl;
        if (url) Linking.openURL(url);
        clear();
        navigation.navigate('Orders', { screen: 'Tracking', params: { orderId } });
      }
    } catch (e: any) {
      setError(e?.message || 'Order error');
    } finally { setLoading(false); }
  };

  return (
    <View style={{ padding: 16, flex: 1 }}>
      <SegmentedButtons
        value={mode}
        onValueChange={(v: any) => setMode(v)}
        buttons={[{ value: 'delivery', label: 'Delivery' }, { value: 'pickup', label: 'Pickup' }]}
        style={{ marginBottom: 12 }}
      />

      {items.length === 0 && <Text>Your cart is empty.</Text>}
      {items.length > 0 && (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: 12 }}>
              <Card.Title title={item.name} subtitle={`$${(item.price_cents / 100).toFixed(2)}`} right={() => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <IconButton icon="minus" onPress={() => updateQty(item.id, item.qty - 1)} />
                  <Text>{item.qty}</Text>
                  <IconButton icon="plus" onPress={() => updateQty(item.id, item.qty + 1)} />
                  <IconButton icon="delete" onPress={() => removeItem(item.id)} />
                </View>
              )} />
            </Card>
          )}
        />
      )}

      <View style={{ marginTop: 'auto', gap: 8 }}>
        {error && <Text style={{ color: '#d32f2f' }}>{error}</Text>}
        <Button mode="outlined" onPress={() => setPaymentVisible(true)}>Payment Method: {payment.toUpperCase()}</Button>
        <Text variant="titleMedium">Subtotal: ${ (subtotal_cents / 100).toFixed(2) }</Text>
        <Button mode="contained" onPress={createOrder} loading={loading} disabled={items.length === 0}>Pay</Button>
        <Button onPress={clear}>Clear Cart</Button>
      </View>

      <Portal>
        <Modal visible={paymentVisible} onDismiss={() => setPaymentVisible(false)} contentContainerStyle={{ backgroundColor: 'white', margin: 16, padding: 16, borderRadius: 8 }}>
          <Text variant="titleMedium" style={{ marginBottom: 8 }}>Select Payment</Text>
          <RadioButton.Group onValueChange={(v: any) => setPayment(v)} value={payment}>
            <RadioButton.Item label="Cash" value="cash" />
            <RadioButton.Item label="Card (Stripe)" value="card" />
            <RadioButton.Item label="PayPal" value="paypal" />
          </RadioButton.Group>
          <Button mode="contained" onPress={() => setPaymentVisible(false)}>Set Payment Method</Button>
        </Modal>
      </Portal>
    </View>
  );
}
