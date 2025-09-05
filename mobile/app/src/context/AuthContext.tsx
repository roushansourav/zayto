import React from 'react';
import { api, saveToken } from '../api/client';

export type AuthState = { token: string | null; email: string | null };

type Ctx = {
  auth: AuthState;
  login: (token: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = React.createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = React.useState<AuthState>({ token: null, email: null });

  React.useEffect(() => {
    (async () => {
      try {
        const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('zayto_auth') : null;
        if (raw) setAuth(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  React.useEffect(() => {
    try { if (typeof localStorage !== 'undefined') localStorage.setItem('zayto_auth', JSON.stringify(auth)); } catch {}
  }, [auth]);

  const login = React.useCallback(async (token: string, email: string) => {
    setAuth({ token, email });
    await saveToken(token);
  }, []);

  const logout = React.useCallback(async () => {
    setAuth({ token: null, email: null });
    await saveToken(null);
  }, []);

  const value = React.useMemo<Ctx>(() => ({ auth, login, logout }), [auth, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
