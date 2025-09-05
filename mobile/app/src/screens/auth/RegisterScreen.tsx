import React from 'react';
import { View } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import LoadingButton from '../../components/LoadingButton';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }: any) {
  const { login } = useAuth();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async () => {
    setError(null); setLoading(true);
    try {
      const res = await api.post('/api/users/register', { name, email, password });
      if (!res.data?.success) throw new Error(res.data?.error || 'Registration failed');
      await login(res.data.data.token, email);
      navigation.replace('App');
    } catch (e: any) {
      setError(e?.message || 'Registration error');
    } finally { setLoading(false); }
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text variant="titleLarge">Create account</Text>
      {error && <Text style={{ color: '#d32f2f' }}>{error}</Text>}
      <TextInput label="Full name" value={name} onChangeText={setName} />
      <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <LoadingButton mode="contained" onPress={onSubmit} loading={loading}>Create account</LoadingButton>
      <LoadingButton mode="text" onPress={() => navigation.goBack()}>Back to login</LoadingButton>
    </View>
  );
}
