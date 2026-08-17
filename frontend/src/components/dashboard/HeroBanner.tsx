import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Compass, Sparkles, MapPin, Activity } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../common/Button';

export interface HeroBannerProps {
  userName?: string;
  userArea?: string | null;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ userName, userArea }) => {
  const { t } = useLanguage();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.goodMorning;
    if (hour < 17) return t.goodAfternoon;
    return t.goodEvening;
  };

  return (
    <div
      className="hero-depth-layer"
      style={{
        padding: '3rem 2.5rem',
        marginBottom: '2rem',
        position: 'relative'
      }}
    >
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          maxWidth: '720px'
        }}
      >
        {/* User Greeting & Area Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <span
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.825rem',
              fontWeight: 600,
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} color="#00fff0" />
            <span>{getGreeting()}, {userName || 'Citizen'}</span>
          </span>

          {userArea && (
            <span
              style={{
                backgroundColor: 'rgba(0, 173, 181, 0.25)',
                border: '1px solid rgba(0, 173, 181, 0.4)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: '#e0f7fa',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <MapPin size={13} />
              <span>Ward: {userArea}</span>
            </span>
          )}
        </div>

        {/* Hero Tagline */}
        <h1
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.2,
            marginBottom: '1rem',
            letterSpacing: '-0.02em'
          }}
        >
          {t.heroTagline}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '1.05rem',
            color: '#cbd5e1',
            lineHeight: 1.6,
            marginBottom: '2rem',
            maxWidth: '600px'
          }}
        >
          {t.heroSubtitle}
        </p>

        {/* Action Buttons with 3D depth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/citizen/report">
            <Button
              variant="cyan"
              size="lg"
              leftIcon={<PlusCircle size={20} />}
              style={{
                fontWeight: 700,
                boxShadow: '0 8px 20px rgba(0, 173, 181, 0.45)'
              }}
            >
              {t.reportProblem}
            </Button>
          </Link>

          <Link to="/citizen/issues">
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<Compass size={20} />}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(8px)'
              }}
            >
              {t.exploreProblems}
            </Button>
          </Link>
        </div>
      </div>

      {/* Abstract Civic Motif Background Art */}
      <div
        style={{
          position: 'absolute',
          right: '5%',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '320px',
          height: '240px',
          pointerEvents: 'none',
          opacity: 0.85,
          display: 'none'
        }}
        className="hero-motif"
      >
        <svg viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          <circle cx="160" cy="120" r="80" stroke="#00adb5" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
          <circle cx="160" cy="120" r="110" stroke="#26c6da" strokeWidth="1" strokeDasharray="6 6" opacity="0.2" />
          {/* Connected Civic Nodes */}
          <path d="M70 160L160 120L250 80M160 120L190 190M160 120L110 60" stroke="#00fff0" strokeWidth="2" opacity="0.6" />
          <circle cx="70" cy="160" r="8" fill="#00adb5" />
          <circle cx="250" cy="80" r="10" fill="#26c6da" />
          <circle cx="160" cy="120" r="14" fill="#00fff0" />
          <circle cx="190" cy="190" r="7" fill="#00adb5" />
          <circle cx="110" cy="60" r="8" fill="#00adb5" />
        </svg>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .hero-motif { display: block !important; }
        }
      `}</style>
    </div>
  );
};
