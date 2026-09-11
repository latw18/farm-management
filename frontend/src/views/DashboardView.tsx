import React from 'react';
import { 
  Sprout, 
  Droplets, 
  AlertTriangle, 
  TrendingUp,
  CloudSun
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
import { predictLettuceYield } from '../services/aiPredictor';
import { AgronomicTooltip } from '../components/AgronomicTooltip';
import { LifecycleProgressBar } from '../components/LifecycleProgressBar';

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

  // Dynamic predicted yield calculation using predictLettuceYield
  const totalPredictedYieldKg = activeBatches.reduce((sum, b) => {
    const ageDays = Math.max(1, Math.round((new Date().getTime() - new Date(b.seedDate).getTime()) / (1000 * 3600 * 24)));
    const res = reservoirs.find(r => r.id === b.reservoirId) || reservoirs[0];
    const pred = predictLettuceYield({
      cultivarName: b.cultivarName,
      plantAgeDays: ageDays,
      targetCycleDays: 35,
      expectedWeightG: 190,
      leafCount: b.lastObservation?.avgLeafCount || (ageDays > 20 ? 14 : 8),
      plantHeightCm: b.lastObservation?.avgHeightCm || (ageDays > 20 ? 14 : 8),
      avgEc: res?.currentEc || 1.6,
      avgPh: res?.currentPh || 5.85,
      avgWaterTemp: res?.currentWaterTemp || 22.5,
      expectedPlants: b.currentQuantity
    });
    return sum + (pred.totalBatchYieldKg || 0);
  }, 0);

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
              ~{Math.round(totalPredictedYieldKg || 380)} <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--text-muted)' }}>kg</span>
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Độ pH</span>
                <AgronomicTooltip 
                  title="Độ pH dung dịch dinh dưỡng" 
                  optimalRange="5.5 - 6.2" 
                  explanation="Độ pH quyết định khả năng hòa tan và hấp thu các ion khoáng của rễ xà lách. Nếu pH lệch chuẩn, cây sẽ bị đói vi lượng dù phân bón đầy đủ."
                  warningNotice="pH > 6.5 dễ gây vàng lá (thiếu sắt); pH < 5.0 làm tổn thương lông hút của rễ."
                />
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-700)', marginTop: '2px' }}>
                {reservoirs[0]?.currentPh ?? 5.85}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Chuẩn: 5.5 - 6.2</div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Nồng độ EC</span>
                <AgronomicTooltip 
                  title="Độ dẫn điện EC (Nồng độ muối khoáng)" 
                  optimalRange="1.4 - 1.9 mS/cm" 
                  explanation="EC phản ánh tổng lượng phân bón khoáng hòa tan trong bể (N, P, K, Ca, Mg,...). Nồng độ ổn định giúp búp xà lách cuốn chặt, giòn ngọt."
                  warningNotice="EC < 1.3 mS/cm cây chậm lớn; EC > 2.2 mS/cm làm cháy mép lá và ngộ độc rễ."
                />
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--info-text)', marginTop: '2px' }}>
                {reservoirs[0]?.currentEc ?? 1.72} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>mS/cm</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Chuẩn: 1.4 - 1.9</div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Dung tích bể</span>
                <AgronomicTooltip 
                  title="Mực nước & Thể tích bể" 
                  explanation="Lượng nước dinh dưỡng hiện tại trong bồn chứa. Đảm bảo lượng nước trên 50% dung tích để máy bơm tuần hoàn màng NFT luôn ổn định, tránh hụt nước khi nắng to."
                />
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                {reservoirs[0]?.currentVolumeLiters ?? 1800} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>/ {reservoirs[0]?.capacityLiters ?? 2000}L</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--primary-700)' }}>
                {Math.round(((reservoirs[0]?.currentVolumeLiters ?? 1800) / (reservoirs[0]?.capacityLiters ?? 2000)) * 100)}% thể tích
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Nhiệt độ nước</span>
                <AgronomicTooltip 
                  title="Nhiệt độ nước bồn chứa" 
                  optimalRange="20 - 24°C" 
                  explanation="Nhiệt độ dung dịch mát mẻ kích thích bộ rễ phát triển màu trắng tinh khiết, rễ hút khoáng mạnh mẽ."
                  warningNotice="Nước ấm > 24.5°C làm tăng nguy cơ nấm bệnh Pythium bùng phát gây thối rễ."
                />
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                {reservoirs[0]?.currentWaterTemp ?? 22.4}°C
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mát (20 - 24°C)</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Hệ thống cấp: <strong>NFT Chảy màng dinh dưỡng</strong> | Bơm tuần hoàn: <span style={{ color: 'var(--success-text)', fontWeight: 600 }}>Đang chạy</span>
          </div>
        </div>
      </div>

      {/* Microclimate Real-time Bar */}
      <div className="clean-card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: 'linear-gradient(to right, #f8fafc, #f0fdf4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-700)' }}>
            <CloudSun size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>Tiểu khí hậu nhà màng A</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cập nhật cảm biến môi trường thời gian thực</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Nhiệt độ phòng:</span>
            <strong style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>23.8°C</strong>
            <AgronomicTooltip 
              title="Nhiệt độ không khí" 
              optimalRange="20 - 25°C" 
              explanation="Nhiệt độ lý tưởng cho quá trình quang hợp của xà lách. Nhiệt độ trên 28°C dễ làm rau đắng và vống ngọn." 
            />
          </div>
          <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Độ ẩm RH:</span>
            <strong style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>68%</strong>
            <AgronomicTooltip 
              title="Độ ẩm tương đối (RH)" 
              optimalRange="60 - 75%" 
              explanation="Độ ẩm vừa phải giúp lá mở khí khổng để trao đổi CO2 tốt. Độ ẩm >85% dễ sinh nấm mốc xám Botrytis." 
            />
          </div>
          <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Áp suất thiếu hụt (VPD):</span>
            <strong style={{ fontSize: '0.875rem', color: 'var(--primary-700)' }}>0.92 kPa</strong>
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Tối ưu</span>
            <AgronomicTooltip 
              title="Áp suất hơi thiếu hụt VPD (Vapor Pressure Deficit)" 
              optimalRange="0.8 - 1.2 kPa" 
              explanation="Chỉ số phản ánh sức hút thoát hơi nước của lá. Dải 0.8 - 1.2 kPa giúp xà lách vận chuyển Canxi lên ngọn lá hoàn hảo, ngăn chặn triệt để hiện tượng cháy mép lá (tipburn)." 
            />
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
                  <th>Tiến trình ngày tuổi</th>
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
                    <td style={{ minWidth: '150px' }}>
                      <LifecycleProgressBar 
                        compact 
                        seedDate={batch.seedDate} 
                        expectedHarvestDate={batch.expectedHarvestDate}
                        currentStage={batch.currentStage}
                        targetCycleDays={35}
                      />
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
