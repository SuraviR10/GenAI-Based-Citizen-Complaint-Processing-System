import React, { useState } from 'react';
import { Building2, Sparkles, FileText, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../common/Card';

export interface CorporationResponseCardProps {
  officialResponse: string;
  simplifiedResponse?: string | null;
  createdAt?: string;
}

export const CorporationResponseCard: React.FC<CorporationResponseCardProps> = ({
  officialResponse,
  simplifiedResponse,
  createdAt
}) => {
  const [showOriginal, setShowOriginal] = useState(false);

  if (!officialResponse) return null;

  return (
    <Card
      style={{
        backgroundColor: '#f8fafc',
        border: '1.5px solid var(--color-border)',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary-800)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Building2 size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-primary-800)' }}>
              Official Municipal Corporation Statement
            </h4>
            {createdAt && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Issued on {new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {simplifiedResponse && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--color-accent-600)',
              backgroundColor: 'var(--color-accent-100)',
              padding: '3px 8px',
              borderRadius: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Sparkles size={12} />
            AI-Simplified Available
          </span>
        )}
      </div>

      {/* Main Simplified View if available */}
      {simplifiedResponse ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent-600)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
              <Sparkles size={13} /> Easy-to-understand explanation
            </span>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)', lineHeight: 1.55 }}>
              {simplifiedResponse}
            </p>
          </div>

          {/* Toggle for original notice */}
          <button
            type="button"
            onClick={() => setShowOriginal(!showOriginal)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              alignSelf: 'flex-start'
            }}
          >
            <FileText size={14} />
            <span>{showOriginal ? 'Hide original official text' : 'View original formal response'}</span>
            {showOriginal ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showOriginal && (
            <div
              style={{
                backgroundColor: 'var(--color-bg-subtle)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5,
                border: '1px dashed var(--color-border)'
              }}
            >
              <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--color-primary-800)' }}>
                Original Corporation Notice:
              </strong>
              {officialResponse}
            </div>
          )}
        </div>
      ) : (
        <p style={{ fontSize: '0.925rem', color: 'var(--color-text-primary)', lineHeight: 1.55 }}>
          {officialResponse}
        </p>
      )}
    </Card>
  );
};
