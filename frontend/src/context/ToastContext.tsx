import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 4000) => {
      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => showToast('success', title, message), [showToast]);
  const warning = useCallback((title: string, message?: string) => showToast('warning', title, message), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast('error', title, message), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast('info', title, message), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, warning, error, info, removeToast }}>
      {children}
      {/* Floating Toast Container with 3D elevation */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '400px',
          width: 'calc(100% - 3rem)',
          pointerEvents: 'none'
        }}
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const typeStyles = {
            success: { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', icon: <CheckCircle size={20} color="#10b981" /> },
            warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', icon: <AlertTriangle size={20} color="#f59e0b" /> },
            error: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', icon: <AlertOctagon size={20} color="#ef4444" /> },
            info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', icon: <Info size={20} color="#3b82f6" /> }
          }[toast.type];

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                backgroundColor: typeStyles.bg,
                border: `1px solid ${typeStyles.border}`,
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 10px 25px -5px rgba(11, 25, 44, 0.15)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              role="alert"
            >
              <div style={{ flexShrink: 0, marginTop: '2px' }}>{typeStyles.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: typeStyles.text, marginBottom: toast.message ? '2px' : '0' }}>
                  {toast.title}
                </h4>
                {toast.message && (
                  <p style={{ fontSize: '0.825rem', color: typeStyles.text, opacity: 0.9, lineHeight: 1.4 }}>
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: typeStyles.text,
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: 0.7
                }}
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
