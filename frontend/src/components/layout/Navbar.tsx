import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, 
  PlusCircle, 
  Compass, 
  FileText, 
  ThumbsUp, 
  HelpCircle, 
  Bell, 
  User, 
  LogOut, 
  Globe, 
  Menu, 
  X,
  ChevronDown,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageCode } from '../../lib/i18n';
import { api } from '../../lib/api';
import { Notification } from '../../lib/types';
import { isSupabaseConfigured } from '../../lib/supabase';
import { ConnectionStatusModal } from '../common/ConnectionStatusModal';

export const Navbar: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [connectionModalOpen, setConnectionModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (user?.id) {
      api.listNotifications(user.id)
        .then((items) => {
          setNotifications(items);
          setUnreadCount(items.filter((n) => !n.is_read).length);
        })
        .catch(() => {});
    }
  }, [user?.id, location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/citizen', label: t.dashboard, icon: <Building2 size={18} /> },
    { to: '/citizen/report', label: t.reportProblem, icon: <PlusCircle size={18} />, highlight: true },
    { to: '/citizen/issues', label: t.exploreProblems, icon: <Compass size={18} /> },
    { to: '/citizen/complaints', label: t.myReports, icon: <FileText size={18} /> },
    { to: '/citizen/supported', label: t.supportedIssues, icon: <ThumbsUp size={18} /> },
    { to: '/citizen/help', label: t.helpCenter, icon: <HelpCircle size={18} /> }
  ];

  const handleMarkAsRead = async (notifId: string, issueId?: string | null) => {
    try {
      await api.markNotificationRead(notifId);
      setNotifications((prev) => prev.map((n) => n.id === notifId ? { ...n, is_read: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifDropdownOpen(false);
      if (issueId) {
        navigate(`/citizen/tracking/${issueId}`);
      }
    } catch {}
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--color-bg-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
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
        {/* Brand Logo with 3D container */}
        <Link to="/citizen" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-primary-800)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(11, 25, 44, 0.25)',
              border: '1px solid rgba(0, 173, 181, 0.3)'
            }}
          >
            <Building2 size={22} color="#00adb5" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary-800)', letterSpacing: '-0.02em' }}>
                CivicConnect
              </span>
              <span
                style={{
                  backgroundColor: 'var(--color-accent-100)',
                  color: 'var(--color-accent-600)',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: '1px solid rgba(0, 173, 181, 0.3)'
                }}
              >
                AI
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', marginTop: '-2px' }}>
              {t.citizenPortal.toUpperCase()}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '4px' }} className="desktop-nav">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;

            if (link.highlight) {
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-accent-500)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    boxShadow: '0 4px 12px rgba(0, 173, 181, 0.3)',
                    transition: 'all var(--transition-normal)',
                    marginLeft: '4px',
                    marginRight: '4px'
                  }}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--color-primary-800)' : 'var(--color-text-secondary)',
                  backgroundColor: isActive ? 'var(--color-bg-subtle)' : 'transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Controls: Connection Status, Language, Notifications, Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* System / Supabase Connection Status Pill */}
          <button
            onClick={() => setConnectionModalOpen(true)}
            title="Click to check System & Supabase connection status"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              border: isSupabaseConfigured() ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
              backgroundColor: isSupabaseConfigured() ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              color: isSupabaseConfigured() ? '#047857' : '#b45309',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isSupabaseConfigured() ? '#10b981' : '#f59e0b',
                boxShadow: isSupabaseConfigured() ? '0 0 6px #10b981' : '0 0 6px #f59e0b'
              }}
            />
            <Database size={13} />
            <span>{isSupabaseConfigured() ? t.liveDatabase : t.previewMode}</span>
          </button>

          {/* Language Switcher */}
          <div ref={langRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-secondary)',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)'
              }}
              aria-label="Select Language"
            >
              <Globe size={16} color="var(--color-accent-600)" />
              <span>{language === 'English' ? 'EN' : language === 'Kannada' ? 'ಕನ್ನಡ' : 'हिन्दी'}</span>
              <ChevronDown size={14} />
            </button>

            {langDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  width: '150px',
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--color-border)',
                  padding: '6px',
                  zIndex: 200
                }}
              >
                {(['English', 'Kannada', 'Hindi'] as LanguageCode[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setLangDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      textAlign: 'left',
                      background: language === lang ? 'var(--color-bg-subtle)' : 'none',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: language === lang ? 700 : 500,
                      color: language === lang ? 'var(--color-primary-800)' : 'var(--color-text-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    {lang === 'English' ? 'English (EN)' : lang === 'Kannada' ? 'ಕನ್ನಡ (KN)' : 'हिन्दी (HI)'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              style={{
                position: 'relative',
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)'
              }}
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: 'var(--color-critical)',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-full)',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #ffffff'
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  width: '320px',
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--color-border)',
                  overflow: 'hidden',
                  zIndex: 200
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary-800)' }}>
                    {t.notifications}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {unreadCount} unread
                  </span>
                </div>

                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      {t.noNotifications}
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleMarkAsRead(notif.id, notif.issue_id)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--color-border)',
                          backgroundColor: notif.is_read ? 'transparent' : 'var(--color-accent-100)',
                          cursor: 'pointer',
                          transition: 'background var(--transition-fast)'
                        }}
                      >
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
                          {notif.message}
                        </p>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px 4px 6px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-card)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary-700)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              >
                {profile?.full_name?.charAt(0) || 'C'}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-800)', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.full_name?.split(' ')[0] || 'Citizen'}
              </span>
              <ChevronDown size={14} color="var(--color-text-muted)" />
            </button>

            {profileDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  width: '210px',
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--color-border)',
                  padding: '6px',
                  zIndex: 200
                }}
              >
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)', marginBottom: '4px' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-primary-800)' }}>
                    {profile?.full_name || 'Citizen'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {profile?.area || 'Ward Resident'}
                  </p>
                </div>

                <Link
                  to="/citizen/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.85rem',
                    fontWeight: 500
                  }}
                >
                  <User size={16} />
                  <span>{t.profile}</span>
                </Link>

                <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }} />

                <Link
                  to="/corporation"
                  onClick={() => setProfileDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    color: '#00adb5',
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}
                >
                  <Building2 size={15} />
                  <span>MCC Official Portal</span>
                </Link>

                <Link
                  to="/worker"
                  onClick={() => setProfileDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    color: '#eab308',
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}
                >
                  <span>👷</span>
                  <span>Field Crew Portal</span>
                </Link>

                <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }} />

                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-critical)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    marginTop: '2px'
                  }}
                >
                  <LogOut size={16} />
                  <span>{t.logout}</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              padding: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-primary-800)'
            }}
            className="mobile-toggle"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderTop: '1px solid var(--color-border)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: link.highlight ? 'var(--color-accent-500)' : location.pathname === link.to ? 'var(--color-bg-subtle)' : 'transparent',
                color: link.highlight ? '#ffffff' : 'var(--color-primary-800)',
                fontWeight: 600,
                fontSize: '0.95rem'
              }}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Responsive Breakpoint CSS */}
      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
        @media (max-width: 899px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>

      {/* Connection & Diagnostics Modal */}
      <ConnectionStatusModal
        isOpen={connectionModalOpen}
        onClose={() => setConnectionModalOpen(false)}
      />
    </header>
  );
};
