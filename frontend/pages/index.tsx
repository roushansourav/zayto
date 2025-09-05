import React from 'react';
// Link not used directly in this file after extracting header
import HomeHeader from '../src/components/home/HomeHeader';
import CategoryScroller from '../src/components/home/CategoryScroller';
import FilterChips from '../src/components/home/FilterChips';
import DiscoveryPage from '../src/components/discovery/DiscoveryPage';

export default function HomePage() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <HomeHeader />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <CategoryScroller />

        <section style={{ marginTop: 24 }}>
          <FilterChips />
        </section>

        <section style={{ marginTop: 24 }}>
          <h3>Discovery Page</h3>
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginTop: '20px' }}>
            <DiscoveryPage />
          </div>
        </section>
      </main>
    </div>
  );
}
