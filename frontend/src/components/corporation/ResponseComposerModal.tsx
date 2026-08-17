import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Sparkles, 
  Eye, 
  Lock, 
  Globe, 
  Send, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { CivicIssue } from '../../lib/types';
import { api } from '../../lib/api';
import { Button } from '../common/Button';

export interface ResponseComposerModalProps {
  isOpen: boolean;
  issue: CivicIssue | null;
  onClose: () => void;
  onResponsePosted: (response: any) => void;
}

export const ResponseComposerModal: React.FC<ResponseComposerModalProps> = ({
  isOpen,
  issue,
  onClose,
  onResponsePosted
}) => {
  const [officialText, setOfficialText] = useState<string>('');
  const [visibility, setVisibility] = useState<'public' | 'internal'>('public');
  const [language, setLanguage] = useState<string>('English');
  const [aiPreview, setAiPreview] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !issue) return null;

  const handleGenerateAiPreview = async () => {
    if (!officialText.trim()) {
      setError('Please enter the official statement first before generating citizen preview.');
      return;
    }

    setIsGeneratingAi(true);
    setError(null);

    try {
      const res = await api.simplifyResponse({
        official_response: officialText,
        issue_title: issue.title,
        language: language
      });
      setAiPreview(res.simplified_summary);
    } catch (err: any) {
      setError(err.message || 'AI simplification preview generation failed.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handlePostResponse = async () => {
    if (!officialText.trim()) {
      setError('Please provide the official response text.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.postCorporationResponse(issue.id, {
        official_response: officialText,
        visibility: visibility,
        target_language: language
      });

      onResponsePosted(res);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to post official response.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '620px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0b192c',
            color: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(226, 112, 58, 0.2)',
                border: '1px solid #e2703a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ff8a50'
              }}
            >
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Post Municipal Response
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                Issue #{issue.id.slice(0, 8)} &bull; {issue.area}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Visibility Toggle */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              Response Visibility:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div
                onClick={() => setVisibility('public')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: visibility === 'public' ? '2px solid #00adb5' : '1px solid #e2e8f0',
                  backgroundColor: visibility === 'public' ? 'rgba(0, 173, 181, 0.06)' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Eye size={16} color={visibility === 'public' ? '#00adb5' : '#64748b'} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Public Notice</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Visible to citizens &amp; tracking page</div>
                </div>
              </div>

              <div
                onClick={() => setVisibility('internal')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: visibility === 'internal' ? '2px solid #e2703a' : '1px solid #e2e8f0',
                  backgroundColor: visibility === 'internal' ? 'rgba(226, 112, 58, 0.06)' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Lock size={16} color={visibility === 'internal' ? '#e2703a' : '#64748b'} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Internal Note</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Confidential to municipal staff</div>
                </div>
              </div>
            </div>
          </div>

          {/* Official Statement Text */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                Official Municipal Statement (Technical/Legal):
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['English', 'Kannada', 'Hindi'].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLanguage(l)}
                    style={{
                      padding: '2px 6px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: language === l ? '1px solid #00adb5' : '1px solid #cbd5e1',
                      backgroundColor: language === l ? '#00adb5' : '#ffffff',
                      color: language === l ? '#ffffff' : '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={4}
              value={officialText}
              onChange={(e) => setOfficialText(e.target.value)}
              placeholder="e.g. Pursuant to Section 58 of Municipal Corporation Code, work order #WO-2026-8941 has been issued to M/s Apex Infrastructure Ltd for bituminous resurfacing..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* GenAI Simplification Preview */}
          {visibility === 'public' && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={14} color="#00adb5" /> GenAI Citizen Simplification Preview
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Sparkles size={14} />}
                  isLoading={isGeneratingAi}
                  onClick={handleGenerateAiPreview}
                >
                  Generate Preview
                </Button>
              </div>

              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '0.82rem',
                  color: '#166534',
                  minHeight: '60px'
                }}
              >
                {aiPreview ? (
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '2px' }}>✨ Citizen Explanation:</div>
                    <p style={{ margin: 0, lineHeight: 1.4 }}>{aiPreview}</p>
                  </div>
                ) : (
                  <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                    Type your statement above and click "Generate Preview" or submit directly. The GenAI Simplification Engine will automatically generate a plain-language summary for citizens upon posting.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            backgroundColor: '#f8fafc'
          }}
        >
          <Button variant="outline" size="md" onClick={onClose} isDisabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Send size={16} />}
            isLoading={isSubmitting}
            onClick={handlePostResponse}
            isDisabled={!officialText.trim()}
          >
            Publish Response
          </Button>
        </div>
      </div>
    </div>
  );
};
