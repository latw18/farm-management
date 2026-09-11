import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Check,
  Bell,
  Clock,
  UserCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { Alert, AlertStatus } from '../types/farm';

interface AlertsViewProps {
  alerts: Alert[];
  onAcknowledgeAlert: (id: string, by: string) => void;
  onResolveAlert: (id: string, by?: string, note?: string) => void;
}

const STATUS_META: Record<AlertStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  open:         { label: 'Chưa xử lý',    color: '#dc2626', bg: '#fef2f2', icon: <Bell size={13} /> },
  acknowledged: { label: 'Đã tiếp nhận',  color: '#d97706', bg: '#fffbeb', icon: <Clock size={13} /> },
  resolved:     { label: 'Đã giải quyết', color: '#16a34a', bg: '#f0fdf4', icon: <Check size={13} /> },
  escalated:    { label: 'Leo thang',      color: '#7c3aed', bg: '#f5f3ff', icon: <AlertTriangle size={13} /> },
};

const SEVERITY_COLOR: Record<string, string> = {
  critical: 'var(--danger)',
  warning:  'var(--warning)',
  info:     'var(--info)',
};

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onAcknowledgeAlert,
  onResolveAlert,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('active'); // active = open+ack
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState('');
  const [resolveTarget, setResolveTarget] = useState<string | null>(null);

  // Summary counts
  const openCount = alerts.filter(a => a.status === 'open').length;
  const ackCount  = alerts.filter(a => a.status === 'acknowledged').length;
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length;

  const filtered = alerts.filter(a => {
    const matchSev = filterSeverity === 'all' || a.severity === filterSeverity;
    const matchStatus =
      filterStatus === 'all'    ? true :
      filterStatus === 'active' ? (a.status === 'open' || a.status === 'acknowledged') :
      a.status === filterStatus;
    return matchSev && matchStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Summary KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[
          { label: 'Chưa xử lý',    count: openCount,    status: 'open',     color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
          { label: 'Đã tiếp nhận',  count: ackCount,     status: 'acknowledged', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
          { label: 'Đã giải quyết', count: resolvedCount,status: 'resolved',  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
        ].map(item => (
          <button
            key={item.status}
            onClick={() => setFilterStatus(filterStatus === item.status ? 'all' : item.status)}
            style={{
              textAlign: 'left',
              background: filterStatus === item.status ? item.bg : '#ffffff',
              border: `1px solid ${filterStatus === item.status ? item.border : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '4px' }}>{item.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: item.color }}>{item.count}</div>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="page-toolbar">
        <div className="toolbar-group">
          {/* Severity filter */}
          {[
            { id: 'all',      label: 'Tất cả mức' },
            { id: 'critical', label: '🔴 Nghiêm trọng' },
            { id: 'warning',  label: '🟡 Cảnh báo' },
            { id: 'info',     label: '🔵 Thông tin' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilterSeverity(btn.id)}
              style={{
                height: '34px', padding: '0 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                backgroundColor: filterSeverity === btn.id ? 'var(--primary-600)' : '#ffffff',
                color: filterSeverity === btn.id ? '#ffffff' : 'var(--text-muted)',
                borderColor: filterSeverity === btn.id ? 'var(--primary-600)' : 'var(--border-subtle)',
                fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
          Hiển thị {filtered.length} / {alerts.length} cảnh báo
        </div>
      </div>

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map(alert => {
          const meta = STATUS_META[alert.status];
          const isExpanded = expandedId === alert.id;
          const isResolvingThis = resolveTarget === alert.id;

          return (
            <div
              key={alert.id}
              className="clean-card"
              style={{
                padding: 0,
                borderLeft: `4px solid ${SEVERITY_COLOR[alert.severity] || 'var(--border-medium)'}`,
                opacity: alert.status === 'resolved' ? 0.72 : 1,
              }}
            >
              {/* Main row */}
              <div
                style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '14px', cursor: 'pointer' }}
                onClick={() => setExpandedId(isExpanded ? null : alert.id)}
              >
                {/* Icon */}
                <div style={{
                  width: '34px', height: '34px', borderRadius: 'var(--radius-md)', flexShrink: 0,
                  backgroundColor: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: meta.color
                }}>
                  <AlertTriangle size={17} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span className={`badge ${
                      alert.severity === 'critical' ? 'badge-danger' :
                      alert.severity === 'warning'  ? 'badge-warning' : 'badge-info'
                    }`}>{alert.metric}</span>

                    {/* Status pill */}
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '2px 8px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600,
                      backgroundColor: meta.bg, color: meta.color, border: `1px solid ${meta.color}30`
                    }}>
                      {meta.icon} {meta.label}
                    </span>

                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', flex: 1 }}>
                      {alert.title}
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>
                      {alert.timestamp}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {alert.message}
                  </p>

                  {/* Assigned */}
                  {alert.assignedTo && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <UserCheck size={11} /> Phụ trách: <strong>{alert.assignedTo}</strong>
                      {alert.acknowledgedAt && <span>· Tiếp nhận lúc {alert.acknowledgedAt}</span>}
                    </div>
                  )}
                </div>

                {/* Expand chevron */}
                <div style={{ color: 'var(--text-subtle)', flexShrink: 0 }}>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                  {/* Suggested action */}
                  <div style={{
                    backgroundColor: 'var(--bg-subtle)', padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-main)'
                  }}>
                    <strong>Cách xử lý:</strong> {alert.suggestedAction}
                  </div>

                  {/* Resolution note if resolved */}
                  {alert.resolutionNote && (
                    <div style={{
                      backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
                      padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: '#166534'
                    }}>
                      <strong>Ghi chú xử lý ({alert.resolvedBy}):</strong> {alert.resolutionNote}
                    </div>
                  )}

                  {/* Lifecycle timeline */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0', fontSize: '0.7rem' }}>
                    {[
                      { key: 'open',         label: 'Tạo cảnh báo',   time: alert.timestamp },
                      { key: 'acknowledged', label: 'Tiếp nhận',      time: alert.acknowledgedAt },
                      { key: 'resolved',     label: 'Giải quyết',     time: alert.resolvedAt },
                    ].map((step, idx) => {
                      const isActive = ['open','acknowledged','resolved'].indexOf(alert.status) >= idx;
                      return (
                        <React.Fragment key={step.key}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: '80px' }}>
                            <div style={{
                              width: '20px', height: '20px', borderRadius: '50%',
                              backgroundColor: isActive ? 'var(--primary-600)' : 'var(--border-subtle)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                            }}>
                              <Check size={11} />
                            </div>
                            <span style={{ color: isActive ? 'var(--text-main)' : 'var(--text-subtle)', fontWeight: isActive ? 600 : 400, textAlign: 'center' }}>
                              {step.label}
                            </span>
                            {step.time && <span style={{ color: 'var(--text-subtle)' }}>{step.time}</span>}
                          </div>
                          {idx < 2 && (
                            <div style={{
                              flex: 1, height: '2px', marginBottom: '18px',
                              backgroundColor: isActive && ['acknowledged','resolved'].indexOf(alert.status) > idx - 1
                                ? 'var(--primary-600)' : 'var(--border-subtle)'
                            }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {alert.status === 'open' && (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id, 'Kỹ sư Nông nghiệp')}
                        className="btn btn-secondary btn-sm"
                      >
                        <Clock size={13} /> Tiếp nhận xử lý
                      </button>
                    )}

                    {(alert.status === 'open' || alert.status === 'acknowledged') && !isResolvingThis && (
                      <button
                        onClick={() => { setResolveTarget(alert.id); setResolveNote(''); }}
                        className="btn btn-primary btn-sm"
                      >
                        <CheckCircle2 size={13} /> Đánh dấu đã giải quyết
                      </button>
                    )}

                    {isResolvingThis && (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Ghi chú hành động đã thực hiện..."
                          value={resolveNote}
                          onChange={e => setResolveNote(e.target.value)}
                          style={{ height: '32px', fontSize: '0.8rem', flex: 1 }}
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            onResolveAlert(alert.id, 'Kỹ sư Nông nghiệp', resolveNote);
                            setResolveTarget(null);
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          Xác nhận
                        </button>
                        <button onClick={() => setResolveTarget(null)} className="btn btn-secondary btn-sm">
                          Hủy
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="clean-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-subtle)' }}>
            <CheckCircle2 size={36} color="var(--primary-600)" style={{ margin: '0 auto 8px' }} />
            <h4 style={{ color: 'var(--text-main)', fontWeight: 600 }}>Không có cảnh báo</h4>
            <p style={{ fontSize: '0.8125rem', marginTop: '2px' }}>Tất cả các chỉ số đang trong giới hạn cho phép.</p>
          </div>
        )}
      </div>
    </div>
  );
};
