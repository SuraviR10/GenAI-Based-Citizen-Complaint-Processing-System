import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Activity,
  Compass,
  PlusCircle
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg-main)' }}>
      {/* Top Simple Navigation */}
      <header
        style={{
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-glass)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}
      >
        <div
          className="container"
          style={{
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-primary-800)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(11, 25, 44, 0.2)'
              }}
            >
              <Building2 size={22} color="#00adb5" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-800)', letterSpacing: '-0.02em' }}>
              CivicConnect <span style={{ color: 'var(--color-accent-600)' }}>AI</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user ? (
              <Link to="/citizen">
                <Button variant="cyan" rightIcon={<ArrowRight size={16} />}>
                  {t.enterCitizenPortal}
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">{t.signIn}</Button>
                </Link>
                <Link to="/register">
                  <Button variant="cyan">{t.registerCitizen}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with 3D Depth Visuals */}
      <section style={{ padding: '4.5rem 0 3.5rem 0', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '820px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-accent-100)',
              color: 'var(--color-accent-600)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              border: '1px solid rgba(0, 173, 181, 0.3)'
            }}
          >
            <Sparkles size={16} />
            <span>CivicConnect AI</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              fontWeight: 900,
              color: 'var(--color-primary-800)',
              lineHeight: 1.15,
              marginBottom: '1.5rem',
              letterSpacing: '-0.03em'
            }}
          >
            {t.heroTitle}
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              marginBottom: '2.5rem'
            }}
          >
            {t.heroSubtitle}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/citizen/report">
              <Button variant="cyan" size="lg" leftIcon={<PlusCircle size={20} />}>
                {t.reportProblem}
              </Button>
            </Link>
            <Link to="/citizen/issues">
              <Button variant="secondary" size="lg" leftIcon={<Compass size={20} />}>
                {t.exploreProblems}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Workflow Pillars */}
      <section style={{ padding: '3rem 0 5rem 0' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}
          >
            <Card style={{ padding: '2rem' }} isHoverable>
              <div className="icon-container-3d-cyan" style={{ width: '52px', height: '52px', borderRadius: '12px', marginBottom: '1.25rem' }}>
                <Sparkles size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary-800)', marginBottom: '8px' }}>
                {t.feature1Title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {t.feature1Desc}
              </p>
            </Card>

            <Card style={{ padding: '2rem' }} isHoverable>
              <div className="icon-container-3d-cyan" style={{ width: '52px', height: '52px', borderRadius: '12px', marginBottom: '1.25rem' }}>
                <Layers size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary-800)', marginBottom: '8px' }}>
                {t.feature2Title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {t.feature2Desc}
              </p>
            </Card>

            <Card style={{ padding: '2rem' }} isHoverable>
              <div className="icon-container-3d-cyan" style={{ width: '52px', height: '52px', borderRadius: '12px', marginBottom: '1.25rem' }}>
                <Activity size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary-800)', marginBottom: '8px' }}>
                {t.feature3Title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                {t.feature3Desc}
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};
