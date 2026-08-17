import React, { useState, useEffect } from 'react';
import { User, Mail, Save, Database, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LanguageCode } from '../../lib/i18n';
import { isSupabaseConfigured } from '../../lib/supabase';
import { ConnectionStatusModal } from '../../components/common/ConnectionStatusModal';

import { MYSORE_AREAS } from '../../lib/types';

const COMMON_AREAS = MYSORE_AREAS.map((a) => ({ value: a, label: `${a}, Mysuru` }));

export const ProfilePage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const { setLanguage, t } = useLanguage();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [preferredLang, setPreferredLang] = useState(profile?.preferred_language || 'English');
  const [area, setArea] = useState(profile?.area || 'Gokulam');
  const [isSaving, setIsSaving] = useState(false);
  const [connectionModalOpen, setConnectionModalOpen] = useState(false);

  const isLiveDb = isSupabaseConfigured();

  const LANGUAGE_OPTIONS = [
    { value: 'English', label: t.langEnglish },
    { value: 'Kannada', label: t.langKannada },
    { value: 'Hindi', label: t.langHindi }
  ];

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPreferredLang(profile.preferred_language || 'English');
      setArea(profile.area || 'Gokulam');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        preferred_language: preferredLang,
        area: area
      });
      setLanguage(preferredLang as LanguageCode);
      success(t.profileTitle, t.saveChangesButton);
    } catch (err: any) {
      error('Update Failed', err.message || 'Could not update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container container-narrow" style={{ paddingTop: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={24} color="var(--color-accent-600)" />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary-800)' }}>
            {t.profileTitle}
          </h1>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          {t.profileSubtitle}
        </p>
      </div>

      <Card style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Email (Readonly) */}
          <Input
            label={t.emailLabel}
            value={profile?.email || user?.email || ''}
            disabled
            leftIcon={<Mail size={18} />}
          />

          {/* Full Name */}
          <Input
            label={t.fullNameLabel}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            isRequired
            leftIcon={<User size={18} />}
          />

          {/* Registered Area */}
          <Select
            label={t.step2AreaLabel}
            options={COMMON_AREAS}
            value={area}
            onChange={(e) => setArea(e.target.value)}
            helperText={t.step2Subtitle}
          />

          {/* Preferred Language */}
          <Select
            label={t.preferredLanguageLabel}
            options={LANGUAGE_OPTIONS}
            value={preferredLang}
            onChange={(e) => setPreferredLang(e.target.value)}
            helperText={t.profileSubtitle}
          />

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
            <Button
              type="submit"
              variant="cyan"
              size="md"
              leftIcon={<Save size={18} />}
              isLoading={isSaving}
            >
              {t.saveChangesButton}
            </Button>
          </div>
        </form>
      </Card>

      {/* Database & Cloud Connection Card */}
      <Card style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: isLiveDb ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isLiveDb ? 'var(--color-success)' : '#d97706'
              }}
            >
              <Database size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                  {t.databaseStatus}
                </h4>
                <Badge variant={isLiveDb ? 'success' : 'warning'}>
                  {isLiveDb ? t.liveDatabase : t.previewMode}
                </Badge>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {isLiveDb 
                  ? 'All data is syncing live with your cloud Supabase PostgreSQL database.'
                  : 'Operating in local preview mode with instant local caching and heuristic triage.'}
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Zap size={15} />}
            onClick={() => setConnectionModalOpen(true)}
          >
            Connection Setup & Diagnostics
          </Button>
        </div>
      </Card>

      <ConnectionStatusModal
        isOpen={connectionModalOpen}
        onClose={() => setConnectionModalOpen(false)}
      />
    </div>
  );
};
