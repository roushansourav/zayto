'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the discovery microfrontend
const DiscoveryMicrofrontend = dynamic(
  () => import('discovery/DiscoveryPage'),
  {
    ssr: false,
    loading: () => (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading Discovery Microfrontend...
      </div>
    )
  }
);

export default function DiscoveryPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Suspense fallback={
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          fontSize: '18px',
          color: '#666'
        }}>
          Loading Discovery Microfrontend...
        </div>
      }>
        <DiscoveryMicrofrontend />
      </Suspense>
    </div>
  );
}
