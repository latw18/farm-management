import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'danger' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (title: string, message?: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, message?: string, type: ToastType = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastMessage = { id, title, message, type };
    
    setToasts(prev => [...prev.slice(-3), newToast]); // Keep max 4 toasts

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
          maxWidth: '380px'
        }}
      >
        {toasts.map(toast => {
          let bg = '#ffffff';
          let border = 'var(--border-subtle)';
          let iconColor = 'var(--primary-600)';
          let Icon = CheckCircle2;

          if (toast.type === 'warning') {
            bg = '#fffbeb';
            border = '#fde68a';
            iconColor = '#d97706';
            Icon = AlertTriangle;
          } else if (toast.type === 'danger') {
            bg = '#fef2f2';
            border = '#fecaca';
            iconColor = '#dc2626';
            Icon = AlertCircle;
          } else if (toast.type === 'info') {
            bg = '#eff6ff';
            border = '#bfdbfe';
            iconColor = '#2563eb';
            Icon = Info;
          } else {
            bg = '#f0fdf4';
            border = '#bbf7d0';
            iconColor = '#16a34a';
            Icon = CheckCircle2;
          }

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                backgroundColor: bg,
                border: `1px solid ${border}`,
                borderRadius: '8px',
                padding: '12px 14px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                animation: 'slideInRight 0.25s ease-out'
              }}
            >
              <div style={{ color: iconColor, marginTop: '2px', flexShrink: 0 }}>
                <Icon size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                  {toast.title}
                </div>
                {toast.message && (
                  <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                    {toast.message}
                  </div>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-subtle)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px'
                }}
                aria-label="Đóng thông báo"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
