import React from 'react';
import DiscoveryPage from '../src/components/discovery/DiscoveryPage';

export default function HomePage() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ backgroundColor: '#1976d2', color: 'white', padding: '20px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Zayto - Restaurant Discovery Platform</h1>
      </header>
      
      <main>
        <h2>Welcome to Zayto</h2>
        <p>Discover amazing restaurants and explore their menus and reviews.</p>
        
        <section style={{ marginTop: '40px', textAlign: 'center' }}>
          <h3>Services Status</h3>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href="http://localhost:8080/health" 
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#1976d2',
                color: 'white',
                padding: '10px 20px',
                textDecoration: 'none',
                borderRadius: '4px',
                display: 'inline-block'
              }}
            >
              API Gateway Health
            </a>
            <a 
              href="http://localhost:3001/health" 
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#1976d2',
                color: 'white',
                padding: '10px 20px',
                textDecoration: 'none',
                borderRadius: '4px',
                display: 'inline-block'
              }}
            >
              Restaurants Service Health
            </a>
          </div>
        </section>

        <section style={{ marginTop: '40px' }}>
          <h3>API Endpoints</h3>
          <ul>
            <li>Restaurants: <code>http://localhost:8080/api/restaurants</code></li>
            <li>Restaurant Details: <code>http://localhost:8080/api/restaurants/:id</code></li>
            <li>Restaurant Menu: <code>http://localhost:8080/api/restaurants/:id/menu</code></li>
            <li>Restaurant Reviews: <code>http://localhost:8080/api/restaurants/:id/reviews</code></li>
          </ul>
        </section>

        <section style={{ marginTop: '40px' }}>
          <h3>Discovery Page</h3>
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginTop: '20px' }}>
            <DiscoveryPage />
          </div>
        </section>
      </main>
    </div>
  );
}
