import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Calendar, 
  Leaf, 
  Zap, 
  Thermometer, 
  Droplets, 
  AlertTriangle, 
  Lightbulb, 
  FlaskConical, 
  CheckCircle2 
} from 'lucide-react';
import type { CropBatch, Reservoir, Cultivar, AIPredictionResult } from '../types/farm';
import { predictLettuceYield } from '../services/aiPredictor';

interface AIPredictorViewProps {
  batches: CropBatch[];
  selectedBatch?: CropBatch | null;
  reservoirs?: Reservoir[];
  cultivars?: Cultivar[];
}

const getFeatureVisuals = (featureName: string) => {
  if (featureName.includes('Tuổi')) {
    return {
      icon: <Calendar size={15} color="var(--primary-700)" />,
      bg: 'var(--primary-50)'
    };
  }
  if (featureName.includes('lá')) {
    return {
      icon: <Leaf size={15} color="var(--primary-700)" />,
      bg: 'var(--primary-50)'
    };
  }
  if (featureName.includes('EC') || featureName.includes('dinh dưỡng')) {
    return {
      icon: <Zap size={15} color="#d97706" />,
      bg: '#fffbeb'
    };
  }
  if (featureName.includes('Nhiệt độ')) {
    return {
      icon: <Thermometer size={15} color="#0284c7" />,
      bg: '#f0f9ff'
    };
  }
  return {
    icon: <Droplets size={15} color="#4f46e5" />,
    bg: '#eef2ff'
  };
};

const getRecVisuals = (rec: string) => {
  if (rec.includes('⚠️')) {
    return {
      icon: <AlertTriangle size={15} color="#d97706" />,
      bg: '#fffbeb',
      border: '#fde68a',
      text: rec.replace('⚠️', '').trim(),
      category: 'Cảnh báo rủi ro',
      badgeClass: 'badge-warning'
    };
  }
  if (rec.includes('💡')) {
    return {
      icon: <Lightbulb size={15} color="#4f46e5" />,
      bg: '#eef2ff',
      border: '#c7d2fe',
      text: rec.replace('💡', '').trim(),
      category: 'Tối ưu dinh dưỡng',
      badgeClass: 'badge-neutral'
    };
  }
  if (rec.includes('🧪')) {
    return {
      icon: <FlaskConical size={15} color="#0284c7" />,
      bg: '#f0f9ff',
      border: '#bae6fd',
      text: rec.replace('🧪', '').trim(),
      category: 'Cân chỉnh pH',
      badgeClass: 'badge-info'
    };
  }
  if (rec.includes('🌡️')) {
    return {
      icon: <Thermometer size={15} color="#dc2626" />,
      bg: '#fef2f2',
      border: '#fecdd3',
      text: rec.replace('🌡️', '').trim(),
      category: 'Kiểm soát nhiệt độ',
      badgeClass: 'badge-danger'
    };
  }
  return {
    icon: <CheckCircle2 size={15} color="var(--primary-700)" />,
    bg: 'var(--primary-50)',
    border: 'var(--primary-200)',
    text: rec.replace('✅', '').trim(),
    category: 'Trạng thái tối ưu',
    badgeClass: 'badge-success'
  };
};

