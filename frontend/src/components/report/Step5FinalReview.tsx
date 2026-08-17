import React from 'react';
import { ShieldCheck, MapPin, Camera, Clock, AlertTriangle, Layers } from 'lucide-react';
import { ComplaintAnalysisResult } from '../../lib/types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { getCategoryLabel, getDurationLabel } from '../../lib/i18n';

export interface Step5FinalReviewProps {
  originalText: string;
  analysis: ComplaintAnalysisResult;
  area: string;
  landmark: string;
  duration: string;
  accidentReported: boolean;
  accidentDescription: string;
  evidenceUrls: string[];
}

export const Step5FinalReview: React.FC<Step5FinalReviewProps> = ({
  originalText,
  analysis,
  area,
  landmark,
  duration,
  accidentReported,
  accidentDescription,
  evidenceUrls
}) => {
  const { language, t } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary-800)', marginBottom: '4px' }}>
          {t.step5Title}
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          {t.step5Subtitle}
        </p>
      </div>

      {/* Deduplication & Consolidation Explanatory Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '14px 16px',
          backgroundColor: 'var(--color-info-bg)',
          border: '1px solid var(--color-info-border)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <Layers size={22} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e40af', marginBottom: '2px' }}>
            {t.step5WhatHappensNextTitle}
          </h4>
          <p style={{ fontSize: '0.825rem', color: '#1e3a8a', lineHeight: 1.45 }}>
            {t.step5Subtitle}
          </p>
        </div>
      </div>

      {/* Comprehensive Summary Card */}
      <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Title & Priority */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent-600)', textTransform: 'uppercase' }}>
              {getCategoryLabel(analysis.category, language)}
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary-800)', marginTop: '2px' }}>
              {analysis.problem_title}
            </h3>
          </div>
          <Badge type="priority" value={analysis.suggested_priority} />
        </div>

        {/* Original Description */}
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            {t.step5ReviewHeader}
          </span>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', lineHeight: 1.5, marginTop: '4px', backgroundColor: 'var(--color-bg-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-md)' }}>
            "{originalText}"
          </p>
        </div>

        {/* Location & Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <MapPin size={18} color="var(--color-accent-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{t.step5LocationDetails}</span>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary-800)' }}>
                {area} {landmark ? `(Near ${landmark})` : ''}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Clock size={18} color="var(--color-accent-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{t.step5Duration}</span>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary-800)' }}>
                {getDurationLabel(duration, language)}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <AlertTriangle size={18} color={accidentReported ? 'var(--color-critical)' : 'var(--color-text-muted)'} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{t.safetyUrgency}</span>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: accidentReported ? 'var(--color-critical)' : 'var(--color-primary-800)' }}>
                {accidentReported ? t.hazardReported : t.standardMaintenance}
              </p>
            </div>
          </div>
        </div>

        {/* Attached Photos */}
        {evidenceUrls && evidenceUrls.length > 0 && (
          <div style={{ paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
              <Camera size={14} /> {t.step5EvidenceFiles} ({evidenceUrls.length})
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {evidenceUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Evidence preview ${i + 1}`}
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                />
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
