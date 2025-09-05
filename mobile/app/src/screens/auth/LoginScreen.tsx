import React from 'react';
import { View } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import LoadingButton from '../../components/LoadingButton';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { registerForPushAndSend } from '../../lib/push';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async () => {
    setError(null); setLoading(true);
    try {
      const res = await api.post('/api/users/login', { email, password });
      if (!res.data?.success) throw new Error(res.data?.error || 'Login failed');
      await login(res.data.data.token, email);
      try { await registerForPushAndSend(); } catch {}
      navigation.replace('App');
    } catch (e: any) {
      setError(e?.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text variant="titleLarge">Log in</Text>
      {error && <Text style={{ color: '#d32f2f' }}>{error}</Text>}
      <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <LoadingButton mode="contained" onPress={onSubmit} loading={loading}>Sign in</LoadingButton>
      <LoadingButton mode="text" onPress={() => navigation.navigate('Register')}>Create account</LoadingButton>
      <LoadingButton mode="text" onPress={() => navigation.navigate('Otp')}>Sign in with phone</LoadingButton>
    </View>
  );
}
