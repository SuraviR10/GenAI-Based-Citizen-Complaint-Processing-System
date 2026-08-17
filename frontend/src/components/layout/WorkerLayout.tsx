import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  HardHat
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ConfigWarningBanner } from '../common/ConfigWarningBanner';

export interface WorkerLayoutProps {
  children: ReactNode;
}

export const WorkerLayout: React.FC<WorkerLayoutProps> = ({ children }) => {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      <ConfigWarningBanner />

      {/* Mobile-First Worker Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#0f172a',
          color: '#ffffff',
          boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
          borderBottom: '2px solid #eab308'
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '62px',
            padding: '0 1rem'
          }}
        >
          {/* Worker Identity Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(234, 179, 8, 0.2)',
                border: '1px solid #eab308',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#eab308'
              }}
            >
              <HardHat size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                  {profile?.full_name || 'Field Worker'}
                </span>
                <span
                  style={{
                    backgroundColor: '#eab308',
                    color: '#0f172a',
                    fontSize: '0.62rem',
                    fontWeight: 900,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    letterSpacing: '0.05em'
                  }}
                >
                  FIELD CREW
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>{profile?.department || 'Road Maintenance'}</span>
                <span>&bull;</span>
                <span style={{ color: '#38bdf8' }}>{profile?.area || 'Ward Operative'}</span>
              </div>
            </div>
          </div>

          {/* User Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Quick Portal Switch */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <Link
                to="/citizen"
                title="Switch to Citizen Portal"
                style={{
                  padding: '5px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  backgroundColor: 'rgba(0, 173, 181, 0.15)',
                  color: '#00adb5',
                  border: '1px solid rgba(0, 173, 181, 0.4)'
                }}
              >
                👤 Citizen View
              </Link>
              <Link
                to="/corporation"
                title="Switch to MCC Official Portal"
                style={{
                  padding: '5px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#e0e7ff',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                🏛️ MCC Official View
              </Link>
            </div>

            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              title="Sign Out"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#cbd5e1',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Sub-bar */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0.5rem 0' }}>
        <div className="container" style={{ display: 'flex', gap: '8px' }}>
          <Link
            to="/worker"
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
              color: location.pathname === '/worker' ? '#0f172a' : '#64748b',
              backgroundColor: location.pathname === '/worker' ? '#f1f5f9' : 'transparent',
              border: location.pathname === '/worker' ? '1px solid #cbd5e1' : '1px solid transparent'
            }}
          >
            📋 My Tasks Queue
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '1rem 0 4rem 0' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          {children}
        </div>
      </main>
    </div>
  );
};
