import React, { useState } from 'react';
import { 
  X, 
  HardHat, 
  Camera, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Wrench,
  Truck,
  Layers,
  Sparkles
} from 'lucide-react';
import { WorkerTask } from '../../lib/types';
import { api } from '../../lib/api';
import { Button } from '../common/Button';

export interface ProgressUpdateModalProps {
  isOpen: boolean;
  task: WorkerTask | null;
  mode: 'inspection' | 'progress' | 'complete';
  workerId: string;
  onClose: () => void;
  onUpdateSubmitted: (result: any) => void;
}

export const ProgressUpdateModal: React.FC<ProgressUpdateModalProps> = ({
  isOpen,
  task,
  mode,
  workerId,
  onClose,
  onUpdateSubmitted
}) => {
  const [description, setDescription] = useState<string>('');
  const [updateType, setUpdateType] = useState<string>(
    mode === 'inspection' ? 'site_inspected' : mode === 'complete' ? 'work_complete' : 'repair_in_progress'
  );
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !task) return null;

  const titleText = 
    mode === 'inspection' ? 'Record Site Inspection' :
    mode === 'complete' ? 'Submit Work Completion' : 'Log Field Progress';

  const samplePhotoUrls = [
    'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80'
  ];

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Please provide notes or a description of work performed.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let res;
      if (mode === 'inspection') {
        res = await api.startInspection(task.id, {
          worker_id: workerId,
          notes: description,
          evidence_url: photoUrl || undefined
        });
      } else if (mode === 'complete') {
        res = await api.markTaskComplete(task.id, {
          worker_id: workerId,
          completion_notes: description,
          evidence_url: photoUrl || undefined
        });
      } else {
        res = await api.submitProgressUpdate(task.id, {
          worker_id: workerId,
          description: description,
          update_type: updateType,
          evidence_url: photoUrl || undefined
        });
      }

      onUpdateSubmitted(res);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please try again.');
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
          maxWidth: '540px',
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
            backgroundColor: '#0f172a',
            color: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(234, 179, 8, 0.2)',
                border: '1px solid #eab308',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#eab308'
              }}
            >
              <HardHat size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                {titleText}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                {task.title}
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

          {/* Quick Milestone Selection for Progress Mode */}
          {mode === 'progress' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Select Milestone:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { id: 'repair_start', label: 'Crew On-Site / Barricading', icon: <Wrench size={14} /> },
                  { id: 'materials_arrived', label: 'Materials / Asphalt Arrived', icon: <Truck size={14} /> },
                  { id: 'sub_base_leveling', label: 'Sub-base / Surface Leveling', icon: <Layers size={14} /> },
                  { id: 'final_curing', label: 'Compaction & Curing', icon: <CheckCircle2 size={14} /> }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setUpdateType(m.id);
                      if (!description) setDescription(`${m.label} underway.`);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: updateType === m.id ? '2px solid #eab308' : '1px solid #cbd5e1',
                      backgroundColor: updateType === m.id ? '#fefce8' : '#ffffff',
                      color: '#0f172a',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      textAlign: 'left'
                    }}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes textarea */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              {mode === 'inspection' ? 'Inspection Observations & Scope:' :
               mode === 'complete' ? 'Completion & Quality Certification Notes:' : 'Field Work Details:'}
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                mode === 'inspection'
                  ? 'e.g. Inspected road damage. 3 craters measuring 1.2m diameter. Barricades set up. Ready for asphalt application.'
                  : mode === 'complete'
                  ? 'e.g. All potholes filled with hot-mix asphalt, leveled with 10-ton roller, road swept clean and reopened to traffic.'
                  : 'e.g. Surface cleared, bituminous tack coat applied, compaction in progress...'
              }
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

          {/* Photo Attachment */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Attach Field Photo Evidence:
            </label>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="Paste photo URL or pick sample below"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                marginBottom: '8px'
              }}
            />

            {/* Sample Photo Pickers for Demo */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Sample Photos:</span>
              {samplePhotoUrls.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPhotoUrl(url)}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#f1f5f9',
                    border: photoUrl === url ? '1px solid #eab308' : '1px solid #cbd5e1',
                    fontSize: '0.72rem',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  📷 Photo #{idx + 1}
                </button>
              ))}
            </div>

            {photoUrl && (
              <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', height: '120px', border: '1px solid #e2e8f0' }}>
                <img src={photoUrl} alt="Evidence preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
            onClick={handleSubmit}
          >
            Submit Field Update
          </Button>
        </div>
      </div>
    </div>
  );
};
