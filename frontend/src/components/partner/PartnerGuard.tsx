import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/AuthContext';

const PartnerGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { auth } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!auth.token) {
      router.replace(`/login?next=${encodeURIComponent(router.asPath)}`);
      return;
    }
    if (auth.role !== 'partner') {
      router.replace(`/profile`);
    }
  }, [auth.token, auth.role, router]);

  if (!auth.token || auth.role !== 'partner') return null;
  return <>{children}</>;
};

export default PartnerGuard;


