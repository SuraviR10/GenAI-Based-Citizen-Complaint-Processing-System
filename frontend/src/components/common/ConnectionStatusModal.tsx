import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Server, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  Info, 
  X,
  Zap,
  Layers
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { api } from '../../lib/api';
import { isSupabaseConfigured, getSupabaseConfigState } from '../../lib/supabase';
import { SystemHealthInfo } from '../../lib/types';
import { useToast } from '../../context/ToastContext';

interface ConnectionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectionStatusModal: React.FC<ConnectionStatusModalProps> = ({ isOpen, onClose }) => {
  const { info, success } = useToast();
  const [loading, setLoading] = useState(false);
  const [healthData, setHealthData] = useState<SystemHealthInfo | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'setup'>('status');

  const supabaseState = getSupabaseConfigState();

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const data = await api.checkHealth();
      setHealthData(data);
    } catch (e: any) {
      setHealthData({
        status: 'unreachable',
        supabase: 'offline',
        groq: 'offline'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    success('Copied to clipboard', 'Settings snippet copied.');
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const isSupabaseLive = healthData?.supabase === 'connected' || (isSupabaseConfigured() && healthData?.status === 'healthy');
  const isGroqLive = healthData?.groq === 'configured';

  const backendEnvExample = `# backend/.env
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

# Paste your Supabase Project details:
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret_key

# Optional Groq AI Key:
GROQ_API_KEY=gsk_your_groq_api_key_here
`;

  const frontendEnvExample = `# frontend/.env
VITE_API_BASE_URL=http://localhost:8000

# Paste your Supabase Publishable / Anon credentials:
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="System & Database Connectivity"
      maxWidth="680px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
          <button
            onClick={() => setActiveTab('status')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'status' ? 'var(--color-primary-800)' : 'transparent',
              color: activeTab === 'status' ? '#fff' : 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Zap size={15} /> Live Diagnostics
          </button>

          <button
            onClick={() => setActiveTab('setup')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'setup' ? 'var(--color-primary-800)' : 'transparent',
              color: activeTab === 'setup' ? '#fff' : 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Database size={15} /> Supabase Setup Guide
          </button>
        </div>

        {activeTab === 'status' ? (
          <>
            {/* Status Summary Banner */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: isSupabaseLive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                border: `1px solid ${isSupabaseLive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: isSupabaseLive ? 'var(--color-success-500)' : 'var(--color-warning-500)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}
                >
                  {isSupabaseLive ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                    {isSupabaseLive ? 'Supabase Database Connected' : 'Local Preview & Demo Mode Active'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    {isSupabaseLive 
                      ? 'Live cloud PostgreSQL synchronization and real-time updates enabled.' 
                      : 'App is 100% functional with local in-memory storage & heuristic triage.'}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchHealth}
                isLoading={loading}
                leftIcon={<RefreshCw size={14} className={loading ? 'spinning' : ''} />}
              >
                Re-check
              </Button>
            </div>

            {/* Service Health Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              {/* Backend API */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Server size={14} /> FastAPI Backend
                  </span>
                  <Badge variant={healthData?.status === 'healthy' ? 'success' : 'danger'}>
                    {healthData?.status === 'healthy' ? 'ONLINE (8000)' : 'OFFLINE'}
                  </Badge>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  REST API & Routers
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  http://127.0.0.1:8000
                </span>
              </div>

              {/* Supabase Database */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Database size={14} /> PostgreSQL
                  </span>
                  <Badge variant={isSupabaseLive ? 'success' : 'warning'}>
                    {isSupabaseLive ? 'CONNECTED' : 'LOCAL PREVIEW'}
                  </Badge>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  Supabase Client
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  {isSupabaseLive ? 'Cloud PostgreSQL' : 'Local Fallback Store'}
                </span>
              </div>

              {/* Groq AI Engine */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Cpu size={14} /> AI Triage Engine
                  </span>
                  <Badge variant={isGroqLive ? 'cyan' : 'neutral'}>
                    {isGroqLive ? 'GROQ LLM' : 'HEURISTIC AI'}
                  </Badge>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  Multilingual AI Triage
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  {isGroqLive ? 'llama-3.3-70b-versatile' : 'Smart Rule-based Fallback'}
                </span>
              </div>
            </div>

            {/* Helpful explanation box */}
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-50)',
                border: '1px solid rgba(0, 173, 181, 0.2)',
                fontSize: '0.8rem',
                color: 'var(--color-primary-800)',
                lineHeight: 1.5,
                display: 'flex',
                gap: '8px'
              }}
            >
              <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>How it works:</strong> The CivicConnect platform is engineered with resilient dual-mode architecture. You can test and demonstrate all features (reporting, severity triage, similarity deduplication, support upvoting, notifications) locally right now. When you enter your Supabase credentials, the app automatically switches to live database sync.
              </div>
            </div>
          </>
        ) : (
          /* Setup Guide Tab */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Follow these 3 quick steps to connect your cloud Supabase database:
            </div>

            {/* Step 1 */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-accent-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                1
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Create a Supabase Project</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Open{' '}
                  <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent-600)', textDecoration: 'underline' }}>
                    supabase.com/dashboard
                  </a>{' '}
                  and create a new project.
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-accent-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                2
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Execute Schema in Supabase SQL Editor</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  Go to <strong>SQL Editor</strong> in Supabase, copy the contents of <code>database/schema.sql</code>, paste it into the editor, and click <strong>Run</strong>. (Optionally run <code>database/seed.sql</code>).
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-accent-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                3
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Add Credentials to .env files</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  From Supabase <strong>Project Settings &gt; API</strong>, copy Project URL, anon key, and service_role secret into your <code>backend/.env</code> and <code>frontend/.env</code>.
                </div>
              </div>
            </div>

            {/* Copyable backend .env snippet */}
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>BACKEND .ENV TEMPLATE</span>
                <button
                  onClick={() => copyToClipboard(backendEnvExample, 'backend')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-accent-600)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copiedSection === 'backend' ? <Check size={12} /> : <Copy size={12} />}
                  {copiedSection === 'backend' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre
                style={{
                  backgroundColor: '#0b192c',
                  color: '#e0e7ff',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  overflowX: 'auto',
                  fontFamily: 'monospace'
                }}
              >
                {backendEnvExample}
              </pre>
            </div>

            {/* Copyable frontend .env snippet */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>FRONTEND .ENV TEMPLATE</span>
                <button
                  onClick={() => copyToClipboard(frontendEnvExample, 'frontend')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-accent-600)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copiedSection === 'frontend' ? <Check size={12} /> : <Copy size={12} />}
                  {copiedSection === 'frontend' ? 'Copy' : 'Copy'}
                </button>
              </div>
              <pre
                style={{
                  backgroundColor: '#0b192c',
                  color: '#e0e7ff',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  overflowX: 'auto',
                  fontFamily: 'monospace'
                }}
              >
                {frontendEnvExample}
              </pre>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
