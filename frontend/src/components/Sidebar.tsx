import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sprout, 
  Droplets, 
  TrendingUp, 
  AlertTriangle, 
  CheckSquare, 
  RotateCcw
} from 'lucide-react';

interface SidebarProps {
  unreadAlertCount: number;
  onResetData: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  unreadAlertCount,
  onResetData
}) => {
  const navItems = [
    { path: '/dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
    { path: '/batches', label: 'Quản lý lô trồng', icon: Sprout },
    { path: '/reservoirs', label: 'Bể nước & Dinh dưỡng', icon: Droplets },
    { path: '/forecast', label: 'Dự báo sản lượng', icon: TrendingUp },
    { path: '/alerts', label: 'Cảnh báo', icon: AlertTriangle, badge: unreadAlertCount },
    { path: '/harvest', label: 'Nhật ký thu hoạch', icon: CheckSquare }
  ];

  return (
    <aside className="app-sidebar">
      {/* Brand Header (Standardized exactly to 68px to align seamlessly with app-header) */}
      <div style={{
        height: '68px',
        minHeight: '68px',
        maxHeight: '68px',
        boxSizing: 'border-box',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Sprout size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
              HydroSmart
            </h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
              Quản lý trang trại thủy canh
            </div>
          </div>
        </div>
      </div>

      {/* Nav List with real Route Links */}
      <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
                color: isActive ? 'var(--primary-700)' : 'var(--text-muted)',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                transition: 'background-color 0.1s ease'
              })}
            >
              {({ isActive }) => (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={18} color={isActive ? 'var(--primary-700)' : 'var(--text-subtle)'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="badge badge-warning" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Reset */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => {
            if (window.confirm('Khôi phục lại dữ liệu mẫu ban đầu của trang trại?')) {
              onResetData();
            }
          }}
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', justifyContent: 'center', color: 'var(--text-subtle)', fontSize: '0.75rem' }}
        >
          <RotateCcw size={13} />
          <span>Đặt lại dữ liệu</span>
        </button>
      </div>
    </aside>
  );
};
