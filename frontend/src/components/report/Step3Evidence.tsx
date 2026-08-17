import React from 'react';
import { Camera, ShieldAlert, Clock, AlertTriangle, Info } from 'lucide-react';
import { FileUploader } from '../common/FileUploader';
import { Select } from '../common/Select';
import { Textarea } from '../common/Textarea';
import { useLanguage } from '../../context/LanguageContext';
import { getDurationLabel } from '../../lib/i18n';

export interface Step3EvidenceProps {
  userId: string;
  evidenceUrls: string[];
  onEvidenceChanged: (urls: string[]) => void;
  duration: string;
  onChangeDuration: (value: string) => void;
  accidentReported: boolean;
  onChangeAccidentReported: (value: boolean) => void;
  accidentDescription: string;
  onChangeAccidentDescription: (value: string) => void;
}

export const Step3Evidence: React.FC<Step3EvidenceProps> = ({
  userId,
  evidenceUrls,
  onEvidenceChanged,
  duration,
  onChangeDuration,
  accidentReported,
  onChangeAccidentReported,
  accidentDescription,
  onChangeAccidentDescription
}) => {
  const { language, t } = useLanguage();

  const durationOptions = [
    { value: 'not_sure', label: getDurationLabel('not_sure', language) },
    { value: 'less_than_month', label: getDurationLabel('less_than_month', language) },
    { value: '1_to_6_months', label: getDurationLabel('1_to_6_months', language) },
    { value: 'more_than_6_months', label: getDurationLabel('more_than_6_months', language) }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary-800)', marginBottom: '4px' }}>
          {t.step3Title}
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          {t.step3Subtitle}
        </p>
      </div>

      {/* 1. Upload Photos */}
      <div>
        <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary-800)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Camera size={18} color="var(--color-accent-600)" />
          <span>{t.step3UploadLabel}</span>
        </label>
        <FileUploader
          userId={userId}
          maxFiles={4}
          onFilesChanged={onEvidenceChanged}
        />
      </div>

      {/* 2. Duration Question */}
      <div>
        <Select
          label={t.step3DurationLabel}
          options={durationOptions}
          value={duration}
          onChange={(e) => onChangeDuration(e.target.value)}
          helperText={t.step3Subtitle}
        />
      </div>

      {/* 3. Safety & Accident Question */}
      <div
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          backgroundColor: accidentReported ? '#fef2f2' : 'var(--color-bg-card)',
          transition: 'all var(--transition-normal)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '1rem' }}>
          <ShieldAlert size={22} color={accidentReported ? 'var(--color-critical)' : 'var(--color-primary-800)'} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary-800)' }}>
              {t.accidentQuestion}
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {t.accidentDisclaimer}
            </p>
          </div>
        </div>

        {/* Radio Option Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => onChangeAccidentReported(true)}
            style={{
              flex: '1',
              minWidth: '100px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: accidentReported ? '2px solid var(--color-critical)' : '1px solid var(--color-border)',
              backgroundColor: accidentReported ? '#fee2e2' : 'var(--color-bg-card)',
              color: accidentReported ? '#991b1b' : 'var(--color-text-primary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            {t.step3AccidentYes}
          </button>

          <button
            type="button"
            onClick={() => {
              onChangeAccidentReported(false);
              onChangeAccidentDescription('');
            }}
            style={{
              flex: '1',
              minWidth: '100px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: !accidentReported ? '2px solid var(--color-accent-500)' : '1px solid var(--color-border)',
              backgroundColor: !accidentReported ? 'var(--color-accent-100)' : 'var(--color-bg-card)',
              color: !accidentReported ? 'var(--color-accent-600)' : 'var(--color-text-primary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            {t.step3AccidentNo}
          </button>
        </div>

        {/* If Yes, show accident description textarea */}
        {accidentReported && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #fecaca' }}>
            <Textarea
              label={t.step3AccidentDescLabel}
              placeholder={t.step3AccidentDescPlaceholder}
              value={accidentDescription}
              onChange={(e) => onChangeAccidentDescription(e.target.value)}
              isRequired
              style={{ minHeight: '80px' }}
            />
          </div>
        )}

        {/* Citizen-Reported Disclaimer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.775rem',
            color: 'var(--color-text-muted)',
            marginTop: '8px'
          }}
        >
          <Info size={14} />
          <span>{t.accidentDisclaimer}</span>
        </div>
      </div>
    </div>
  );
};
