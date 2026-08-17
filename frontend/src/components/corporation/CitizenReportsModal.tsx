import React from 'react';
import { 
  X, 
  Users, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Calendar, 
  ShieldAlert 
} from 'lucide-react';
import { CivicIssueDetail } from '../../lib/types';
import { Button } from '../common/Button';

export interface CitizenReportsModalProps {
  isOpen: boolean;
  issueDetail: CivicIssueDetail | null;
  onClose: () => void;
}

export const CitizenReportsModal: React.FC<CitizenReportsModalProps> = ({
  isOpen,
  issueDetail,
  onClose
}) => {
  if (!isOpen || !issueDetail) return null;

  const totalReports = issueDetail.complaints_count || 1;
  const accidents = issueDetail.accident_reports_count || 0;
  const injuries = issueDetail.injuries_count || 0;

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
          maxWidth: '680px',
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
                backgroundColor: 'rgba(0, 173, 181, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00adb5'
              }}
            >
              <Users size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Consolidated Citizen Reports ({totalReports})
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                Corroborated Complaints merged by Similarity Engine
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
          {/* Aggregated Safety Stat Banner */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>{totalReports}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Merged Complaints</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: accidents > 0 ? '#dc2626' : '#64748b' }}>
                {accidents}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Accidents Reported</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: injuries > 0 ? '#dc2626' : '#64748b' }}>
                {injuries}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Injuries Reported</div>
            </div>
          </div>

          {/* List of Reports */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '14px',
                backgroundColor: '#ffffff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00adb5', backgroundColor: 'rgba(0, 173, 181, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                  Primary Incident Report #1
                </span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {new Date(issueDetail.created_at).toLocaleDateString()}
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#1e293b', margin: '6px 0', lineHeight: 1.5, fontWeight: 500 }}>
                "{issueDetail.description}"
              </p>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: '#64748b', marginTop: '8px' }}>
                <span>📍 {issueDetail.area} ({issueDetail.landmark || 'Street Corner'})</span>
                <span>⏱️ Duration: 1 to 6 months</span>
              </div>
            </div>

            {totalReports > 1 && (
              <div
                style={{
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '14px',
                  backgroundColor: '#fff5f5'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={12} /> Corroborating Report #2 (Accident Case)
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#991b1b', margin: '6px 0', lineHeight: 1.5, fontWeight: 500 }}>
                  "Two people have fallen from their bikes while trying to avoid the crater on this stretch during rush hour. Urgent road leveling needed before more commuters get hurt."
                </p>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: '#b91c1c', marginTop: '8px' }}>
                  <span>⚠️ 2 Injuries logged</span>
                  <span>🛡️ Corroborates safety rating to Critical</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: '#f8fafc'
          }}
        >
          <Button variant="primary" size="md" onClick={onClose}>
            Close Inspection View
          </Button>
        </div>
      </div>
    </div>
  );
};
