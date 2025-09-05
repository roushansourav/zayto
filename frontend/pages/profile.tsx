import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../src/lib/AuthContext';
import LoadingButton from '../src/components/layout/LoadingButton';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

const ProfilePage: React.FC = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const { auth, logout: ctxLogout } = useAuth();

  const [mode, setMode] = useState<'email' | 'phone'>('email');

  // Shared auth state (demo only)
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [profile, setProfile] = useState<{ email: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const getErrorMessage = (err: unknown) => (err instanceof Error ? err.message : 'Unexpected error');

  // Email/password
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Phone OTP
  const [phone, setPhone] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const isLoggedIn = useMemo(() => Boolean((token || auth.token) && (email || auth.email)), [token, email, phone, auth]);

  useEffect(() => {
    if (!(auth.token || token)) {
      window.location.href = '/login';
    }
  }, [auth.token, token]);

  const registerWithEmail = async () => {
    setError(null); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Registration failed');
      setToken(data.data?.token || null);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async () => {
    setError(null); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Login failed');
      setToken(data.data?.token || null);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async () => {
    setError(null); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'OTP request failed');
      setOtpRequested(true);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError(null); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otpCode })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'OTP verify failed');
      setToken(data.data?.token || null);
      // emulate email from phone for profile endpoint
      setEmail(`${phone}@phone.local`);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    setError(null); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: { 'x-user-email': email }
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Profile fetch failed');
      setProfile(data.data);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null); setProfile(null); setPassword(''); setName(''); setOtpRequested(false); setOtpCode('');
    ctxLogout();
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>Profile & Authentication</Typography>

      <Paper elevation={0} sx={{ mb: 2 }}>
        <Tabs value={mode} onChange={(_, v) => setMode(v)} aria-label="auth modes" sx={{ borderBottom: '1px solid #eee' }}>
          <Tab value="email" label="Email" />
          <Tab value="phone" label="Phone OTP" />
        </Tabs>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {mode === 'email' && (
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Email & Password</Typography>
          <Box sx={{ display: 'grid', gap: 1.5, maxWidth: 420 }}>
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
            <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
            <TextField label="Name (for registration)" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <LoadingButton onClick={registerWithEmail} loading={loading} variant="contained">Register</LoadingButton>
              <LoadingButton onClick={loginWithEmail} loading={loading} variant="contained">Login</LoadingButton>
            </Box>
          </Box>
        </Paper>
      )}

      {mode === 'phone' && (
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Phone OTP</Typography>
          <Box sx={{ display: 'grid', gap: 1.5, maxWidth: 420 }}>
            <TextField label="Phone e.g. +15550001111" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
            {!otpRequested ? (
              <LoadingButton onClick={requestOtp} loading={loading} variant="contained">Request OTP</LoadingButton>
            ) : (
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField label="Enter OTP" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} fullWidth />
                <LoadingButton onClick={verifyOtp} loading={loading} variant="contained">Verify</LoadingButton>
              </Box>
            )}
          </Box>
        </Paper>
      )}

      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Profile</Typography>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <LoadingButton onClick={fetchProfile} loading={loading} variant="contained" disabled={!isLoggedIn}>Fetch Profile</LoadingButton>
          <Button onClick={logout} variant="outlined">Logout</Button>
        </Box>
        {profile && (
          <Box sx={{ mt: 2 }}>
            <div><strong>Email:</strong> {profile.email}</div>
            {profile.name && <div><strong>Name:</strong> {profile.name}</div>}
          </Box>
        )}
        {!profile && <Typography variant="body2" color="text.secondary">No profile loaded.</Typography>}
      </Paper>
    </Container>
  );
};

export default ProfilePage;


