import React from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

interface LoadingButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({ loading = false, children, disabled, sx, ...rest }) => {
  return (
    <Button
      {...rest}
      disabled={loading || disabled}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        opacity: loading || disabled ? 0.9 : 1,
        ...sx
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
      {loading && (
        <CircularProgress size={18} sx={{ position: 'absolute' }} color="inherit" />
      )}
      <style>{`
        @keyframes wave {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </Button>
  );
};

export default LoadingButton;


