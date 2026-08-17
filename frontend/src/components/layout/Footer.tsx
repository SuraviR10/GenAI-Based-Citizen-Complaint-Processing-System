import React from 'react';
import { Building2, ShieldCheck, Heart, Sparkles, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-primary-800)',
        color: '#ffffff',
        marginTop: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '3rem 0 2rem 0'
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem'
          }}
        >
          {/* Brand & Purpose */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(0, 173, 181, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--color-accent-500)'
                }}
              >
                <Building2 size={18} color="#00adb5" />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                CivicConnect AI
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '320px' }}>
              {t.footerDescription}
            </p>
          </div>

          {/* Citizen Links */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              {t.quickLinks}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', margin: 0, padding: 0 }}>
              <li>
                <Link to="/citizen/report" style={{ color: '#cbd5e1', textDecoration: 'none' }}>+ {t.reportProblem}</Link>
              </li>
              <li>
                <Link to="/citizen/issues" style={{ color: '#cbd5e1', textDecoration: 'none' }}>{t.exploreProblems}</Link>
              </li>
              <li>
                <Link to="/citizen/complaints" style={{ color: '#cbd5e1', textDecoration: 'none' }}>{t.myReports}</Link>
              </li>
              <li>
                <Link to="/citizen/supported" style={{ color: '#cbd5e1', textDecoration: 'none' }}>{t.supportedIssues}</Link>
              </li>
            </ul>
          </div>

          {/* AI & Transparency Statement */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              {t.step4Title}
            </h4>
            <p style={{ fontSize: '0.825rem', color: '#94a3b8', lineHeight: 1.6 }}>
              {t.aiDisclaimer} {t.accidentDisclaimer}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', color: 'var(--color-accent-400)', fontSize: '0.8rem' }}>
              <ShieldCheck size={16} />
              <span>Row Level Security (RLS) Protected</span>
            </div>
          </div>

          {/* Help & Support */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              {t.helpCenter}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', margin: 0, padding: 0 }}>
              <li>
                <Link to="/citizen/help" style={{ color: '#cbd5e1', textDecoration: 'none' }}>{t.helpCenterTitle}</Link>
              </li>
              <li>
                <Link to="/citizen/profile" style={{ color: '#cbd5e1', textDecoration: 'none' }}>{t.profileTitle}</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & status bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: '#64748b'
          }}
        >
          <div>
            {t.copyright}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>CivicConnect AI</span>
            <span>•</span>
            <span>English / ಕನ್ನಡ / हिन्दी</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