export const AIPredictorView: React.FC<AIPredictorViewProps> = ({
  batches,
  selectedBatch,
  reservoirs = [],
  cultivars = []
}) => {
  const activeBatches = batches.filter(b => b.status === 'active');

  // Selected Batch
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    selectedBatch ? selectedBatch.id : (activeBatches[0]?.id || '')
  );

  const currentBatch = batches.find(b => b.id === selectedBatchId) || activeBatches[0];
  const currentCultivar = cultivars.find(c => c.id === currentBatch?.cultivarId);
  const currentReservoir = reservoirs.find(r => r.id === currentBatch?.reservoirId);

  // Calculation Mode: 'live' (Real measured data) vs 'custom' (What-if scenario simulation)
  const [mode, setMode] = useState<'live' | 'custom'>('live');

  // Input Parameters
  const [plantAgeDays, setPlantAgeDays] = useState<number>(27);
  const [leafCount, setLeafCount] = useState<number>(16);
  const [plantHeightCm, setPlantHeightCm] = useState<number>(15);
  const [avgEc, setAvgEc] = useState<number>(1.72);
  const [avgPh, setAvgPh] = useState<number>(5.85);
  const [avgWaterTemp, setAvgWaterTemp] = useState<number>(22.4);
  const [expectedPlants, setExpectedPlants] = useState<number>(600);

  // Result
  const [result, setResult] = useState<AIPredictionResult | null>(null);

  // Function to load live parameters from batch and reservoir
  const loadLiveData = (batch: CropBatch) => {
    const seedTime = new Date(batch.seedDate).getTime();
    const nowTime = new Date().getTime();
    const age = Math.max(1, Math.round((nowTime - seedTime) / (1000 * 3600 * 24)));
    
    const leaves = batch.lastObservation?.avgLeafCount || Math.max(4, Math.round(age * 0.6));
    const height = batch.lastObservation?.avgHeightCm || Math.max(4, Math.round(age * 0.55));
    const res = reservoirs.find(r => r.id === batch.reservoirId);
    const ec = res ? res.currentEc : 1.72;
    const ph = res ? res.currentPh : 5.85;
    const temp = res ? res.currentWaterTemp : 22.4;
    const plants = batch.currentQuantity;

    setPlantAgeDays(age);
    setLeafCount(leaves);
    setPlantHeightCm(height);
    setAvgEc(ec);
    setAvgPh(ph);
    setAvgWaterTemp(temp);
    setExpectedPlants(plants);

    // Compute prediction
    runPrediction(batch, age, leaves, height, ec, ph, temp, plants);
  };

  const runPrediction = (
    batch = currentBatch,
    age = plantAgeDays,
    leaves = leafCount,
    height = plantHeightCm,
    ec = avgEc,
    ph = avgPh,
    temp = avgWaterTemp,
    plants = expectedPlants
  ) => {
    if (!batch) return;
    const res = predictLettuceYield({
      batchId: batch.id,
      batchCode: batch.batchCode,
      cultivarName: batch.cultivarName,
      plantAgeDays: age,
      leafCount: leaves,
      plantHeightCm: height,
      avgEc: ec,
      avgPh: ph,
      avgWaterTemp: temp,
      expectedPlants: plants
    });
    setResult(res);
  };

  // Sync whenever selected batch changes
  useEffect(() => {
    if (currentBatch) {
      loadLiveData(currentBatch);
      setMode('live');
    }
  }, [selectedBatchId]);

  if (!currentBatch) {
    return (
      <div className="clean-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p>Chưa có lô cây trồng nào để dự báo sản lượng.</p>
      </div>
    );
  }

  // Days left to harvest
  const expHarvestDate = new Date(currentBatch.expectedHarvestDate);
  const today = new Date();
  const daysLeft = Math.max(0, Math.ceil((expHarvestDate.getTime() - today.getTime()) / (1000 * 3600 * 24)));

  // Target standard weight from cultivar
  const standardWeightG = currentCultivar?.expectedWeightG || 190;
  const predictedWeightG = result?.predictedFreshWeightG || 190;
  const completionPercent = Math.round((predictedWeightG / standardWeightG) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Standardized Top Toolbar: Batch Selection & Mode Switcher */}
      <div className="page-toolbar">
        {/* Left: Batch Selector */}
        <div className="toolbar-group">
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Chọn lô cây:
          </label>
          <select 
            className="form-select"
            style={{ width: '260px', height: '36px', fontSize: '0.8125rem', boxSizing: 'border-box' }}
            value={selectedBatchId}
            onChange={e => setSelectedBatchId(e.target.value)}
          >
            {activeBatches.map(b => (
              <option key={b.id} value={b.id}>
                {b.batchCode} - {b.cultivarName} ({b.currentQuantity} cây)
              </option>
            ))}
          </select>
        </div>

        {/* Right: Mode Toggle */}
        <div className="toolbar-group">
          <div style={{ display: 'flex', backgroundColor: '#ffffff', padding: '2px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => {
                setMode('live');
                loadLiveData(currentBatch);
              }}
              style={{
                height: '32px',
                padding: '0 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: mode === 'live' ? 'var(--primary-600)' : 'transparent',
                color: mode === 'live' ? '#ffffff' : 'var(--text-muted)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Dữ liệu thực tế của lô
            </button>
            <button
              onClick={() => setMode('custom')}
              style={{
                height: '32px',
                padding: '0 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: mode === 'custom' ? 'var(--primary-600)' : 'transparent',
                color: mode === 'custom' ? '#ffffff' : 'var(--text-muted)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Thử nghiệm kịch bản (What-if)
            </button>
          </div>

          {mode === 'custom' && (
            <button
              onClick={() => {
                loadLiveData(currentBatch);
                setMode('live');
              }}
              className="btn btn-secondary btn-sm"
              style={{ height: '36px' }}
              title="Đặt lại về thông số thực tế của lô"
            >
              <RotateCcw size={14} />
              <span>Khôi phục gốc</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Standardized KPI Grid: 4 Clean Metrics */}
      <div className="kpi-grid">
        {/* Metric 1: Projected Weight */}
        <div className="kpi-card">
          <div style={{ flex: 1 }}>
            <div className="kpi-label">Trọng lượng dự kiến tại thu hoạch</div>
            <div className="kpi-value">
              {predictedWeightG} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary-700)' }}>g / cây</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
              Chuẩn giống: {standardWeightG}g ({completionPercent >= 100 ? `+${completionPercent - 100}%` : `${completionPercent - 100}%`})
            </div>
          </div>
        </div>

        {/* Metric 2: Total Batch Yield */}
        <div className="kpi-card">
          <div style={{ flex: 1 }}>
            <div className="kpi-label">Ước tính sản lượng cả lô ({expectedPlants} cây)</div>
            <div className="kpi-value" style={{ color: 'var(--info-text)' }}>
              {result?.totalBatchYieldKg || 0} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>kg</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
              Tính trên 95% tỷ lệ cây đạt chuẩn
            </div>
          </div>
        </div>

        {/* Metric 3: Current Sample Weight */}
        <div className="kpi-card">
          <div style={{ flex: 1 }}>
            <div className="kpi-label">Khối lượng đo mẫu gần nhất</div>
            <div className="kpi-value">
              {currentBatch.lastObservation?.sampleWeightG || 142} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>g / cây</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
              Đã đạt ~{Math.round(((currentBatch.lastObservation?.sampleWeightG || 142) / predictedWeightG) * 100)}% trọng lượng cuối
            </div>
          </div>
        </div>

        {/* Metric 4: Days Left */}
        <div className="kpi-card">
          <div style={{ flex: 1 }}>
            <div className="kpi-label">Thời gian đến thu hoạch</div>
            <div className="kpi-value">
              {daysLeft} <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-muted)' }}>ngày nữa</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
              Dự kiến ngày {currentBatch.expectedHarvestDate.slice(5)}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Parameter Controls (Left) vs Analysis & Recommendations (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1.25fr', gap: '20px' }}>
        
        {/* Left Column: Parameter Form */}
        <div className="clean-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card-header" style={{ marginBottom: '8px' }}>
            <div>
              <h3 className="card-title">
                {mode === 'live' ? 'Thông số canh tác thực tế của lô' : 'Điều chỉnh kịch bản giả định (What-If)'}
              </h3>
              <p className="card-subtitle">
                {mode === 'live' 
                  ? 'Dữ liệu được cập nhật tự động từ bể dung dịch và nhật ký đo mẫu' 
                  : 'Thay đổi các thông số để xem sự ảnh hưởng đến năng suất lúc thu hoạch'}
              </p>
            </div>
            <span className={`badge ${mode === 'live' ? 'badge-success' : 'badge-warning'}`}>
              {mode === 'live' ? 'Dữ liệu thực tế' : 'Kịch bản thử nghiệm'}
            </span>
          </div>

          {/* Context Info Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-subtle)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}>
            <span>Giống: <strong style={{ color: 'var(--text-main)' }}>{currentBatch.cultivarName}</strong></span>
            <span>Hệ thống: <strong style={{ color: 'var(--text-main)' }}>NFT tuần hoàn</strong></span>
            <span>Bể cấp: <strong style={{ color: 'var(--text-main)' }}>{currentReservoir?.name.split('-')[0].trim() || 'Bể Tuần Hoàn 01'}</strong></span>
          </div>

          {/* Group 1: Plant Morphology */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-800)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
              1. Đặc điểm sinh trắc học cây trồng
            </div>

            {/* Age */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tuổi cây (Ngày sau khi gieo)</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{plantAgeDays} ngày</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="42" 
                value={plantAgeDays} 
                disabled={mode === 'live'}
                onChange={e => {
                  setPlantAgeDays(Number(e.target.value));
                  runPrediction(currentBatch, Number(e.target.value), leafCount, plantHeightCm, avgEc, avgPh, avgWaterTemp, expectedPlants);
                }}
                style={{ width: '100%', accentColor: 'var(--primary-600)', cursor: mode === 'live' ? 'default' : 'pointer' }}
              />
            </div>

            {/* Leaves and Height Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Số lá thật</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{leafCount} lá</span>
                </div>
                <input 
                  type="range" 
                  min="4" 
                  max="28" 
                  value={leafCount} 
                  disabled={mode === 'live'}
                  onChange={e => {
                    setLeafCount(Number(e.target.value));
                    runPrediction(currentBatch, plantAgeDays, Number(e.target.value), plantHeightCm, avgEc, avgPh, avgWaterTemp, expectedPlants);
                  }}
                  style={{ width: '100%', accentColor: 'var(--primary-600)', cursor: mode === 'live' ? 'default' : 'pointer' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Chiều cao tán</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{plantHeightCm} cm</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="26" 
                  value={plantHeightCm} 
                  disabled={mode === 'live'}
                  onChange={e => {
                    setPlantHeightCm(Number(e.target.value));
                    runPrediction(currentBatch, plantAgeDays, leafCount, Number(e.target.value), avgEc, avgPh, avgWaterTemp, expectedPlants);
                  }}
                  style={{ width: '100%', accentColor: 'var(--primary-600)', cursor: mode === 'live' ? 'default' : 'pointer' }}
                />
              </div>
            </div>
          </div>

          {/* Group 2: Water & Nutrient Parameters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--info-text)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
              2. Chất lượng nước & Nồng độ dinh dưỡng
            </div>

            {/* EC */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Độ dẫn dinh dưỡng EC (Chuẩn: 1.5 - 1.8 mS/cm)</span>
                <span style={{ fontWeight: 600, color: 'var(--info-text)' }}>{avgEc.toFixed(2)} mS/cm</span>
              </div>
              <input 
                type="range" 
                min="0.8" 
                max="2.6" 
                step="0.05"
                value={avgEc} 
                disabled={mode === 'live'}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setAvgEc(val);
                  runPrediction(currentBatch, plantAgeDays, leafCount, plantHeightCm, val, avgPh, avgWaterTemp, expectedPlants);
                }}
                style={{ width: '100%', accentColor: 'var(--info)', cursor: mode === 'live' ? 'default' : 'pointer' }}
              />
            </div>

            {/* pH & Temperature Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>pH (Chuẩn: 5.6 - 6.2)</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{avgPh.toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  min="4.8" 
                  max="7.2" 
                  step="0.05"
                  value={avgPh} 
                  disabled={mode === 'live'}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setAvgPh(val);
                    runPrediction(currentBatch, plantAgeDays, leafCount, plantHeightCm, avgEc, val, avgWaterTemp, expectedPlants);
                  }}
                  style={{ width: '100%', accentColor: 'var(--primary-600)', cursor: mode === 'live' ? 'default' : 'pointer' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Nhiệt độ nước</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{avgWaterTemp.toFixed(1)}°C</span>
                </div>
                <input 
                  type="range" 
                  min="18" 
                  max="30" 
                  step="0.5"
                  value={avgWaterTemp} 
                  disabled={mode === 'live'}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setAvgWaterTemp(val);
                    runPrediction(currentBatch, plantAgeDays, leafCount, plantHeightCm, avgEc, avgPh, val, expectedPlants);
                  }}
                  style={{ width: '100%', accentColor: 'var(--text-muted)', cursor: mode === 'live' ? 'default' : 'pointer' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Factor Impact & Practical Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Factor Impact Breakdown Card */}
          <div className="clean-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="card-header" style={{ marginBottom: 0 }}>
              <div>
                <h3 className="card-title">Mức độ tác động của các yếu tố đến năng suất</h3>
                <p className="card-subtitle">
                  Tỷ trọng đóng góp và đánh giá tác động của từng chỉ số đối với sinh khối
                </p>
              </div>
              <span className="badge badge-neutral" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                Tổng tỷ trọng: 100%
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(result?.featureContributions || []).map((item, idx) => {
                const visual = getFeatureVisuals(item.feature);
                const isPositive = item.impact === 'positive';

                return (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    {/* Header Row: Icon + Feature Name + Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: visual.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {visual.icon}
                        </div>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {item.feature}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.6875rem',
                          padding: '1px 7px',
                          borderRadius: '9999px',
                          fontWeight: 500,
                          backgroundColor: isPositive ? 'var(--badge-success-bg)' : 'var(--badge-warning-bg)',
                          color: isPositive ? 'var(--badge-success-text)' : 'var(--badge-warning-text)',
                          border: `1px solid ${isPositive ? 'var(--badge-success-border)' : 'var(--badge-warning-border)'}`
                        }}>
                          {isPositive ? 'Thuận lợi' : 'Cần lưu ý'}
                        </span>
                        <span style={{
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          minWidth: '32px',
                          textAlign: 'right'
                        }}>
                          {item.importance}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: '#e2e8f0',
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${item.importance}%`,
                        height: '100%',
                        backgroundColor: isPositive ? 'var(--primary-600)' : '#f59e0b',
                        borderRadius: '9999px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>

                    {/* Diagnostic Explanation */}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {item.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Practical Agronomic Recommendations Card */}
          <div className="clean-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="card-header" style={{ marginBottom: 0 }}>
              <div>
                <h3 className="card-title">Khuyến nghị canh tác thực tế</h3>
                <p className="card-subtitle">Hành động kỹ thuật đề xuất để đảm bảo chất lượng thu hoạch</p>
              </div>
              <span className="badge badge-neutral">Dành cho kỹ sư</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(result?.recommendations || []).map((rec, i) => {
                const recVisual = getRecVisuals(rec);
                return (
                  <div 
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      backgroundColor: recVisual.bg,
                      border: `1px solid ${recVisual.border}`,
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem',
                      lineHeight: 1.45
                    }}
                  >
                    <div style={{ flexShrink: 0, marginTop: '2px' }}>
                      {recVisual.icon}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className={`badge ${recVisual.badgeClass}`} style={{ width: 'fit-content', fontSize: '0.6875rem', padding: '1px 6px' }}>
                        {recVisual.category}
                      </span>
                      <span style={{ color: 'var(--text-main)' }}>
                        {recVisual.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
