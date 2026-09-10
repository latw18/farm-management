import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  RefreshCw,
  Calculator,
  FlaskConical,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import type { Reservoir, NutrientFormula } from '../types/farm';

interface ReservoirsViewProps {
  reservoirs: Reservoir[];
  formulas: NutrientFormula[];
  onAddMeasurement: (data: { reservoirId: string; ph: number; ec: number; doLevel: number; waterTemp: number }) => void;
  onUpdateVolume: (reservoirId: string, addedLiters: number) => void;
}

export const ReservoirsView: React.FC<ReservoirsViewProps> = ({
  reservoirs,
  formulas = [],
  onAddMeasurement,
  onUpdateVolume
}) => {
  const activeFormula = formulas[0];
  const [selectedResId, setSelectedResId] = useState<string>(reservoirs[0]?.id || '');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

  // Selected reservoir
  const selectedRes = reservoirs.find(r => r.id === selectedResId) || reservoirs[0];

  // Measure form state
  const [formPh, setFormPh] = useState(selectedRes ? selectedRes.currentPh : 5.85);
  const [formEc, setFormEc] = useState(selectedRes ? selectedRes.currentEc : 1.72);
  const [formDo, setFormDo] = useState(selectedRes ? selectedRes.currentDo : 6.8);
  const [formTemp, setFormTemp] = useState(selectedRes ? selectedRes.currentWaterTemp : 22.4);

  // Top up form state
  const [topUpLiters, setTopUpLiters] = useState(50);

  // Calculator State
  const [calcTargetEc, setCalcTargetEc] = useState<number>(1.70);
  const [calcMode, setCalcMode] = useState<'topup' | 'new_tank'>('topup');

  // Sync state when selected reservoir changes
  useEffect(() => {
    if (selectedRes) {
      setFormPh(selectedRes.currentPh);
      setFormEc(selectedRes.currentEc);
      setFormDo(selectedRes.currentDo);
      setFormTemp(selectedRes.currentWaterTemp);
      setCalcTargetEc(selectedRes.currentEc >= 1.70 ? selectedRes.currentEc : 1.70);
    }
  }, [selectedResId]);

  // Dosing logic:
  // Standard 1:100 ratio: 10ml Stock A + 10ml Stock B per 1L of water provides ~1.65 mS/cm EC.
  const calcDeltaEc = Math.max(0, parseFloat((calcTargetEc - (selectedRes?.currentEc || 1.72)).toFixed(2)));
  const tankVolume = selectedRes?.currentVolumeLiters || 500;
  
  const calculatedDoseMl = calcMode === 'new_tank' 
    ? Math.round(tankVolume * 10)
    : Math.round((calcDeltaEc / 1.65) * tankVolume * 10);
  const calculatedDoseLiters = (calculatedDoseMl / 1000).toFixed(2);

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMeasurement({
      reservoirId: selectedResId,
      ph: parseFloat(String(formPh)),
      ec: parseFloat(String(formEc)),
      doLevel: parseFloat(String(formDo)),
      waterTemp: parseFloat(String(formTemp))
    });
    setIsLogModalOpen(false);
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateVolume(selectedResId, Number(topUpLiters));
    setIsTopUpModalOpen(false);
  };

  if (!selectedRes) {
    return (
      <div className="clean-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p>Chưa có bể dinh dưỡng nào được thiết lập.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Standardized Toolbar: Select Reservoir & Quick Actions */}
      <div className="page-toolbar">
        {/* Left: Switch Reservoir */}
        <div className="toolbar-group">
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Chọn bể dung dịch:
          </label>
          <div style={{ display: 'flex', backgroundColor: '#ffffff', padding: '2px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            {reservoirs.map(res => {
              const isSelected = res.id === selectedResId;
              return (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => setSelectedResId(res.id)}
                  style={{
                    height: '32px',
                    padding: '0 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: isSelected ? 'var(--primary-600)' : 'transparent',
                    color: isSelected ? '#ffffff' : 'var(--text-muted)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{res.name.split('-')[0].trim()}</span>
                  <span style={{
                    fontSize: '0.6875rem',
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--bg-subtle)',
                    color: isSelected ? '#ffffff' : 'var(--text-subtle)'
                  }}>
                    {res.currentVolumeLiters}L ({Math.round((res.currentVolumeLiters / res.capacityLiters) * 100)}%)
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="toolbar-group">
          <button 
            onClick={() => setIsTopUpModalOpen(true)}
            className="btn btn-secondary"
            style={{ height: '36px' }}
          >
            <RefreshCw size={14} />
            <span>Châm thêm nước sạch</span>
          </button>
          <button 
            onClick={() => setIsLogModalOpen(true)}
            className="btn btn-primary"
            style={{ height: '36px' }}
          >
            <Plus size={14} />
            <span>Ghi nhận số đo mới</span>
          </button>
        </div>
      </div>

      {/* 2. Top Section: 4 Clear KPI Cards of the Selected Tank */}
      <div className="kpi-grid">
        {/* Metric 1: pH */}
        <div className="kpi-card">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="kpi-label">Độ pH dung dịch</div>
              <span className={`badge ${selectedRes.currentPh >= 5.5 && selectedRes.currentPh <= 6.2 ? 'badge-success' : 'badge-warning'}`}>
                {selectedRes.currentPh >= 5.5 && selectedRes.currentPh <= 6.2 ? 'Đạt chuẩn' : 'Cần cân chỉnh'}
              </span>
            </div>
            <div className="kpi-value">
              {selectedRes.currentPh.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
              Khoảng tối ưu: 5.60 - 6.20
            </div>
          </div>
        </div>

        {/* Metric 2: EC */}
        <div className="kpi-card">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="kpi-label">Độ dẫn điện dinh dưỡng (EC)</div>
              <span className={`badge ${selectedRes.currentEc >= 1.5 && selectedRes.currentEc <= 1.85 ? 'badge-success' : 'badge-warning'}`}>
                {selectedRes.currentEc >= 1.5 && selectedRes.currentEc <= 1.85 ? 'Đạt chuẩn' : 'Lệch ngưỡng'}
              </span>
            </div>
            <div className="kpi-value" style={{ color: 'var(--info-text)' }}>
              {selectedRes.currentEc.toFixed(2)} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>mS/cm</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
              Mục tiêu: 1.60 - 1.80 mS/cm
            </div>
          </div>
        </div>

        {/* Metric 3: DO */}
        <div className="kpi-card">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="kpi-label">Oxy hòa tan (DO)</div>
              <span className={`badge ${selectedRes.currentDo >= 6.0 ? 'badge-success' : 'badge-danger'}`}>
                {selectedRes.currentDo >= 6.0 ? 'Rất tốt' : 'Thiếu oxy'}
              </span>
            </div>
            <div className="kpi-value">
              {selectedRes.currentDo.toFixed(2)} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>mg/L</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
              Tiêu chuẩn rễ: &gt; 6.0 mg/L
            </div>
          </div>
        </div>

        {/* Metric 4: Water Temp */}
        <div className="kpi-card">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="kpi-label">Nhiệt độ nước bồn</div>
              <span className={`badge ${selectedRes.currentWaterTemp <= 24.0 ? 'badge-success' : 'badge-warning'}`}>
                {selectedRes.currentWaterTemp <= 24.0 ? 'Mát mẻ' : 'Hơi ấm'}
              </span>
            </div>
            <div className="kpi-value">
              {selectedRes.currentWaterTemp.toFixed(1)} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>°C</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
              Tối ưu cho xà lách: 20 - 23°C
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Operational Section: 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1.25fr', gap: '20px' }}>
        
        {/* Left Column: Châm dinh dưỡng vào bể */}
        <div className="clean-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card-header" style={{ marginBottom: 0 }}>
            <div>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calculator size={18} color="var(--primary-600)" />
                <span>Châm dinh dưỡng vào {selectedRes.name.split('-')[0].trim()}</span>
              </h3>
              <p className="card-subtitle">
                Định lượng dung dịch mẹ Stock A & B cần rót vào bể ({selectedRes.currentVolumeLiters}L nước)
              </p>
            </div>
          </div>

          {/* Status Indicator */}
          <div style={{
            backgroundColor: calcDeltaEc === 0 ? 'var(--primary-50)' : '#fffbeb',
            border: `1px solid ${calcDeltaEc === 0 ? 'var(--primary-200)' : '#fde68a'}`,
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            {calcDeltaEc === 0 ? (
              <CheckCircle2 size={18} color="var(--primary-700)" style={{ flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <div style={{ fontSize: '0.8125rem', lineHeight: 1.45 }}>
              {calcDeltaEc === 0 ? (
                <span style={{ color: 'var(--primary-900)' }}>
                  <strong>Nồng độ EC hiện tại ({selectedRes.currentEc} mS/cm) đang lý tưởng.</strong> Không cần châm thêm phân lúc này.
                </span>
              ) : (
                <span style={{ color: '#92400e' }}>
                  <strong>Cần tăng thêm +{calcDeltaEc} mS/cm</strong> để đưa EC từ {selectedRes.currentEc} lên {calcTargetEc} mS/cm.
                </span>
              )}
            </div>
          </div>

          {/* Mode Selector: Top-up vs New Tank */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setCalcMode('topup')}
              className={`btn btn-sm ${calcMode === 'topup' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, fontSize: '0.75rem' }}
            >
              Nâng EC bể hiện tại ({selectedRes.currentVolumeLiters}L)
            </button>
            <button
              type="button"
              onClick={() => setCalcMode('new_tank')}
              className={`btn btn-sm ${calcMode === 'new_tank' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, fontSize: '0.75rem' }}
            >
              Pha nước mới toàn bộ bồn
            </button>
          </div>

          {/* Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Thể tích nước trong bể</label>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', padding: '6px 10px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                {selectedRes.currentVolumeLiters} Lít (bể {selectedRes.capacityLiters}L)
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>EC mục tiêu mong muốn</label>
              <input
                type="number"
                step="0.05"
                min="1.0"
                max="2.5"
                className="form-input"
                style={{ height: '34px', fontSize: '0.8125rem' }}
                value={calcTargetEc}
                onChange={e => setCalcTargetEc(parseFloat(e.target.value))}
              />
            </div>
          </div>

          {/* Dosing Result Box */}
          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-subtle)', marginBottom: '8px' }}>
              {calcMode === 'topup' 
                ? (calcDeltaEc === 0 ? 'Lượng dinh dưỡng cần châm lúc này:' : `Lượng dinh dưỡng cần châm để tăng +${calcDeltaEc} mS/cm:`)
                : `Lượng dinh dưỡng pha mới cho ${selectedRes.currentVolumeLiters}L:`}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--primary-700)' }}>Dung dịch Mẹ Stock A</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-800)', marginTop: '2px' }}>
                  {calculatedDoseMl.toLocaleString('vi-VN')} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>ml</span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>({calculatedDoseLiters} Lít)</div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--info-text)' }}>Dung dịch Mẹ Stock B</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--info-text)', marginTop: '2px' }}>
                  {calculatedDoseMl.toLocaleString('vi-VN')} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>ml</span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>({calculatedDoseLiters} Lít)</div>
              </div>
            </div>
          </div>

          {/* 3 Step Safety Guide */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.45, borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
            <strong style={{ color: 'var(--text-main)' }}>Quy trình châm an toàn:</strong> Rót Stock A vào bể &rarr; Chờ bơm tuần hoàn chạy 15 phút &rarr; Mới rót tiếp Stock B. <em>(Tuyệt đối không đổ A và B cùng lúc vào 1 xô múc để tránh vón cục thạch cao).</em>
          </div>
        </div>

        {/* Right Column: Công thức pha can 10L ở kho */}
        <div className="clean-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card-header" style={{ marginBottom: 0 }}>
            <div>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FlaskConical size={18} color="var(--primary-600)" />
                <span>Công thức pha can 10L mẹ ở kho</span>
              </h3>
              <p className="card-subtitle">
                Định lượng hóa chất khi pha sẵn can 10 Lít đậm đặc (tỷ lệ 1:100)
              </p>
            </div>
            <span className="badge badge-neutral">
              {activeFormula?.systemType ? 'Hệ NFT Tuần Hoàn' : 'Chuẩn Hoagland - Resh'}
            </span>
          </div>

          {/* 2 Can Side-by-Side Boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Can A */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--primary-200)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary-700)' }}>
                  Can Mẹ Stock A
                </span>
                <span className="badge badge-success" style={{ fontSize: '0.6875rem' }}>10 Lít</span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-subtle)' }}>
                Nhóm Canxi & Sắt (Giữ riêng biệt)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed var(--border-subtle)' }}>
                  <span>Canxi Nitrat [Ca(NO3)2]</span>
                  <strong style={{ color: 'var(--primary-800)' }}>1,000 g</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed var(--border-subtle)' }}>
                  <span>Kali Nitrat [KNO3]</span>
                  <strong>200 g</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>Sắt Chelate [Fe-EDDHA 6%]</span>
                  <strong style={{ color: 'var(--primary-800)' }}>40 g</strong>
                </div>
              </div>
            </div>

            {/* Can B */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--info-border, #bfdbfe)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--info-text)' }}>
                  Can Mẹ Stock B
                </span>
                <span className="badge badge-info" style={{ fontSize: '0.6875rem' }}>10 Lít</span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-subtle)' }}>
                Nhóm Lân, Sunfat & Vi lượng
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed var(--border-subtle)' }}>
                  <span>MKP Lân [KH2PO4]</span>
                  <strong style={{ color: 'var(--info-text)' }}>250 g</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed var(--border-subtle)' }}>
                  <span>Kali Nitrat [KNO3]</span>
                  <strong>400 g</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed var(--border-subtle)' }}>
                  <span>Magie Sunfat [MgSO4]</span>
                  <strong>550 g</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed var(--border-subtle)' }}>
                  <span>Kali Sunfat [K2SO4]</span>
                  <strong>100 g</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>Vi lượng Chelate tổng hợp</span>
                  <strong>25 g</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Why separate note */}
          <div style={{
            backgroundColor: '#fffdf5',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            fontSize: '0.75rem',
            lineHeight: 1.45,
            color: '#92400e'
          }}>
            <strong>Tại sao phải chia Can A và Can B?</strong> Canxi trong Can A nếu gặp Lân và Sunfat trong Can B ở nồng độ đậm đặc sẽ phản ứng kết tủa thành thạch cao không tan (CaSO4 và Ca3(PO4)2), làm nghẹt máng NFT và cây bị cháy mép lá.
          </div>
        </div>

      </div>

      {/* Log Measurement Modal */}
      {isLogModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLogModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Ghi nhận số đo nước mới ({selectedRes.name.split('-')[0].trim()})
              </h3>
              <button 
                onClick={() => setIsLogModalOpen(false)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '1.25rem' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleLogSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Độ pH (Mục tiêu: 5.5 - 6.2)</label>
                    <input 
                      type="number" 
                      step="0.05"
                      min="4.0"
                      max="9.0"
                      className="form-input" 
                      value={formPh} 
                      onChange={e => setFormPh(parseFloat(e.target.value))} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">EC (mS/cm - Mục tiêu: 1.4 - 1.9)</label>
                    <input 
                      type="number" 
                      step="0.05"
                      min="0.5"
                      max="3.5"
                      className="form-input" 
                      value={formEc} 
                      onChange={e => setFormEc(parseFloat(e.target.value))} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Oxy hòa tan DO (mg/L - Chuẩn: &gt; 6.0)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      min="2.0"
                      max="12.0"
                      className="form-input" 
                      value={formDo} 
                      onChange={e => setFormDo(parseFloat(e.target.value))} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nhiệt độ nước (°C - Chuẩn: 20 - 24)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      min="15.0"
                      max="35.0"
                      className="form-input" 
                      value={formTemp} 
                      onChange={e => setFormTemp(parseFloat(e.target.value))} 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => setIsLogModalOpen(false)} 
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Lưu kết quả đo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Up Water Modal */}
      {isTopUpModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTopUpModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Châm thêm nước sạch ({selectedRes.name.split('-')[0].trim()})
              </h3>
              <button 
                onClick={() => setIsTopUpModalOpen(false)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '1.25rem' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleTopUpSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Số lít nước sạch châm thêm (L)</label>
                  <input 
                    type="number" 
                    min="10"
                    max="500"
                    className="form-input" 
                    value={topUpLiters} 
                    onChange={e => setTopUpLiters(Number(e.target.value))} 
                    required 
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                  Châm nước sạch giúp bù lượng nước hao hụt và pha loãng nồng độ EC khi dung dịch quá đặc.
                </p>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => setIsTopUpModalOpen(false)} 
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
