import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface AgronomicTooltipProps {
  title: string;
  optimalRange?: string;
  explanation: string;
  warningNotice?: string;
  size?: number;
  color?: string;
}

export const AgronomicTooltip: React.FC<AgronomicTooltipProps> = ({
  title,
  optimalRange,
  explanation,
  warningNotice,
  size = 14,
  color = 'var(--text-subtle)'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'help' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsVisible(prev => !prev);
      }}
    >
      <HelpCircle 
        size={size} 
        style={{ 
          color, 
          transition: 'color 0.15s ease',
          opacity: 0.8
        }} 
      />

      {isVisible && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            padding: '10px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            lineHeight: 1.45,
            width: '240px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
            zIndex: 1000,
            pointerEvents: 'none',
            textAlign: 'left'
          }}
        >
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              borderWidth: '5px',
              borderStyle: 'solid',
              borderColor: '#1e293b transparent transparent transparent'
            }}
          />

          <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: '3px' }}>
            {title}
          </div>
          
          {optimalRange && (
            <div style={{ fontSize: '0.7rem', color: '#a7f3d0', marginBottom: '4px', fontWeight: 500 }}>
              Chuẩn khuyến nghị: {optimalRange}
            </div>
          )}

          <div style={{ color: '#e2e8f0', fontSize: '0.71875rem' }}>
            {explanation}
          </div>

          {warningNotice && (
            <div style={{ marginTop: '5px', paddingTop: '4px', borderTop: '1px solid #334155', color: '#fca5a5', fontSize: '0.6875rem' }}>
              ⚠️ {warningNotice}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
