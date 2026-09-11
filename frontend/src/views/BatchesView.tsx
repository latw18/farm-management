import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2,
  TrendingUp,
  Ruler,
  CheckCircle2
} from 'lucide-react';
import type { CropBatch, Cultivar, Reservoir, GrowthStage } from '../types/farm';
import { LifecycleProgressBar } from '../components/LifecycleProgressBar';
import { AgronomicTooltip } from '../components/AgronomicTooltip';

interface BatchesViewProps {
  batches: CropBatch[];
  cultivars: Cultivar[];
  reservoirs: Reservoir[];
  onAddBatch: (batch: Omit<CropBatch, 'id' | 'status'>) => void;
  onDeleteBatch: (id: string) => void;
  onSelectBatchForAI: (batch: CropBatch) => void;
  onAddObservation?: (batchId: string, obs: { avgLeafCount: number; avgHeightCm: number; sampleWeightG: number; notes?: string }) => void;
  onAdvanceStage?: (batchId: string, newStage: GrowthStage) => void;
}

export const BatchesView: React.FC<BatchesViewProps> = ({
  batches,
  cultivars,
  reservoirs,
  onAddBatch,
  onDeleteBatch,
  onSelectBatchForAI,
  onAddObservation,
  onAdvanceStage
}) => {
  const [filterStage, setFilterStage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Observation Modal state
  const [obsBatch, setObsBatch] = useState<CropBatch | null>(null);
  const [obsLeaves, setObsLeaves] = useState<number>(14);
  const [obsHeight, setObsHeight] = useState<number>(14);
  const [obsWeight, setObsWeight] = useState<number>(120);
  const [obsNotes, setObsNotes] = useState<string>('');

  // Form State for creating batch
  const [batchCode, setBatchCode] = useState(`LET-2026-00${batches.length + 1}`);
  const [cultivarId, setCultivarId] = useState(cultivars[0]?.id || '');
  const [systemType] = useState<'NFT'>('NFT');
  const [reservoirId, setReservoirId] = useState(reservoirs[0]?.id || '');
  const [plantQuantity, setPlantQuantity] = useState(500);
  const [seedDate, setSeedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [density, setDensity] = useState(25);
  const [notes, setNotes] = useState('');

  const selectedCultivar = cultivars.find(c => c.id === cultivarId) || cultivars[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const sDate = new Date(seedDate);
    const expDate = new Date(sDate);
    expDate.setDate(sDate.getDate() + (selectedCultivar?.targetCycleDays || 35));

    const transDate = new Date(sDate);
    transDate.setDate(sDate.getDate() + 12);

    const res = reservoirs.find(r => r.id === reservoirId);

    onAddBatch({
      batchCode,
      cultivarId,
      cultivarName: selectedCultivar?.name || 'Xà lách',
      cropName: selectedCultivar?.cropName || 'Xà lách',
      systemType,
      reservoirId,
      reservoirName: res?.name || 'Bể A',
      plantQuantity: Number(plantQuantity),
      currentQuantity: Number(plantQuantity),
      seedDate,
      transplantDate: transDate.toISOString().split('T')[0],
      expectedHarvestDate: expDate.toISOString().split('T')[0],
      currentStage: 'seedling',
      densityPlantsPerM2: Number(density),
      notes,
      lastObservation: {
        date: seedDate,
        avgLeafCount: 4,
        avgHeightCm: 4.5,
        sampleWeightG: 15.0
      }
    });

    setIsCreateModalOpen(false);
    setBatchCode(`LET-2026-00${batches.length + 2}`);
  };

  const handleOpenObservationModal = (batch: CropBatch) => {
    setObsBatch(batch);
    setObsLeaves(batch.lastObservation?.avgLeafCount || 10);
    setObsHeight(batch.lastObservation?.avgHeightCm || 10);
    setObsWeight(batch.lastObservation?.sampleWeightG || 80);
    setObsNotes(batch.lastObservation?.notes || '');
  };

  const handleSaveObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsBatch) return;
    if (onAddObservation) {
      onAddObservation(obsBatch.id, {
        avgLeafCount: Number(obsLeaves),
        avgHeightCm: Number(obsHeight),
        sampleWeightG: Number(obsWeight),
        notes: obsNotes
      });
    }
    setObsBatch(null);
  };

  const filteredBatches = batches.filter(b => {
    let matchStage = true;
    if (filterStage === 'active') matchStage = b.status === 'active';
    else if (filterStage === 'harvested') matchStage = b.status === 'harvested';
    else if (filterStage !== 'all') matchStage = b.currentStage === filterStage && b.status === 'active';

    const matchQuery = b.batchCode.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       b.cultivarName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStage && matchQuery;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Filter and Actions Bar */}
      <div className="page-toolbar">
        <div className="toolbar-group">
          {/* Stage Tabs */}
          <div style={{ display: 'flex', backgroundColor: '#ffffff', padding: '2px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'active', label: 'Đang trồng' },
              { id: 'seedling', label: 'Cây non' },
              { id: 'vegetative', label: 'Sinh dưỡng' },
              { id: 'pre_harvest', label: 'Sắp thu hoạch' },
              { id: 'harvested', label: 'Đã thu hoạch' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStage(tab.id)}
                style={{
                  height: '32px',
                  padding: '0 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: filterStage === tab.id ? 'var(--primary-600)' : 'transparent',
                  color: filterStage === tab.id ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={15} color="var(--text-subtle)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Tìm mã lô, giống cây..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '32px', height: '36px', fontSize: '0.8125rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary"
          style={{ height: '36px', boxSizing: 'border-box' }}
        >
          <Plus size={16} />
          <span>Tạo lô trồng mới</span>
        </button>
      </div>

      {/* Batches Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '18px'
      }}>
        {filteredBatches.map(batch => {
          const cultivar = cultivars.find(c => c.id === batch.cultivarId);
          const isHarvested = batch.status === 'harvested';

          return (
            <div key={batch.id} className="clean-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', opacity: isHarvested ? 0.85 : 1 }}>
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-subtle)' }}>
                      {batch.batchCode}
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                      {batch.systemType}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
                    {batch.cultivarName}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    {cultivar?.scientificName}
                  </div>
                </div>

                {isHarvested ? (
                  <span className="badge badge-neutral">Đã thu hoạch</span>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <select
                      value={batch.currentStage}
                      onChange={e => onAdvanceStage && onAdvanceStage(batch.id, e.target.value as GrowthStage)}
                      className="form-select"
                      style={{ fontSize: '0.75rem', padding: '2px 8px', height: '28px' }}
                    >
                      <option value="seedling">Cây con</option>
                      <option value="vegetative">Sinh dưỡng</option>
                      <option value="pre_harvest">Sắp thu hoạch</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Lifecycle Progress Bar with countdown and milestones */}
              <LifecycleProgressBar
                seedDate={batch.seedDate}
                expectedHarvestDate={batch.expectedHarvestDate}
                currentStage={isHarvested ? 'harvested' : batch.currentStage}
                targetCycleDays={cultivar?.targetCycleDays || 35}
              />

              {/* Metrics Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                backgroundColor: 'var(--bg-subtle)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Số cây</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{batch.currentQuantity}</div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                    <span>Mật độ</span>
                    <AgronomicTooltip 
                      title="Mật độ gieo trồng" 
                      optimalRange="25 - 35 cây/m²" 
                      explanation="Mật độ cây/m² trên giàn máng NFT giúp tối ưu hóa quang hợp và đối lưu không khí, tránh tranh chấp ánh sáng và giảm nguy cơ nấm bệnh."
                    />
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{batch.densityPlantsPerM2} cây/m²</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Dự kiến thu</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>{batch.expectedHarvestDate.slice(5)}</div>
                </div>
              </div>

              {/* Latest Observation Box */}
              {batch.lastObservation ? (
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 10px',
                  fontSize: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-subtle)', marginRight: '6px' }}>Đo {batch.lastObservation.date.slice(5)}:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{batch.lastObservation.avgLeafCount} lá</strong> · <strong>{batch.lastObservation.avgHeightCm} cm</strong> · <strong style={{ color: 'var(--primary-700)' }}>{batch.lastObservation.sampleWeightG} g</strong>
                  </div>
                  {!isHarvested && (
                    <button
                      type="button"
                      onClick={() => handleOpenObservationModal(batch)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.7rem', padding: '2px 6px', color: 'var(--primary-700)' }}
                    >
                      <Ruler size={12} />
                      <span>Đo mới</span>
                    </button>
                  )}
                </div>
              ) : !isHarvested ? (
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 10px',
                  fontSize: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: 'var(--text-subtle)'
                }}>
                  <span>Chưa có số đo mẫu sinh trưởng</span>
                  <button
                    type="button"
                    onClick={() => handleOpenObservationModal(batch)}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.7rem', padding: '2px 6px', color: 'var(--primary-700)' }}
                  >
                    <Ruler size={12} />
                    <span>Ghi ngay</span>
                  </button>
                </div>
              ) : null}

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                <button
                  onClick={() => onDeleteBatch(batch.id)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--danger-text)', padding: '4px 6px' }}
                  title="Xóa lô này"
                >
                  <Trash2 size={15} />
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {!isHarvested && (
                    <button
                      onClick={() => handleOpenObservationModal(batch)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Ruler size={14} color="var(--text-muted)" />
                      <span>Ghi số đo</span>
                    </button>
                  )}

                  <button
                    onClick={() => onSelectBatchForAI(batch)}
                    className="btn btn-primary btn-sm"
                  >
                    <TrendingUp size={14} />
                    <span>Dự báo AI</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Observation Modal */}
      {obsBatch && (
        <div className="modal-overlay" onClick={() => setObsBatch(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Ghi nhận sinh trưởng lô: {obsBatch.batchCode} ({obsBatch.cultivarName})
              </h3>
              <button 
                onClick={() => setObsBatch(null)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '1.25rem' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveObservation}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Số lượng lá thật trung bình (lá)</label>
                    <input 
                      type="number" 
                      min="2"
                      max="40"
                      className="form-input" 
                      value={obsLeaves} 
                      onChange={e => setObsLeaves(Number(e.target.value))} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Chiều cao tán trung bình (cm)</label>
                    <input 
                      type="number" 
                      step="0.5"
                      min="2"
                      max="40"
                      className="form-input" 
                      value={obsHeight} 
                      onChange={e => setObsHeight(Number(e.target.value))} 
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Cân nặng mẫu tươi đo được (g/cây)</label>
                    <input 
                      type="number" 
                      step="0.5"
                      min="5"
                      max="400"
                      className="form-input" 
                      value={obsWeight} 
                      onChange={e => setObsWeight(Number(e.target.value))} 
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Ghi chú tình trạng rễ & lá</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Rễ trắng tốt, không có dấu hiệu cháy mép lá..."
                      value={obsNotes} 
                      onChange={e => setObsNotes(e.target.value)} 
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => setObsBatch(null)} 
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  <CheckCircle2 size={16} />
                  <span>Lưu kết quả đo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Batch Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Tạo lô trồng mới
              </h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '1.25rem' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Mã lô</label>
                    <input 
                      type="text" 
                      className="form-input mono" 
                      value={batchCode} 
                      onChange={e => setBatchCode(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Giống xà lách</label>
                    <select 
                      className="form-select" 
                      value={cultivarId} 
                      onChange={e => setCultivarId(e.target.value)}
                    >
                      {cultivars.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.targetCycleDays} ngày)</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hệ thống canh tác</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value="NFT (Máng hồi lưu tuần hoàn)" 
                      disabled 
                      style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' }} 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bể dinh dưỡng</label>
                    <select 
                      className="form-select" 
                      value={reservoirId} 
                      onChange={e => setReservoirId(e.target.value)}
                    >
                      {reservoirs.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Số lượng cây</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={plantQuantity} 
                      onChange={e => setPlantQuantity(Number(e.target.value))} 
                      min="50" 
                      max="5000" 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mật độ (cây/m²)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={density} 
                      onChange={e => setDensity(Number(e.target.value))} 
                      min="10" 
                      max="50" 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ngày gieo hạt</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={seedDate} 
                      onChange={e => setSeedDate(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ghi chú</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={notes} 
                      onChange={e => setNotes(e.target.value)} 
                      placeholder="Vị trí máng, hạt giống..." 
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)} 
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Lưu lô trồng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
