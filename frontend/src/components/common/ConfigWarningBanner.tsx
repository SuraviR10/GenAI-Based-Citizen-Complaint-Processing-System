import React, { useState } from 'react';
import { ShieldCheck, Info, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

export const ConfigWarningBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const supabaseReady = isSupabaseConfigured();

  if (supabaseReady) return null;

  const copyEnvSnippet = () => {
    const snippet = `VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key\nVITE_API_BASE_URL=http://localhost:8000`;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      style={{
        backgroundColor: '#fffbeb',
        borderBottom: '1px solid #fde68a',
        padding: '10px 1.25rem',
        fontSize: '0.85rem',
        color: '#92400e',
        position: 'relative',
        zIndex: 50
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={18} color="#d97706" style={{ flexShrink: 0 }} />
          <span>
            <strong>Production Architecture Mode:</strong> Real database queries and FastAPI routes are active. To connect your live Supabase database and Groq AI key, provide environment variables in <code>.env</code>.
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'none',
            border: 'none',
            color: '#b45309',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.825rem'
          }}
        >
          {isExpanded ? 'Hide Setup Guide' : 'View Setup Guide'}
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isExpanded && (
        <div
          className="container"
          style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px dashed #fde68a',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem'
          }}
        >
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#78350f', marginBottom: '4px' }}>
              1. Supabase Database & Auth
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#92400e', lineHeight: 1.4 }}>
              Execute <code>database/schema.sql</code> in the Supabase SQL editor. It automatically configures tables, RLS security policies, triggers, and the <code>evidence-files</code> bucket.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#78350f', marginBottom: '4px' }}>
              2. Frontend Environment (.env)
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <code style={{ background: '#fef3c7', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
              </code>
              <button
                onClick={copyEnvSnippet}
                style={{
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  color: '#78350f'
                }}
              >
                {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#78350f', marginBottom: '4px' }}>
              3. FastAPI & Groq Backend (.env)
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#92400e', lineHeight: 1.4 }}>
              In <code>backend/.env</code>, set <code>GROQ_API_KEY</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code>, then run <code>uvicorn app.main:app --reload</code>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
