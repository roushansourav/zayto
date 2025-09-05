import React, { useState } from 'react';
import { useAuth } from '../src/lib/AuthContext';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

export default function LoginPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Phone OTP
  const [phone, setPhone] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const doLogin = async () => {
    setError(null); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Login failed');
      login(data.data?.token, email);
      window.location.href = '/profile';
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login error');
    } finally { setLoading(false); }
  };

  const requestOtp = async () => {
    setError(null); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/auth/otp/request`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'OTP request failed');
      setOtpRequested(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'OTP request error');
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    setError(null); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/auth/otp/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, code: otpCode }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'OTP verify failed');
      // backend returns token and user
      login(data.data?.token, `${phone}@phone.local`);
      window.location.href = '/profile';
    } catch (e) {
      setError(e instanceof Error ? e.message : 'OTP verify error');
    } finally { setLoading(false); }
  };

  const loginWithGoogle = async () => {
    setError(null); setLoading(true);
    try {
      // In dev, backend accepts any token and fabricates a user (fallback)
      const res = await fetch(`${API_BASE_URL}/api/users/auth/google`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: 'dev-token' }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Google sign-in failed');
      login(data.data?.token, data.data?.user?.email || '');
      window.location.href = '/profile';
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google sign-in error');
    } finally { setLoading(false); }
  };

  const loginWithApple = async () => {
    setError(null); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/auth/apple`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identityToken: 'dev-token' }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Apple sign-in failed');
      login(data.data?.token, data.data?.user?.email || '');
      window.location.href = '/profile';
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Apple sign-in error');
    } finally { setLoading(false); }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={1} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Log in</Typography>
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

        <Stack spacing={1.5}>
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth size="medium" />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth size="medium" />
          <Button onClick={doLogin} disabled={loading} variant="contained" color="error">{loading ? 'Signing in...' : 'Sign in'}</Button>
        </Stack>

        <Divider sx={{ my: 3 }}>Or continue with phone</Divider>
        <Stack spacing={1.5}>
          <TextField label="Phone e.g. +15550001111" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
          {!otpRequested ? (
            <Button onClick={requestOtp} disabled={loading || !phone} variant="contained">Request OTP</Button>
          ) : (
            <Stack direction="row" spacing={1.5}>
              <TextField label="Enter OTP" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} fullWidth />
              <Button onClick={verifyOtp} disabled={loading || !otpCode} variant="contained">Verify</Button>
            </Stack>
          )}
        </Stack>

        <Divider sx={{ my: 3 }}>Or sign in with</Divider>
        <Stack direction="row" spacing={1.5}>
          <Button onClick={loginWithGoogle} disabled={loading} variant="contained" sx={{ bgcolor: '#db4437' }}>Google</Button>
          <Button onClick={loginWithApple} disabled={loading} variant="contained" sx={{ bgcolor: '#000' }}>Apple</Button>
        </Stack>
      </Paper>
    </Container>
  );
}


