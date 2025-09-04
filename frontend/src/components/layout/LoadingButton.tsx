import React from 'react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({ loading = false, children, disabled, className = '', ...rest }) => {
  return (
    <button
      {...rest}
      disabled={loading || disabled}
      className={`${className}`}
      style={{
        position: 'relative',
        opacity: loading || disabled ? 0.8 : 1,
        pointerEvents: loading || disabled ? 'none' as const : 'auto',
        overflow: 'hidden'
      }}
    >
      {children}
      {loading && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%)',
            animation: 'wave 1.2s infinite'
          }}
        />
      )}
      <style>{`
        @keyframes wave {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </button>
  );
};

export default LoadingButton;


