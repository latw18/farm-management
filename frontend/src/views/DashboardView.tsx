import React from 'react';
import { 
  Sprout, 
  Droplets, 
  AlertTriangle, 
  TrendingUp
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceArea 
} from 'recharts';
import type { CropBatch, Reservoir, Alert } from '../types/farm';

interface DashboardViewProps {
  batches: CropBatch[];
  reservoirs: Reservoir[];
  sensorHistory: any[];
  alerts: Alert[];
  onNavigateTab: (tab: any) => void;
  onSelectBatchForAI: (batch: CropBatch) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  batches,
  reservoirs,
  sensorHistory,
  alerts,
  onNavigateTab,
  onSelectBatchForAI
}) => {
  const activeBatches = batches.filter(b => b.status === 'active');
  const totalPlants = activeBatches.reduce((sum, b) => sum + b.currentQuantity, 0);
  const unreadAlerts = alerts.filter(a => !a.resolved);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 4 Standardized KPI Metric Cards */}
      <div className="kpi-grid">
        {/* Metric 1 */}
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-700)' }}>
            <Sprout size={22} />
          </div>
          <div>
            <div className="kpi-label">Lô đang trồng</div>
            <div className="kpi-value">
              {activeBatches.length} <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--text-muted)' }}>lô</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info-text)' }}>
            <Droplets size={22} />
          </div>
          <div>
            <div className="kpi-label">Tổng số cây trên máng</div>
            <div className="kpi-value">
              {totalPlants.toLocaleString()} <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--text-muted)' }}>cây</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="kpi-card">
          <div className="kpi-icon" style={{
            backgroundColor: unreadAlerts.length > 0 ? 'var(--warning-bg)' : 'var(--bg-subtle)',
            color: unreadAlerts.length > 0 ? 'var(--warning-text)' : 'var(--text-muted)'
          }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="kpi-label">Cảnh báo cần xử lý</div>
            <div className="kpi-value" style={{ color: unreadAlerts.length > 0 ? 'var(--warning-text)' : 'var(--text-main)' }}>
              {unreadAlerts.length} <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--text-muted)' }}>thông báo</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#f3e8ff', color: '#7e22ce' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="kpi-label">Sản lượng dự kiến</div>
            <div className="kpi-value">
              ~380 <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--text-muted)' }}>kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart + Current Reservoir Parameters */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Time-Series Chart */}
        <div className="clean-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                Biểu đồ theo dõi pH & EC gần đây
              </h3>
              <p className="card-subtitle">
                Ngưỡng an toàn khuyến nghị cho rau xà lách: pH 5.5 - 6.2 | EC 1.4 - 1.9 mS/cm
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '3px', backgroundColor: 'var(--primary-600)' }} />
                pH
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '3px', backgroundColor: 'var(--info)' }} />
                EC (mS/cm)
              </span>
            </div>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensorHistory} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="var(--text-subtle)" 
                  tick={{ fontSize: 11 }} 
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  yAxisId="ph" 
                  domain={[5.0, 6.8]} 
                  stroke="var(--text-subtle)" 
                  tick={{ fontSize: 11 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="ec" 
                  orientation="right" 
                  domain={[1.0, 2.4]} 
                  stroke="var(--text-subtle)" 
                  tick={{ fontSize: 11 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: '#e2e8f0', 
                    borderRadius: '6px', 
                    fontSize: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }} 
                />
                <ReferenceArea yAxisId="ph" y1={5.5} y2={6.2} fill="#f0fdf4" />
                
                <Line 
                  yAxisId="ph" 
                  type="monotone" 
                  dataKey="ph" 
                  name="pH" 
                  stroke="var(--primary-600)" 
                  strokeWidth={2} 
                  dot={{ r: 2.5, fill: 'var(--primary-600)' }} 
                />
                <Line 
                  yAxisId="ec" 
                  type="monotone" 
                  dataKey="ec" 
                  name="EC (mS/cm)" 
                  stroke="var(--info)" 
                  strokeWidth={2} 
                  dot={{ r: 2.5, fill: 'var(--info)' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current Reservoir Readings */}
        <div className="clean-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Thông số Bể nước A (NFT)
            </h3>
            <button 
              onClick={() => onNavigateTab('reservoirs')} 
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.75rem', padding: '2px 6px' }}
            >
              Chi tiết
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Độ pH</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-700)', marginTop: '2px' }}>
                {reservoirs[0]?.currentPh ?? 5.85}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Chuẩn: 5.5 - 6.2</div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Nồng độ EC</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--info-text)', marginTop: '2px' }}>
                {reservoirs[0]?.currentEc ?? 1.72} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>mS/cm</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Chuẩn: 1.4 - 1.9</div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Oxy hòa tan (DO)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                {reservoirs[0]?.currentDo ?? 6.75} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>mg/L</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--success-text)' }}>Tốt (&gt; 6.0)</div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Nhiệt độ nước</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                {reservoirs[0]?.currentWaterTemp ?? 22.4}°C
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mát (20 - 24°C)</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Mực nước bể: <strong>{reservoirs[0]?.currentVolumeLiters}L</strong> / {reservoirs[0]?.capacityLiters}L
          </div>
        </div>
      </div>

      {/* Batches Table & Alerts Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Active Batches List */}
        <div className="clean-card">
          <div className="card-header">
            <h3 className="card-title">
              Danh sách lô đang canh tác
            </h3>
            <button 
              onClick={() => onNavigateTab('batches')} 
              className="btn btn-secondary btn-sm"
            >
              Xem tất cả
            </button>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã lô</th>
                  <th>Giống xà lách</th>
                  <th>Hệ thống</th>
                  <th>Số cây</th>
                  <th>Giai đoạn</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {activeBatches.map(batch => (
                  <tr key={batch.id}>
                    <td><span className="mono" style={{ fontWeight: 600 }}>{batch.batchCode}</span></td>
                    <td style={{ fontWeight: 500 }}>{batch.cultivarName}</td>
                    <td><span className="badge badge-neutral">{batch.systemType}</span></td>
                    <td>{batch.currentQuantity} cây</td>
                    <td>
                      <span className="badge badge-success">
                        {batch.currentStage === 'vegetative' ? 'Sinh dưỡng' : 
                         batch.currentStage === 'seedling' ? 'Cây con' : 
                         batch.currentStage === 'pre_harvest' ? 'Sắp thu hoạch' : batch.currentStage}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => onSelectBatchForAI(batch)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--primary-700)' }}
                      >
                        Ước tính sản lượng
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Alerts */}
        <div className="clean-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Cảnh báo gần đây
            </h3>
            <button 
              onClick={() => onNavigateTab('alerts')} 
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              Tất cả
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {unreadAlerts.slice(0, 3).map(alert => (
              <div 
                key={alert.id}
                style={{
                  backgroundColor: alert.severity === 'critical' ? 'var(--danger-bg)' : 'var(--warning-bg)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem'
                }}
              >
                <div style={{ fontWeight: 600, color: alert.severity === 'critical' ? 'var(--danger-text)' : 'var(--warning-text)' }}>
                  [{alert.metric}] {alert.title}
                </div>
                <div style={{ color: 'var(--text-main)', marginTop: '3px', fontSize: '0.75rem', lineHeight: 1.4 }}>
                  {alert.suggestedAction}
                </div>
              </div>
            ))}

            {unreadAlerts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-subtle)', fontSize: '0.8125rem' }}>
                Không có cảnh báo mới. Mọi chỉ số nước ổn định.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
