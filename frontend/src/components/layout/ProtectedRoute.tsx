import React, { ReactNode } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../lib/types';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { Button } from '../common/Button';

export interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '5rem', maxWidth: '600px' }}>
        <LoadingSkeleton variant="card" count={2} />
      </div>
    );
  }

  // If no authenticated user, redirect to login
  if (!user && !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is restricted and current user role does not match
  if (allowedRoles && profile?.role && !allowedRoles.includes(profile.role)) {
    const fallbackPath = profile.role === 'corporation' 
      ? '/corporation' 
      : profile.role === 'worker' 
        ? '/worker' 
        : '/citizen';

    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}
      >
        <div
          style={{
            maxWidth: '500px',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '2.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0'
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}
          >
            <ShieldAlert size={32} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Access Restricted
          </h2>

          <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.75rem' }}>
            Your account is assigned the role <strong>{profile.role.toUpperCase()}</strong>. You do not have permission to access the requested portal.
          </p>

          <Link to={fallbackPath}>
            <Button variant="primary" leftIcon={<ArrowLeft size={16} />}>
              Return to My Portal
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
