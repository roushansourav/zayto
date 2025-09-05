import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type AuthState = {
  token: string | null;
  email: string | null;
  role?: 'user' | 'partner' | null;
};

type AuthContextType = {
  auth: AuthState;
  login: (token: string, email: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({ token: null, email: null, role: null });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('zayto_auth');
    if (saved) setAuth(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('zayto_auth', JSON.stringify(auth));
  }, [auth]);

  const value = useMemo<AuthContextType>(() => ({
    auth,
    login: (token, email) => setAuth({ token, email, role: 'user' }),
    logout: () => setAuth({ token: null, email: null, role: null })
  }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};


