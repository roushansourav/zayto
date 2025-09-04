import React, { useMemo, useState } from 'react';
import LoadingButton from '../src/components/layout/LoadingButton';

const ProfilePage: React.FC = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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

  const isLoggedIn = useMemo(() => Boolean(token && (email || phone)), [token, email, phone]);

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
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h1>Profile & Authentication</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setMode('email')} style={{ padding: '8px 12px', background: mode==='email' ? '#1976d2' : '#eee', color: mode==='email' ? '#fff' : '#000', border: 'none', borderRadius: 4 }}>Email</button>
        <button onClick={() => setMode('phone')} style={{ padding: '8px 12px', background: mode==='phone' ? '#1976d2' : '#eee', color: mode==='phone' ? '#fff' : '#000', border: 'none', borderRadius: 4 }}>Phone OTP</button>
      </div>

      {error && (
        <div style={{ background: '#fdecea', color: '#b71c1c', padding: 12, borderRadius: 6, marginBottom: 12 }}>{error}</div>
      )}

      {mode === 'email' && (
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <h3>Email & Password</h3>
          <div style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            <input type="text" placeholder="Name (for registration)" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <LoadingButton onClick={registerWithEmail} loading={loading} style={{ padding: '8px 12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>Register</LoadingButton>
              <LoadingButton onClick={loginWithEmail} loading={loading} style={{ padding: '8px 12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>Login</LoadingButton>
            </div>
          </div>
        </div>
      )}

      {mode === 'phone' && (
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <h3>Phone OTP</h3>
          <div style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
            <input type="tel" placeholder="Phone e.g. +15550001111" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
            {!otpRequested ? (
              <LoadingButton onClick={requestOtp} loading={loading} style={{ padding: '8px 12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>Request OTP</LoadingButton>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" placeholder="Enter OTP" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4, flex: 1 }} />
                <LoadingButton onClick={verifyOtp} loading={loading} style={{ padding: '8px 12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>Verify</LoadingButton>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
        <h3>Profile</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <LoadingButton onClick={fetchProfile} loading={loading} style={{ padding: '8px 12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }} disabled={!isLoggedIn}>Fetch Profile</LoadingButton>
          <button onClick={logout} style={{ padding: '8px 12px', background: '#eee', border: '1px solid #ddd', borderRadius: 4 }}>Logout</button>
        </div>
        {profile && (
          <div style={{ marginTop: 12 }}>
            <div><strong>Email:</strong> {profile.email}</div>
            {profile.name && <div><strong>Name:</strong> {profile.name}</div>}
          </div>
        )}
        {!profile && <p style={{ color: '#666' }}>No profile loaded.</p>}
      </div>
    </div>
  );
};

export default ProfilePage;


