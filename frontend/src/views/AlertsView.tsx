import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Check
} from 'lucide-react';
import type { Alert } from '../types/farm';

interface AlertsViewProps {
  alerts: Alert[];
  onResolveAlert: (id: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onResolveAlert
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [showResolved, setShowResolved] = useState<boolean>(true);

  const filteredAlerts = alerts.filter(a => {
    const matchSev = filterSeverity === 'all' || a.severity === filterSeverity;
    const matchRes = showResolved ? true : !a.resolved;
    return matchSev && matchRes;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Standardized Page Toolbar */}
      <div className="page-toolbar">
        <div className="toolbar-group">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'critical', label: 'Nghiêm trọng' },
            { id: 'warning', label: 'Cảnh báo' },
            { id: 'info', label: 'Thông tin' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilterSeverity(btn.id)}
              style={{
                height: '34px',
                padding: '0 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                backgroundColor: filterSeverity === btn.id ? 'var(--primary-600)' : '#ffffff',
                color: filterSeverity === btn.id ? '#ffffff' : 'var(--text-muted)',
                borderColor: filterSeverity === btn.id ? 'var(--primary-600)' : 'var(--border-subtle)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-muted)', cursor: 'pointer', height: '36px' }}>
          <input 
            type="checkbox" 
            checked={showResolved} 
            onChange={e => setShowResolved(e.target.checked)}
            style={{ accentColor: 'var(--primary-600)' }}
          />
          <span>Hiện cả cảnh báo đã giải quyết</span>
        </label>
      </div>

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredAlerts.map(alert => {
          const isCritical = alert.severity === 'critical';
          const isWarning = alert.severity === 'warning';

          return (
            <div
              key={alert.id}
              className="clean-card"
              style={{
                padding: '16px 18px',
                borderLeft: `4px solid ${
                  alert.resolved ? 'var(--border-medium)' :
                  isCritical ? 'var(--danger)' :
                  isWarning ? 'var(--warning)' : 'var(--info)'
                }`,
                opacity: alert.resolved ? 0.6 : 1,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: alert.resolved ? 'var(--bg-subtle)' :
                    isCritical ? 'var(--danger-bg)' :
                    isWarning ? 'var(--warning-bg)' : 'var(--info-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: alert.resolved ? 'var(--text-subtle)' :
                    isCritical ? 'var(--danger-text)' :
                    isWarning ? 'var(--warning-text)' : 'var(--info-text)'
                }}>
                  {alert.resolved ? (
                    <Check size={18} />
                  ) : (
                    <AlertTriangle size={18} />
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${
                      alert.resolved ? 'badge-neutral' :
                      isCritical ? 'badge-danger' :
                      isWarning ? 'badge-warning' : 'badge-info'
                    }`}>
                      {alert.metric}
                    </span>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {alert.title}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                      {alert.timestamp}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {alert.message}
                  </p>

                  <div style={{
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    color: 'var(--text-main)',
                    marginTop: '2px'
                  }}>
                    <strong>Cách khắc phục:</strong> {alert.suggestedAction}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div style={{ flexShrink: 0 }}>
                {alert.resolved ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    ✓ Đã xong
                  </span>
                ) : (
                  <button
                    onClick={() => onResolveAlert(alert.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    <span>Đánh dấu đã xử lý</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="clean-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-subtle)' }}>
            <CheckCircle2 size={36} color="var(--primary-600)" style={{ margin: '0 auto 8px' }} />
            <h4 style={{ color: 'var(--text-main)', fontWeight: 600 }}>Không có cảnh báo</h4>
            <p style={{ fontSize: '0.8125rem', marginTop: '2px' }}>Tất cả các chỉ số đo đạc đang trong giới hạn cho phép.</p>
          </div>
        )}
      </div>
    </div>
  );
};
