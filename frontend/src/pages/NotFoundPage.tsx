import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem 1.5rem'
      }}
    >
      <div className="icon-container-3d-cyan" style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-full)', marginBottom: '1.5rem' }}>
        <Compass size={32} />
      </div>

      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-primary-800)', marginBottom: '8px' }}>
        404
      </h1>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
        Civic Page Not Found
      </h2>

      <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', maxWidth: '420px', lineHeight: 1.5, marginBottom: '2rem' }}>
        The page or report you are looking for does not exist or may have been moved.
      </p>

      <Link to="/citizen">
        <Button variant="cyan" size="lg" leftIcon={<Home size={18} />}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};
