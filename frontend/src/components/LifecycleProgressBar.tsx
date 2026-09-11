import React from 'react';
import { Calendar, Clock, Sparkles } from 'lucide-react';
import type { GrowthStage } from '../types/farm';

interface LifecycleProgressBarProps {
  seedDate: string;
  expectedHarvestDate?: string;
  currentStage: GrowthStage | string;
  targetCycleDays?: number;
  compact?: boolean;
}

export const LifecycleProgressBar: React.FC<LifecycleProgressBarProps> = ({
  seedDate,
  expectedHarvestDate,
  currentStage,
  targetCycleDays = 35,
  compact = false
}) => {
  const seedTime = new Date(seedDate).getTime();
  const now = new Date().getTime();
  const plantAgeDays = Math.max(1, Math.round((now - seedTime) / (1000 * 3600 * 24)));
  
  const progressPct = Math.min(100, Math.max(2, Math.round((plantAgeDays / targetCycleDays) * 100)));
  let daysRemaining = targetCycleDays - plantAgeDays;
  if (expectedHarvestDate) {
    const expTime = new Date(expectedHarvestDate).getTime();
    daysRemaining = Math.round((expTime - now) / (1000 * 3600 * 24));
  }

  // Status text & color
  let stageLabel = 'Sinh dưỡng';
  let stageBadgeClass = 'badge-success';
  if (currentStage === 'seedling') {
    stageLabel = 'Cây con';
    stageBadgeClass = 'badge-neutral';
  } else if (currentStage === 'pre_harvest') {
    stageLabel = 'Sắp thu hoạch';
    stageBadgeClass = 'badge-warning';
  } else if (currentStage === 'harvested') {
    stageLabel = 'Đã thu hoạch';
    stageBadgeClass = 'badge-info';
  }

  if (compact) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '130px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Ngày {plantAgeDays}/{targetCycleDays}</span>
          <span style={{ color: daysRemaining <= 3 ? 'var(--warning-text)' : 'var(--text-muted)' }}>
            {daysRemaining > 0 ? `Còn ${daysRemaining}d` : daysRemaining === 0 ? 'Thu hoạch ngay' : `Quá ${Math.abs(daysRemaining)}d`}
          </span>
        </div>
        <div style={{ height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
          <div 
            style={{ 
              height: '100%', 
              width: `${progressPct}%`, 
              backgroundColor: progressPct >= 90 ? '#eab308' : 'var(--primary-600)',
              borderRadius: '999px',
              transition: 'width 0.3s ease'
            }} 
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {/* Top row: Stage badge, Day count, Countdown */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className={`badge ${stageBadgeClass}`} style={{ fontSize: '0.71875rem' }}>
            {stageLabel}
          </span>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Ngày {plantAgeDays} / {targetCycleDays} ngày
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 500 }}>
          {daysRemaining > 0 ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: daysRemaining <= 5 ? '#d97706' : 'var(--text-muted)' }}>
              <Clock size={13} />
              Còn <strong>{daysRemaining} ngày</strong> tới kỳ thu hoạch
            </span>
          ) : daysRemaining === 0 ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 600 }}>
              <Sparkles size={13} />
              Đến kỳ thu hoạch hôm nay
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontWeight: 600 }}>
              <Calendar size={13} />
              Đã vượt chu kỳ {Math.abs(daysRemaining)} ngày
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar with Segments */}
      <div style={{ position: 'relative', width: '100%' }}>
        <div 
          style={{ 
            height: '8px', 
            width: '100%', 
            backgroundColor: 'var(--border-subtle)', 
            borderRadius: '999px', 
            overflow: 'hidden',
            display: 'flex'
          }}
        >
          <div 
            style={{ 
              height: '100%', 
              width: `${progressPct}%`, 
              background: progressPct >= 85 
                ? 'linear-gradient(90deg, #10b981 0%, #f59e0b 100%)' 
                : 'linear-gradient(90deg, #34d399 0%, #059669 100%)',
              borderRadius: '999px',
              transition: 'width 0.4s ease'
            }} 
          />
        </div>

        {/* Milestone labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
          <span>Gieo hạt</span>
          <span style={{ transform: 'translateX(-20%)' }}>Cây con (25%)</span>
          <span style={{ transform: 'translateX(20%)' }}>Sinh dưỡng (60%)</span>
          <span>Thu hoạch (100%)</span>
        </div>
      </div>
    </div>
  );
};
