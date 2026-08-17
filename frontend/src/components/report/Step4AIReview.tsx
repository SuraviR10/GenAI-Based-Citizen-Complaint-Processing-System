import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Edit3, 
  ShieldAlert, 
  XCircle,
  Loader2,
  ChevronRight,
  ArrowLeft,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { ComplaintAnalysisResult, SimilarIssueMatch } from '../../lib/types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { getCategoryLabel } from '../../lib/i18n';

export interface Step4AIReviewProps {
  isAnalyzing: boolean;
  analysis: ComplaintAnalysisResult | null;
  onUpdateAnalysis: (updated: ComplaintAnalysisResult) => void;
  onOpenSimilarModal: () => void;
  similarCount: number;
  onEditDescription?: () => void;
}

export const Step4AIReview: React.FC<Step4AIReviewProps> = ({
  isAnalyzing,
  analysis,
  onUpdateAnalysis,
  onOpenSimilarModal,
  similarCount,
  onEditDescription
}) => {
  const { language, t } = useLanguage();
  const [animStep, setAnimStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  const CIVIC_CATEGORIES = [
    { value: 'Roads & Footpaths', label: getCategoryLabel('Roads & Footpaths', language) },
    { value: 'Water & Sewage', label: getCategoryLabel('Water & Sewage', language) },
    { value: 'Street Lighting', label: getCategoryLabel('Street Lighting', language) },
    { value: 'Garbage & Sanitation', label: getCategoryLabel('Garbage & Sanitation', language) },
    { value: 'Public Safety & Hazards', label: getCategoryLabel('Public Safety & Hazards', language) },
    { value: 'Parks & Environment', label: getCategoryLabel('Parks & Environment', language) },
    { value: 'Other Civic Issue', label: getCategoryLabel('Other Civic Issue', language) }
  ];

  useEffect(() => {
    if (isAnalyzing) {
      const t1 = setTimeout(() => setAnimStep(2), 600);
      const t2 = setTimeout(() => setAnimStep(3), 1200);
      const t3 = setTimeout(() => setAnimStep(4), 1800);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setAnimStep(4);
    }
  }, [isAnalyzing]);

  if (isAnalyzing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div
          className="icon-container-3d-cyan pulse-glow"
          style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-full)', marginBottom: '1.5rem' }}
        >
          <Sparkles size={32} />
        </div>

        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary-800)', marginBottom: '1.5rem' }}>
          {t.step4AnalyzingTitle}
        </h3>

        {/* Animated Progress Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '400px', textAlign: 'left' }}>
          {[
            { id: 1, text: t.step4AnimReading },
            { id: 2, text: t.step4AnimCategory },
            { id: 3, text: t.step4AnimSafety },
            { id: 4, text: t.step4AnimScanning }
          ].map((item) => {
            const isDone = animStep > item.id;
            const isCurrent = animStep === item.id;

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isCurrent ? 'var(--color-accent-100)' : 'transparent',
                  color: isDone ? 'var(--color-success)' : isCurrent ? 'var(--color-accent-600)' : 'var(--color-text-muted)',
                  fontSize: '0.9rem',
                  fontWeight: isCurrent || isDone ? 600 : 400,
                  transition: 'all 0.3s ease'
                }}
              >
                {isDone ? (
                  <CheckCircle2 size={18} color="var(--color-success)" />
                ) : isCurrent ? (
                  <Loader2 size={18} className="animate-spin" color="var(--color-accent-600)" />
                ) : (
                  <div style={{ width: '18px', height: '18px', borderRadius: 'var(--radius-full)', border: '2px solid var(--color-border)' }} />
                )}
                <span>{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  // REJECTION STATE: Non-Civic / Out-of-Scope Complaint
  if (analysis.is_civic_issue === false) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Rejection Alert Banner */}
        <div
          style={{
            padding: '1.75rem',
            backgroundColor: '#fef2f2',
            border: '2px solid #f87171',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <XCircle size={28} color="#dc2626" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991b1b', marginBottom: '6px' }}>
                {t.rejectionTitle}
              </h3>
              <p style={{ fontSize: '0.925rem', color: '#b91c1c', lineHeight: 1.5 }}>
                {analysis.rejection_reason || t.rejectionSubtitle}
              </p>
            </div>
          </div>

          {/* Educational Guidance Box: What can be reported */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #fca5a5',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginTop: '4px'
            }}
          >
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#7f1d1d', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={16} color="#dc2626" />
              {t.rejectionWhatCanReport}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
              {[
                t.rejectionTopicRoads,
                t.rejectionTopicWater,
                t.rejectionTopicLights,
                t.rejectionTopicGarbage,
                t.rejectionTopicHazards
              ].map((topic, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: '#4b5563' }}>
                  <CheckCircle size={15} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action button to change description */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
            <Button
              type="button"
              variant="cyan"
              size="md"
              leftIcon={<ArrowLeft size={16} />}
              onClick={onEditDescription}
            >
              {t.rejectionEditButton}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // VALID CIVIC COMPLAINT REVIEW
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Sparkles size={20} color="var(--color-accent-600)" />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary-800)' }}>
            {t.step4Title}
          </h2>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          {t.step4Subtitle}
        </p>
      </div>

      {/* AI Transparency & Accuracy Notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          padding: '12px 14px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.825rem',
          color: '#1e40af'
        }}
      >
        <Info size={18} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>AI-Assisted Classification:</strong> {t.aiDisclaimer}
        </div>
      </div>

      {/* Similar Community Issues Alert Banner */}
      {similarCount > 0 && (
        <div
          style={{
            padding: '14px 16px',
            backgroundColor: 'var(--color-accent-100)',
            border: '1.5px solid var(--color-accent-400)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={22} color="var(--color-accent-600)" />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary-800)' }}>
                {similarCount} {t.similarFoundTitle}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {t.similarFoundDesc}
              </p>
            </div>
          </div>

          <Button variant="cyan" size="sm" rightIcon={<ChevronRight size={16} />} onClick={onOpenSimilarModal}>
            {t.viewSimilarButton}
          </Button>
        </div>
      )}

      {/* Structured AI Analysis Card */}
      <Card style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Badge type="ai" value={t.structuredExtractions} />
            <Badge type="priority" value={analysis.suggested_priority} size="sm" />
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-accent-600)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Edit3 size={15} />
            <span>{isEditing ? t.doneEditing : t.editDetails}</span>
          </button>
        </div>

        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label={t.identifiedProblem}
              value={analysis.problem_title}
              onChange={(e) => onUpdateAnalysis({ ...analysis, problem_title: e.target.value })}
            />

            <Select
              label={t.categoryLabel}
              options={CIVIC_CATEGORIES}
              value={analysis.category}
              onChange={(e) => onUpdateAnalysis({ ...analysis, category: e.target.value })}
            />

            <Input
              label={t.step2AreaLabel}
              value={analysis.area}
              onChange={(e) => onUpdateAnalysis({ ...analysis, area: e.target.value })}
            />

            <Input
              label={t.step2LandmarkLabel}
              value={analysis.landmark || ''}
              onChange={(e) => onUpdateAnalysis({ ...analysis, landmark: e.target.value })}
            />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                {t.categoryLabel}
              </span>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary-800)', marginTop: '2px' }}>
                {getCategoryLabel(analysis.category, language)}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                {t.identifiedProblem}
              </span>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary-800)', marginTop: '2px' }}>
                {analysis.problem_title}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                {t.areaLocality}
              </span>
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '2px' }}>
                {analysis.area} {analysis.landmark ? `(${analysis.landmark})` : ''}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                {t.safetyUrgency}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                {analysis.safety_concern ? (
                  <span style={{ color: 'var(--color-critical)', fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldAlert size={16} /> {t.hazardReported}
                  </span>
                ) : (
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                    {t.standardMaintenance}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
