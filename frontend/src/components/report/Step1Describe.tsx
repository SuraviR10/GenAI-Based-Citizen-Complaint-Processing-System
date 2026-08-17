import React from 'react';
import { Globe, Sparkles, HelpCircle } from 'lucide-react';
import { Textarea } from '../common/Textarea';
import { useLanguage } from '../../context/LanguageContext';

export interface Step1DescribeProps {
  description: string;
  onChangeDescription: (value: string) => void;
  language: string;
  onChangeLanguage: (lang: string) => void;
  error?: string;
}

export const Step1Describe: React.FC<Step1DescribeProps> = ({
  description,
  onChangeDescription,
  language,
  onChangeLanguage,
  error
}) => {
  const { t } = useLanguage();

  const languageOptions = [
    { label: 'English', value: 'English' },
    { label: 'ಕನ್ನಡ (Kannada)', value: 'Kannada' },
    { label: 'हिन्दी (Hindi)', value: 'Hindi' },
    { label: 'Other', value: 'Other' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title & Subtitle */}
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary-800)', marginBottom: '4px' }}>
          {t.step1Title}
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          {t.step1Subtitle}
        </p>
      </div>

      {/* Language Selector Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          padding: '10px 14px',
          backgroundColor: 'var(--color-bg-subtle)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)'
        }}
      >
        <Globe size={18} color="var(--color-accent-600)" />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-800)' }}>
          {t.step1WritingIn}
        </span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {languageOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChangeLanguage(opt.value)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                border: language === opt.value ? '1.5px solid var(--color-accent-500)' : '1px solid var(--color-border)',
                backgroundColor: language === opt.value ? 'var(--color-accent-100)' : 'var(--color-bg-card)',
                color: language === opt.value ? 'var(--color-accent-600)' : 'var(--color-text-secondary)',
                fontSize: '0.8rem',
                fontWeight: language === opt.value ? 700 : 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Textarea */}
      <Textarea
        label={t.step1Title}
        placeholder={t.step1Placeholder}
        value={description}
        onChange={(e) => onChangeDescription(e.target.value)}
        error={error}
        isRequired
        style={{ minHeight: '160px', fontSize: '1rem' }}
        maxCharacters={1000}
        helperText={t.step1Subtitle}
      />

      {/* AI Triage Note / Tips */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          padding: '12px 14px',
          backgroundColor: '#f0fdfa',
          border: '1px solid #ccfbf1',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.825rem',
          color: '#0f766e'
        }}
      >
        <Sparkles size={18} color="#0d9488" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>{t.step1TipsTitle}</strong>
          <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
            <li>{t.step1Tip1}</li>
            <li>{t.step1Tip2}</li>
            <li>{t.step1Tip3}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
