import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  LayoutDashboard, 
  ListOrdered, 
  Users, 
  BarChart3, 
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ConfigWarningBanner } from '../common/ConfigWarningBanner';

export interface CorporationLayoutProps {
  children: ReactNode;
}

export const CorporationLayout: React.FC<CorporationLayoutProps> = ({ children }) => {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/corporation', label: 'Triage Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/corporation/issues', label: 'Priority Issues', icon: <ListOrdered size={18} /> },
    { to: '/corporation/workers', label: 'Field Crews', icon: <Users size={18} /> },
    { to: '/corporation/analytics', label: 'Civic Analytics', icon: <BarChart3 size={18} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <ConfigWarningBanner />

      {/* Municipal Official Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#0b192c',
          color: '#ffffff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          borderBottom: '1px solid rgba(0, 173, 181, 0.2)'
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '70px'
          }}
        >
          {/* Municipal Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/corporation" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 173, 181, 0.15)',
                  border: '1px solid #00adb5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00adb5'
                }}
              >
                <Building2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  MCC <span style={{ color: '#00adb5' }}>Mysuru Municipal Portal</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Mysuru City Corporation Official Dashboard
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    color: isActive ? '#00adb5' : '#cbd5e1',
                    backgroundColor: isActive ? 'rgba(0, 173, 181, 0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(0, 173, 181, 0.3)' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Officer Profile & Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Quick Switch to Other Portals */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <Link
                to="/citizen"
                title="Switch to Citizen Portal"
                style={{
                  padding: '6px 10px',
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
                to="/worker"
                title="Switch to Field Worker Portal"
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  backgroundColor: 'rgba(234, 179, 8, 0.15)',
                  color: '#eab308',
                  border: '1px solid rgba(234, 179, 8, 0.4)'
                }}
              >
                👷 Worker View
              </Link>
            </div>

            {/* Officer Badge */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                {profile?.full_name || 'Dr. K. Srinivas'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#00adb5', fontWeight: 600 }}>
                {profile?.department || 'Municipal Administration'}
              </div>
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
                border: 'none',
                color: '#cbd5e1',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main style={{ flex: 1, padding: '2rem 0 4rem 0' }}>
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
};
