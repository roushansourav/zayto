import React from 'react';
import { View, Platform } from 'react-native';
import { Text, List, Button, SegmentedButtons } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

const mockTx = [
  { id: 1, type: 'credit', amount: 1200, ts: new Date() },
  { id: 2, type: 'debit', amount: -450, ts: new Date(Date.now() - 86400000) },
  { id: 3, type: 'credit', amount: 800, ts: new Date(Date.now() - 86400000 * 3) },
];

export default function BalanceScreen() {
  const [type, setType] = React.useState<'all' | 'credit' | 'debit'>('all');
  const [from, setFrom] = React.useState<Date | null>(null);
  const [to, setTo] = React.useState<Date | null>(null);
  const [showFrom, setShowFrom] = React.useState(false);
  const [showTo, setShowTo] = React.useState(false);

  const filtered = mockTx.filter(tx => {
    if (type !== 'all' && tx.type !== type) return false;
    if (from && tx.ts < from) return false;
    if (to && tx.ts > to) return false;
    return true;
  });
  const total = filtered.reduce((s, x) => s + x.amount, 0);

  const datePickerSupported = Platform.OS !== 'web';

  return (
    <View style={{ padding: 16 }}>
      <Text variant="titleLarge">Balance</Text>

      <SegmentedButtons
        value={type}
        onValueChange={(v: any) => setType(v)}
        buttons={[
          { value: 'all', label: 'All' },
          { value: 'credit', label: 'Credit' },
          { value: 'debit', label: 'Debit' },
        ]}
        style={{ marginTop: 12 }}
      />

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12, alignItems: 'center' }}>
        <Button mode="outlined" onPress={() => datePickerSupported && setShowFrom(true)} disabled={!datePickerSupported}>
          {from ? from.toDateString() : 'From'}
        </Button>
        <Button mode="outlined" onPress={() => datePickerSupported && setShowTo(true)} disabled={!datePickerSupported}>
          {to ? to.toDateString() : 'To'}
        </Button>
        {(from || to) && <Button onPress={() => { setFrom(null); setTo(null); }}>Clear</Button>}
      </View>
      {!datePickerSupported && (
        <Text style={{ marginTop: 8, opacity: 0.7 }}>Date filters are available on iOS/Android.</Text>
      )}

      {showFrom && datePickerSupported && (
        <DateTimePicker
          value={from || new Date()}
          mode="date"
          onChange={(e, d) => { setShowFrom(false); if (d) setFrom(new Date(d.setHours(0,0,0,0))); }}
        />
      )}
      {showTo && datePickerSupported && (
        <DateTimePicker
          value={to || new Date()}
          mode="date"
          onChange={(e, d) => { setShowTo(false); if (d) setTo(new Date(d.setHours(23,59,59,999))); }}
        />
      )}

      <List.Section>
        <List.Subheader>Transactions ({filtered.length})</List.Subheader>
        {filtered.map(tx => (
          <List.Item key={tx.id} title={`${tx.type === 'credit' ? '+' : ''}${(tx.amount/100).toFixed(2)}`} description={tx.ts.toLocaleString()} />
        ))}
      </List.Section>

      <Text variant="titleMedium">Total: ${(total/100).toFixed(2)}</Text>
    </View>
  );
}


