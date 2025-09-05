import React from 'react';
import { View } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import LoadingButton from '../../components/LoadingButton';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function OtpScreen({ navigation }: any) {
  const { login } = useAuth();
  const [phone, setPhone] = React.useState('');
  const [code, setCode] = React.useState('');
  const [requested, setRequested] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const request = async () => {
    setError(null); setLoading(true);
    try {
      const r = await api.post('/api/users/auth/otp/request', { phone });
      if (!r.data?.success) throw new Error(r.data?.error || 'OTP request failed');
      setRequested(true);
    } catch (e: any) { setError(e?.message || 'OTP request error'); } finally { setLoading(false); }
  };

  const verify = async () => {
    setError(null); setLoading(true);
    try {
      const r = await api.post('/api/users/auth/otp/verify', { phone, code });
      if (!r.data?.success) throw new Error(r.data?.error || 'OTP verify failed');
      await login(r.data.data.token, `${phone}@phone.local`);
      navigation.replace('App');
    } catch (e: any) { setError(e?.message || 'OTP verify error'); } finally { setLoading(false); }
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text variant="titleLarge">Phone sign in</Text>
      {error && <Text style={{ color: '#d32f2f' }}>{error}</Text>}
      <TextInput label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      {!requested ? (
        <LoadingButton mode="contained" onPress={request} loading={loading}>
          Request OTP
        </LoadingButton>
      ) : (
        <>
          <TextInput label="Enter code" value={code} onChangeText={setCode} keyboardType="number-pad" />
          <LoadingButton mode="contained" onPress={verify} loading={loading}>
            Verify
          </LoadingButton>
        </>
      )}
    </View>
  );
}
