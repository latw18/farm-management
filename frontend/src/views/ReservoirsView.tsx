import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  RefreshCw,
  Calculator,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Trash2,
  History
} from 'lucide-react';
import type { Reservoir, NutrientFormula, Channel, SolutionDrainEvent, CropBatch } from '../types/farm';

interface ReservoirsViewProps {
  reservoirs: Reservoir[];
  formulas: NutrientFormula[];
  channels: Channel[];
  batches: CropBatch[];
  drainEvents: SolutionDrainEvent[];
  onAddMeasurement: (data: { reservoirId: string; ph: number; ec: number; doLevel: number; waterTemp: number }) => void;
  onUpdateVolume: (reservoirId: string, addedLiters: number) => void;
  onDrainReservoir: (event: Omit<SolutionDrainEvent, 'id'>) => void;
}

export const ReservoirsView: React.FC<ReservoirsViewProps> = ({
  reservoirs,
  formulas = [],
  channels = [],
  batches = [],
  drainEvents = [],
  onAddMeasurement,
  onUpdateVolume,
  onDrainReservoir
}) => {
  const [selectedResId, setSelectedResId] = useState<string>(reservoirs[0]?.id || '');
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>(formulas[0]?.id || '');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isDrainModalOpen, setIsDrainModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dosing' | 'channels' | 'history'>('dosing');

  // Selected reservoir & formula
  const selectedRes = reservoirs.find(r => r.id === selectedResId) || reservoirs[0];
  const activeFormula = formulas.find(f => f.id === selectedFormulaId) || formulas[0];

  // Measure form state
  const [formPh, setFormPh] = useState(selectedRes ? selectedRes.currentPh : 5.85);
  const [formEc, setFormEc] = useState(selectedRes ? selectedRes.currentEc : 1.72);
  const [formTemp, setFormTemp] = useState(selectedRes ? selectedRes.currentWaterTemp : 22.4);

  // Top up form state
  const [topUpLiters, setTopUpLiters] = useState(50);

  // Drain form state
  const [drainReason, setDrainReason] = useState<SolutionDrainEvent['reason']>('end_of_batch');
  const [drainOperator, setDrainOperator] = useState('Kỹ sư Nông nghiệp');
  const [drainNotes, setDrainNotes] = useState('');

  // Channels for selected reservoir
  const resChannels = channels.filter(c => c.reservoirId === selectedResId);
  const resDrainHistory = drainEvents.filter(e => e.reservoirId === selectedResId);

  // Calculator State
  const [calcTargetEc, setCalcTargetEc] = useState<number>(1.70);
  const [calcMode, setCalcMode] = useState<'topup' | 'new_tank'>('topup');

  // Sync state when selected reservoir changes
  useEffect(() => {
    if (selectedRes) {
      setFormPh(selectedRes.currentPh);
      setFormEc(selectedRes.currentEc);
      setFormTemp(selectedRes.currentWaterTemp);
    }
  }, [selectedResId]);

  useEffect(() => {
    if (activeFormula) {
      setTargetEc(activeFormula.targetEc);
    }
  }, [selectedFormulaId]);

  if (!selectedRes) {
    return (
      <div className="clean-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p>Chưa có bể dinh dưỡng nào được thiết lập.</p>
      </div>
    );
  }

  // Dosing calculation:
  // Empirical rule: 10ml of Stock A + 10ml of Stock B per 100L increases EC by approx 0.10 mS/cm
  const ecDeficit = Math.max(0, targetEc - selectedRes.currentEc);
  const dosingRatioFactor = (selectedRes.currentVolumeLiters / 100);
  const recommendedDoseMlPerStock = Math.round((ecDeficit / 0.10) * 10 * dosingRatioFactor);

  // Aliases for UI compatibility
  const calcTargetEc = targetEc;
  const setCalcTargetEc = setTargetEc;
  const calcDeltaEc = ecDeficit;
  const calculatedDoseMl = recommendedDoseMlPerStock;
  const calculatedDoseLiters = (calculatedDoseMl / 1000).toFixed(2);
  const [calcMode, setCalcMode] = useState<'topup' | 'new_tank'>('topup');

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMeasurement({
      reservoirId: selectedResId,
      ph: parseFloat(String(formPh)),
      ec: parseFloat(String(formEc)),
      waterTemp: parseFloat(String(formTemp))
    });
    setIsLogModalOpen(false);
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateVolume(selectedResId, Number(topUpLiters));
    setIsTopUpModalOpen(false);
  };

  const handleDrainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRes) return;
    onDrainReservoir({
      reservoirId: selectedResId,
      drainDate: new Date().toISOString().split('T')[0],
      volumeDrainedLiters: selectedRes.currentVolumeLiters,
      finalPh: selectedRes.currentPh,
      finalEc: selectedRes.currentEc,
      finalDo: selectedRes.currentDo,
      reason: drainReason,
      operator: drainOperator,
      notes: drainNotes
    });
    setIsDrainModalOpen(false);
    setDrainNotes('');
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
            onClick={() => setIsDrainModalOpen(true)}
            className="btn btn-secondary"
            style={{ height: '36px', color: 'var(--danger-text)', borderColor: 'var(--danger)' }}
          >
            <Trash2 size={14} />
            <span>Xả bể / Thay dung dịch</span>
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

      {/* Dosing Success Toast */}
      {dosingSuccessMsg && (
        <div style={{
          backgroundColor: 'var(--primary-50)',
          border: '1px solid var(--primary-200)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--primary-900)',
          fontSize: '0.875rem',
          animation: 'fadeIn 0.2s ease-in'
        }}>
          <CheckCircle2 size={18} color="var(--primary-700)" />
          <span>{dosingSuccessMsg}</span>
        </div>
      )}

      {/* 2. Top Section: 4 Clear KPI Cards of the Selected Tank */}
      <div className="kpi-grid">
        {/* Metric 1: pH */}
        <div className="kpi-card">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="kpi-label">Độ pH dung dịch</span>
                <AgronomicTooltip 
                  title="Độ pH dung dịch dinh dưỡng" 
                  optimalRange="5.60 - 6.20" 
                  explanation="Độ axit/kiềm ảnh hưởng trực tiếp đến khả năng hòa tan của muối khoáng. Giữ pH axit nhẹ giúp rễ cây hấp thu tối đa vi lượng Fe, Mn, Zn, Cu mà không bị kết tủa."
                  warningNotice="Dùng dung dịch pH Down (H3PO4/HNO3) nếu pH > 6.5 hoặc pH Up (KOH) nếu pH < 5.5."
                />
              </div>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="kpi-label">Độ dẫn điện dinh dưỡng (EC)</span>
                <AgronomicTooltip 
                  title="Nồng độ dẫn điện EC (Tải muối khoáng)" 
                  optimalRange="1.50 - 1.85 mS/cm" 
                  explanation="Chỉ số phản ánh tổng lượng phân bón muối khoáng hòa tan trong bể. Duy trì ổn định giúp búp xà lách phát triển khỏe, đạt trọng lượng mục tiêu."
                  warningNotice="Khi EC tụt < 1.3 mS/cm, cần châm thêm dung dịch mẹ Can A và Can B theo tỷ lệ 1:1."
                />
              </div>
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

        {/* Metric 3: Water Temp */}
        <div className="kpi-card">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="kpi-label">Nhiệt độ nước bồn</span>
                <AgronomicTooltip 
                  title="Nhiệt độ nước bồn chứa" 
                  optimalRange="20.0 - 23.5°C" 
                  explanation="Nhiệt độ dung dịch mát giúp duy trì rễ cây trắng tinh, hô hấp và hấp thu phân bón khỏe mạnh."
                  warningNotice="Nước ấm > 24.5°C làm tăng nguy cơ nấm bệnh Pythium bùng phát gây thối rễ xà lách."
                />
              </div>
              <span className={`badge ${selectedRes.currentWaterTemp <= 24.0 ? 'badge-success' : 'badge-warning'}`}>
                {selectedRes.currentWaterTemp <= 24.0 ? 'Mát mẻ' : 'Hơi ấm'}
              </span>
            </div>
            <div className="kpi-value">
              {selectedRes.currentWaterTemp.toFixed(1)} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>°C</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
              Tối ưu cho xà lách: 20 - 23.5°C
            </div>
          </div>
        </div>

        {/* Metric 4: Water Volume */}
        <div className="kpi-card">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="kpi-label">Thể tích nước hiện tại</span>
                <AgronomicTooltip 
                  title="Mực nước & Thể tích bể" 
                  explanation="Lượng nước dinh dưỡng hiện có trong bể chứa. Cần đảm bảo trên 50% dung tích để máy bơm tuần hoàn màng NFT luôn ổn định, tránh hụt nước khi nắng to."
                />
              </div>
              <span className="badge badge-neutral">
                {Math.round((selectedRes.currentVolumeLiters / selectedRes.capacityLiters) * 100)}% đầy
              </span>
            </div>
            <div className="kpi-value">
              {selectedRes.currentVolumeLiters} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ {selectedRes.capacityLiters} L</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
              Tuần hoàn: Bơm {selectedRes.pumpStatus === 'running' ? 'Đang chạy' : 'Dừng'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tab Navigation */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid var(--border-subtle)', paddingBottom: '0' }}>
        {[
          { id: 'dosing',   label: 'Châm dinh dưỡng & Công thức', icon: <Calculator size={14} /> },
          { id: 'channels', label: 'Máng trồng (Channel)', icon: <Layers size={14} /> },
          { id: 'history',  label: 'Lịch sử xả bể', icon: <History size={14} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '0.8125rem', fontWeight: 600,
              color: activeTab === tab.id ? 'var(--primary-600)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary-600)' : '2px solid transparent',
              marginBottom: '-2px'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Main Operational Section: Dosing Tab */}
      {activeTab === 'dosing' && (
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

            {/* Action button to execute dosing */}
            {calculatedDoseMl > 0 && (
              <button
                type="button"
                onClick={handleExecuteDosing}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '12px', justifyContent: 'center', height: '36px' }}
              >
                <CheckCircle2 size={16} />
                <span>Xác nhận đã châm phân vào {selectedRes.name.split('-')[0].trim()}</span>
              </button>
            )}
          </div>

          {/* 3 Step Safety Guide */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.45, borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
            <strong style={{ color: 'var(--text-main)' }}>Quy trình châm an toàn:</strong> Rót Stock A vào bể &rarr; Chờ bơm tuần hoàn chạy 15 phút &rarr; Mới rót tiếp Stock B. <em>(Tuyệt đối không đổ A và B cùng lúc vào 1 xô múc để tránh vón cục thạch cao).</em>
          </div>
        </div>

        {/* Right Column: Công thức pha can 10L ở kho */}
        <div className="clean-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card-header" style={{ marginBottom: 0, alignItems: 'flex-start' }}>
            <div>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FlaskConical size={18} color="var(--primary-600)" />
                <span>Công thức pha can 10L mẹ ở kho</span>
              </h3>
              <p className="card-subtitle">
                Định lượng hóa chất khi pha sẵn can 10 Lít đậm đặc (tỷ lệ 1:100)
              </p>
            </div>
            
            {/* Formula Selector Dropdown */}
            {formulas.length > 1 && (
              <select
                value={selectedFormulaId}
                onChange={e => setSelectedFormulaId(e.target.value)}
                className="form-select"
                style={{ fontSize: '0.75rem', padding: '4px 8px', height: '30px', maxWidth: '200px' }}
              >
                {formulas.map(f => (
                  <option key={f.id} value={f.id}>{f.name.split('(')[0].trim()}</option>
                ))}
              </select>
            )}
          </div>

          {/* Active Formula Description Badge */}
          <div style={{ fontSize: '0.75rem', color: 'var(--primary-800)', backgroundColor: 'var(--primary-50)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
            <strong>Áp dụng:</strong> {activeFormula?.applicableCrop} | <em>{activeFormula?.scientificStandard}</em>
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
                {activeFormula?.stockAItems?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed var(--border-subtle)' }}>
                    <span>{item.name}</span>
                    <strong style={{ color: 'var(--primary-800)' }}>{item.gramsPer10LStock} g</strong>
                  </div>
                ))}
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
                {activeFormula?.stockBItems?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed var(--border-subtle)' }}>
                    <span>{item.name}</span>
                    <strong style={{ color: 'var(--info-text)' }}>{item.gramsPer10LStock} g</strong>
                  </div>
                ))}
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
            <strong>Tại sao phải chia Can A và Can B?</strong> {activeFormula?.chemicalIncompatibilityReason || 'Canxi trong Can A nếu gặp Lân và Sunfat trong Can B ở nồng độ đậm đặc sẽ phản ứng kết tủa thành thạch cao không tan (CaSO4 và Ca3(PO4)2), làm nghẹt máng NFT và cây bị cháy mép lá.'}
          </div>
        </div>

        </div>
      )}

      {/* Channels Tab */}
      {activeTab === 'channels' && (
        <div className="clean-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card-header" style={{ marginBottom: 0 }}>
            <div>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="var(--primary-600)" />
                <span>Máng trồng của {selectedRes.name.split('-')[0].trim()}</span>
              </h3>
              <p className="card-subtitle">
                Mỗi máng gắn với 1 lô cây. Một bể có thể cấp dung dịch cho nhiều lô đồng thời.
              </p>
            </div>
            <span className="badge badge-neutral">
              {resChannels.filter(c => c.status === 'active').length} máng đang hoạt động
            </span>
          </div>

          {/* Channel table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)' }}>
                  {['Máng', 'Lô cây', 'Giống', 'Số slot', 'Cây đang trồng', 'Trạng thái', 'Ghi chú'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.75rem', borderBottom: '1px solid var(--border-subtle)', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resChannels.map((ch, idx) => {
                  const batch = batches.find(b => b.id === ch.batchId);
                  const occupancy = ch.slotCount > 0 ? Math.round((ch.activePlants / ch.slotCount) * 100) : 0;
                  return (
                    <tr key={ch.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-main)' }}>{ch.name}</td>
                      <td style={{ padding: '10px 12px' }}>
                        {batch
                          ? <span className="mono" style={{ fontSize: '0.75rem', background: 'var(--primary-50)', color: 'var(--primary-700)', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>{batch.batchCode}</span>
                          : <span style={{ color: 'var(--text-subtle)', fontStyle: 'italic' }}>—</span>
                        }
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{batch?.cultivarName || '—'}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)', textAlign: 'center' }}>{ch.slotCount}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{ch.activePlants}</span>
                          <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--border-subtle)', borderRadius: '2px', minWidth: '50px' }}>
                            <div style={{ height: '100%', width: `${occupancy}%`, backgroundColor: ch.status === 'empty' ? 'var(--border-medium)' : 'var(--primary-600)', borderRadius: '2px' }} />
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>{occupancy}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className={`badge ${ch.status === 'active' ? 'badge-success' : ch.status === 'empty' ? 'badge-neutral' : 'badge-warning'}`}>
                          {ch.status === 'active' ? 'Đang trồng' : ch.status === 'empty' ? 'Trống' : 'Bảo trì'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-subtle)', fontSize: '0.75rem' }}>{ch.notes || '—'}</td>
                    </tr>
                  );
                })}
                {resChannels.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                      Chưa có máng nào được cấu hình cho bể này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          {resChannels.length > 0 && (
            <div style={{ display: 'flex', gap: '20px', padding: '10px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
              <span>Tổng slot: <strong>{resChannels.reduce((s, c) => s + c.slotCount, 0)}</strong></span>
              <span>Tổng cây đang trồng: <strong>{resChannels.reduce((s, c) => s + c.activePlants, 0)}</strong></span>
              <span>Máng trống: <strong>{resChannels.filter(c => c.status === 'empty').length}</strong></span>
              <span>Số lô đang dùng bể này: <strong>{new Set(resChannels.filter(c => c.batchId).map(c => c.batchId)).size}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="clean-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card-header" style={{ marginBottom: 0 }}>
            <div>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} color="var(--primary-600)" />
                <span>Lịch sử xả bể — {selectedRes.name.split('-')[0].trim()}</span>
              </h3>
              <p className="card-subtitle">
                Mỗi lần xả & thay dung dịch giữa 2 lô đều được ghi nhận để truy xuất nguồn gốc.
              </p>
            </div>
          </div>

          {resDrainHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-subtle)', fontStyle: 'italic', fontSize: '0.8125rem' }}>
              Chưa có sự kiện xả bể nào được ghi nhận.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {resDrainHistory.map(ev => {
                const reasonLabel: Record<string, string> = {
                  end_of_batch: 'Kết thúc lô',
                  scheduled_replacement: 'Thay định kỳ',
                  contamination: 'Nhiễm bẩn',
                  other: 'Khác'
                };
                return (
                  <div key={ev.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className="badge badge-warning">{reasonLabel[ev.reason]}</span>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                          Xả {ev.volumeDrainedLiters}L — {ev.drainDate}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Thực hiện: {ev.operator}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>pH cuối: <strong>{ev.finalPh}</strong></span>
                      <span>EC cuối: <strong>{ev.finalEc} mS/cm</strong></span>
                      <span>DO cuối: <strong>{ev.finalDo} mg/L</strong></span>
                    </div>
                    {ev.notes && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                        {ev.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
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

      {/* Drain Reservoir Modal */}
      {isDrainModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDrainModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                <Trash2 size={18} color="var(--danger)" style={{ display: 'inline', marginRight: '8px' }} />
                Xả bể và thay dung dịch — {selectedRes.name.split('-')[0].trim()}
              </h3>
              <button 
                onClick={() => setIsDrainModalOpen(false)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '1.25rem' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleDrainSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: '0.8rem', color: '#92400e' }}>
                  <strong>Lưu ý:</strong> Thao tác này sẽ xả toàn bộ {selectedRes.currentVolumeLiters}L dung dịch hiện tại. Đảm bảo đã ghi nhận số đo cuối cùng (pH, EC, DO) trước khi xả.
                </div>

                {/* Current final readings */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '10px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>pH cuối</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{selectedRes.currentPh.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>EC cuối (mS/cm)</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{selectedRes.currentEc.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>DO cuối (mg/L)</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{selectedRes.currentDo.toFixed(2)}</div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Lý do xả bể</label>
                  <select 
                    className="form-select" 
                    value={drainReason} 
                    onChange={e => setDrainReason(e.target.value as any)}
                  >
                    <option value="end_of_batch">Kết thúc lô trồng</option>
                    <option value="scheduled_replacement">Thay dung dịch định kỳ</option>
                    <option value="contamination">Phát hiện nhiễm bẩn / nấm</option>
                    <option value="other">Lý do khác</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Người thực hiện</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={drainOperator} 
                    onChange={e => setDrainOperator(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ghi chú (trạng thái bể, vệ sinh, ...)</label>
                  <textarea 
                    className="form-input" 
                    rows={3}
                    value={drainNotes} 
                    onChange={e => setDrainNotes(e.target.value)} 
                    placeholder="Ví dụ: Bể sạch, không có cặn. Vệ sinh bằng H2O2 0.5% sau đó xả lại bằng nước sạch."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => setIsDrainModalOpen(false)} 
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn"
                  style={{ backgroundColor: 'var(--danger)', color: '#ffffff', border: 'none' }}
                >
                  Xác nhận xả bể
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

