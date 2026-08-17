import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  User, 
  MapPin, 
  Lock, 
  LogIn, 
  AlertCircle, 
  Database,
  Briefcase,
  HardHat,
  Shield,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { isSupabaseConfigured } from '../lib/supabase';
import { ConnectionStatusModal } from '../components/common/ConnectionStatusModal';
import { MYSORE_AREAS, CIVIC_DEPARTMENTS, UserRole } from '../lib/types';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('citizen');
  const [name, setName] = useState('');
  const [area, setArea] = useState<string>(MYSORE_AREAS[0]);
  const [department, setDepartment] = useState<string>(CIVIC_DEPARTMENTS[0]);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionModalOpen, setConnectionModalOpen] = useState(false);

  const isLiveDb = isSupabaseConfigured();

  // Quick Preset Helper for Fast Access
  const handleSelectRolePreset = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'citizen') {
      setName('Suresh Gowda');
      setArea('Gokulam');
      setPassword('Citizen123!');
    } else if (selectedRole === 'corporation') {
      setName('Dr. K. Srinivas');
      setArea('Vijayanagar');
      setDepartment('Municipal Administration');
      setPassword('Officer123!');
    } else if (selectedRole === 'worker') {
      setName('Ramesh Rao');
      setArea('Kuvempunagar');
      setDepartment('Road Maintenance & Pavements');
      setPassword('Worker123!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password) {
      setErrorMessage('Please enter your full name and password.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await login({
        name: name.trim(),
        area,
        password,
        role,
        department: role !== 'citizen' ? department : undefined
      });

      if (res.error) {
        setErrorMessage(res.error);
        error('Sign In Failed', res.error);
      } else {
        success(
          'Welcome to Mysore CivicConnect!',
          `Signed in as ${name.trim()} (${role.toUpperCase()}) - ${area}, Mysore`
        );
        if (role === 'corporation') {
          navigate('/corporation');
        } else if (role === 'worker') {
          navigate('/worker');
        } else {
          navigate('/citizen');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login error occurred.');
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
        padding: '2rem 1.5rem',
        backgroundColor: 'var(--color-bg-main)'
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-primary-800)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(11, 25, 44, 0.25)',
                border: '1px solid rgba(0, 173, 181, 0.3)'
              }}
            >
              <Building2 size={26} color="#00adb5" />
            </div>
            <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--color-primary-800)' }}>
              CivicConnect <span style={{ color: 'var(--color-accent-600)' }}>AI</span>
            </span>
          </Link>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00adb5', marginTop: '6px', letterSpacing: '0.04em' }}>
            MYSURU MUNICIPAL CORPORATION (MCC)
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Sign in with your Name, Mysore Locality, and Password
          </p>
        </div>

        {/* Database Status Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => setConnectionModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              border: isLiveDb ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
              backgroundColor: isLiveDb ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              color: isLiveDb ? '#047857' : '#b45309',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isLiveDb ? '#10b981' : '#f59e0b'
              }}
            />
            <Database size={12} />
            <span>{isLiveDb ? 'Live Supabase DB' : 'Mysore Local Mode'}</span>
          </button>
        </div>

        {/* Form Card */}
        <Card style={{ padding: '2rem' }}>
          {errorMessage && (
            <div
              style={{
                backgroundColor: 'var(--color-critical-bg)',
                border: '1px solid var(--color-critical-border)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                color: '#991b1b',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '1.25rem'
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. SELECT USER ROLE */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary-800)', marginBottom: '8px' }}>
              Select Portal / Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleSelectRolePreset('citizen')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '10px 6px',
                  borderRadius: '10px',
                  border: role === 'citizen' ? '2px solid #00adb5' : '1px solid var(--color-border)',
                  backgroundColor: role === 'citizen' ? 'rgba(0, 173, 181, 0.1)' : '#ffffff',
                  color: role === 'citizen' ? '#00adb5' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  fontWeight: role === 'citizen' ? 800 : 600,
                  fontSize: '0.8rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <User size={20} />
                <span>Citizen</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRolePreset('corporation')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '10px 6px',
                  borderRadius: '10px',
                  border: role === 'corporation' ? '2px solid #0b192c' : '1px solid var(--color-border)',
                  backgroundColor: role === 'corporation' ? '#0b192c' : '#ffffff',
                  color: role === 'corporation' ? '#ffffff' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  fontWeight: role === 'corporation' ? 800 : 600,
                  fontSize: '0.8rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <Shield size={20} color={role === 'corporation' ? '#00adb5' : 'currentColor'} />
                <span>MCC Official</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRolePreset('worker')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '10px 6px',
                  borderRadius: '10px',
                  border: role === 'worker' ? '2px solid #eab308' : '1px solid var(--color-border)',
                  backgroundColor: role === 'worker' ? '#fefce8' : '#ffffff',
                  color: role === 'worker' ? '#854d0e' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  fontWeight: role === 'worker' ? 800 : 600,
                  fontSize: '0.8rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <HardHat size={20} color={role === 'worker' ? '#ca8a04' : 'currentColor'} />
                <span>Field Worker</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* Full Name */}
            <Input
              label="Your Full Name"
              placeholder="e.g. Suresh Gowda"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User size={18} />}
              isRequired
            />

            {/* Mysore Area Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                Area / Ward in Mysore <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#ffffff',
                    fontSize: '0.9rem',
                    color: 'var(--color-text-main)',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px'
                  }}
                >
                  {MYSORE_AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}, Mysuru
                    </option>
                  ))}
                </select>
                <MapPin
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            </div>

            {/* Department Selector (for Corporation and Worker) */}
            {role !== 'citizen' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  Municipal Department
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: '#ffffff',
                      fontSize: '0.9rem',
                      color: 'var(--color-text-main)',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '16px'
                    }}
                  >
                    {CIVIC_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <Briefcase
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-muted)',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={18} />}
              isRequired
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isFullWidth
              isLoading={isLoading}
              leftIcon={<LogIn size={18} />}
              style={{ marginTop: '0.5rem' }}
            >
              Sign In to {role === 'corporation' ? 'MCC Official Portal' : role === 'worker' ? 'Field Crew Portal' : 'Citizen Portal'}
            </Button>
          </form>

          {/* Quick switch helper */}
          <div
            style={{
              marginTop: '1.25rem',
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 173, 181, 0.06)',
              border: '1px dashed rgba(0, 173, 181, 0.3)',
              textAlign: 'center',
              fontSize: '0.78rem',
              color: 'var(--color-primary-800)'
            }}
          >
            Tip: Click <strong>Citizen</strong>, <strong>MCC Official</strong>, or <strong>Field Worker</strong> at the top to auto-fill sample Mysore accounts!
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--color-border)',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: 'var(--color-text-muted)'
            }}
          >
            <span>Don't have an account? </span>
            <Link
              to="/register"
              style={{
                color: 'var(--color-accent-600)',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              Register here
            </Link>
          </div>
        </Card>
      </div>

      <ConnectionStatusModal isOpen={connectionModalOpen} onClose={() => setConnectionModalOpen(false)} />
    </div>
  );
};
