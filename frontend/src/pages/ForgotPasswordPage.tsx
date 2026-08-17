import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Send, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await resetPassword(email);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setIsSubmitted(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        backgroundColor: 'var(--color-bg-main)'
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-primary-800)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(11, 25, 44, 0.25)'
              }}
            >
              <Building2 size={24} color="#00adb5" />
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-primary-800)' }}>
              CivicConnect <span style={{ color: 'var(--color-accent-600)' }}>AI</span>
            </span>
          </Link>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-800)', marginTop: '1.25rem' }}>
            {t.resetPasswordTitle}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            {t.resetPasswordSubtitle}
          </p>
        </div>

        <Card style={{ padding: '2rem' }}>
          {isSubmitted ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <CheckCircle2 size={48} color="var(--color-success)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary-800)', marginBottom: '8px' }}>
                Check your inbox
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                We sent a password reset link to <strong>{email}</strong>.
              </p>
              <Link to="/login">
                <Button variant="secondary" size="md" isFullWidth>
                  {t.returnToSignIn}
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Input
                label={t.emailLabel}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail size={18} />}
                error={errorMsg || undefined}
                isRequired
              />

              <Button
                type="submit"
                variant="cyan"
                size="lg"
                leftIcon={<Send size={18} />}
                isLoading={isLoading}
                isFullWidth
              >
                {t.sendResetLinkButton}
              </Button>
            </form>
          )}
        </Card>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '1.5rem' }}>
          <Link to="/login" style={{ fontWeight: 700, color: 'var(--color-accent-600)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={16} /> {t.returnToSignIn}
          </Link>
        </p>
      </div>
    </div>
  );
};
