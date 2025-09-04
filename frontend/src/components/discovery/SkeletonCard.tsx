import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div style={{
      border: '1px solid #eee',
      borderRadius: 8,
      overflow: 'hidden',
      background: '#fff'
    }}>
      <div style={{ height: 160, background: '#f3f3f3', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #f3f3f3 0%, #ececec 50%, #f3f3f3 100%)', animation: 'shimmer 1.4s infinite' }} />
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ height: 16, width: '60%', background: '#f0f0f0', marginBottom: 8, borderRadius: 4 }} />
        <div style={{ height: 12, width: '40%', background: '#f0f0f0', marginBottom: 12, borderRadius: 4 }} />
        <div style={{ height: 12, width: '90%', background: '#f0f0f0', marginBottom: 6, borderRadius: 4 }} />
        <div style={{ height: 12, width: '80%', background: '#f0f0f0', borderRadius: 4 }} />
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default SkeletonCard;


