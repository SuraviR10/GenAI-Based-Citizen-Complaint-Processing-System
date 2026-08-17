import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Compass, FileText, ThumbsUp, ArrowRight } from 'lucide-react';
import { Card } from '../common/Card';
import { useLanguage } from '../../context/LanguageContext';

export const QuickActionGrid: React.FC = () => {
  const { t } = useLanguage();

  const actions = [
    {
      to: '/citizen/report',
      title: t.reportProblem,
      description: t.step1Subtitle,
      icon: <PlusCircle size={24} color="#00adb5" />,
      color: 'var(--color-accent-500)'
    },
    {
      to: '/citizen/issues',
      title: t.exploreProblems,
      description: t.heroSubtitle,
      icon: <Compass size={24} color="#3b82f6" />,
      color: '#3b82f6'
    },
    {
      to: '/citizen/complaints',
      title: t.myReports,
      description: t.myComplaintsSubtitle,
      icon: <FileText size={24} color="#f59e0b" />,
      color: '#f59e0b'
    },
    {
      to: '/citizen/supported',
      title: t.supportedIssues,
      description: t.supportedIssuesSubtitle,
      icon: <ThumbsUp size={24} color="#10b981" />,
      color: '#10b981'
    }
  ];

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary-800)', marginBottom: '1rem' }}>
        {t.quickCivicActions}
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}
      >
        {actions.map((act) => (
          <Link key={act.to} to={act.to} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card
              isHoverable
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.25rem'
              }}
            >
              <div>
                <div
                  className="icon-container-3d"
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem'
                  }}
                >
                  {act.icon}
                </div>
                <h4 style={{ fontSize: '0.975rem', fontWeight: 700, color: 'var(--color-primary-800)', marginBottom: '6px' }}>
                  {act.title}
                </h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  {act.description}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--color-accent-600)',
                  marginTop: '1rem'
                }}
              >
                <span>{t.openAction}</span>
                <ArrowRight size={14} />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
