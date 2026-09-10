import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2,
  TrendingUp
} from 'lucide-react';
import type { CropBatch, Cultivar, Reservoir } from '../types/farm';

interface BatchesViewProps {
  batches: CropBatch[];
  cultivars: Cultivar[];
  reservoirs: Reservoir[];
  onAddBatch: (batch: Omit<CropBatch, 'id' | 'status'>) => void;
  onDeleteBatch: (id: string) => void;
  onSelectBatchForAI: (batch: CropBatch) => void;
}

export const BatchesView: React.FC<BatchesViewProps> = ({
  batches,
  cultivars,
  reservoirs,
  onAddBatch,
  onDeleteBatch,
  onSelectBatchForAI
}) => {
  const [filterStage, setFilterStage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
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

    setIsModalOpen(false);
    setBatchCode(`LET-2026-00${batches.length + 2}`);
  };

  const filteredBatches = batches.filter(b => {
    const matchStage = filterStage === 'all' || b.currentStage === filterStage || (filterStage === 'active' && b.status === 'active');
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
              { id: 'pre_harvest', label: 'Sắp thu hoạch' }
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
          onClick={() => setIsModalOpen(true)}
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '18px'
      }}>
        {filteredBatches.map(batch => {
          const cultivar = cultivars.find(c => c.id === batch.cultivarId);
          const seedTime = new Date(batch.seedDate).getTime();
          const expTime = new Date(batch.expectedHarvestDate).getTime();
          const nowTime = new Date().getTime();
          const ageDays = Math.max(1, Math.round((nowTime - seedTime) / (1000 * 3600 * 24)));
          const progress = Math.min(100, Math.max(5, Math.round(((nowTime - seedTime) / (expTime - seedTime)) * 100)));

          return (
            <div key={batch.id} className="clean-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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

                <span className={`badge ${
                  batch.currentStage === 'pre_harvest' ? 'badge-warning' :
                  batch.currentStage === 'vegetative' ? 'badge-success' : 'badge-info'
                }`}>
                  {batch.currentStage === 'vegetative' ? 'Sinh dưỡng' :
                   batch.currentStage === 'seedling' ? 'Cây non' :
                   batch.currentStage === 'pre_harvest' ? 'Sắp thu hoạch' : batch.currentStage}
                </span>
              </div>

              {/* Progress & Days */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', color: 'var(--text-subtle)' }}>
                  <span>Tuổi cây: <strong style={{ color: 'var(--text-main)' }}>{ageDays} ngày</strong> / {cultivar?.targetCycleDays || 35} ngày</span>
                  <span style={{ fontWeight: 600, color: 'var(--primary-700)' }}>{progress}%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${progress}%`,
                    backgroundColor: 'var(--primary-600)',
                    borderRadius: 'var(--radius-full)'
                  }} />
                </div>
              </div>

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
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Mật độ</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{batch.densityPlantsPerM2} cây/m²</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Dự kiến thu</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>{batch.expectedHarvestDate.slice(5)}</div>
                </div>
              </div>

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

                <button
                  onClick={() => onSelectBatchForAI(batch)}
                  className="btn btn-secondary btn-sm"
                >
                  <TrendingUp size={14} color="var(--primary-700)" />
                  <span>Dự báo sản lượng</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Batch Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Tạo lô trồng mới
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
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
                  onClick={() => setIsModalOpen(false)} 
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
