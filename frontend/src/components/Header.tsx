import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, User, Clock } from 'lucide-react';

interface HeaderProps {
  unreadAlertCount: number;
}

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Bảng điều khiển tổng quan',
    subtitle: 'Theo dõi tình trạng trang trại, chỉ số nước và các lô cây đang canh tác'
  },
  '/dashboard': {
    title: 'Bảng điều khiển tổng quan',
    subtitle: 'Theo dõi tình trạng trang trại, chỉ số nước và các lô cây đang canh tác'
  },
  '/batches': {
    title: 'Quản lý lô cây trồng',
    subtitle: 'Theo dõi tiến độ từ ngày gieo hạt đến thu hoạch của từng máng/bể'
  },
  '/reservoirs': {
    title: 'Bể nước & Dinh dưỡng',
    subtitle: 'Kiểm tra độ pH, nồng độ dinh dưỡng EC, nhiệt độ nước và công thức Stock A/B'
  },
  '/forecast': {
    title: 'Dự báo sản lượng thu hoạch',
    subtitle: 'Ước tính trọng lượng cây và sản lượng cả lô dựa trên điều kiện sinh trưởng'
  },
  '/alerts': {
    title: 'Danh sách cảnh báo',
    subtitle: 'Thông báo các chỉ số pH, EC, nhiệt độ nước lệch ngưỡng cần xử lý'
  },
  '/harvest': {
    title: 'Nhật ký thu hoạch',
    subtitle: 'Lưu trữ kết quả thu hoạch thực tế và so sánh với ước tính ban đầu'
  }
};

export const Header: React.FC<HeaderProps> = ({
  unreadAlertCount
}) => {
  const [timeStr, setTimeStr] = useState('');
  const location = useLocation();

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
        ' ' +
        now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const meta = ROUTE_TITLES[location.pathname] || ROUTE_TITLES['/dashboard'];

  return (
    <header className="app-header">
      <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', paddingRight: '16px' }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2, margin: 0 }}>
          {meta.title}
        </h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)', marginTop: '3px', lineHeight: 1.2, margin: 0 }}>
          {meta.subtitle}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        {/* Date and Time */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)'
        }}>
          <Clock size={14} color="var(--text-subtle)" />
          <span>{timeStr}</span>
        </div>

        {/* Alert Bell Button with Link to /alerts */}
        <Link
          to="/alerts"
          style={{
            position: 'relative',
            background: 'transparent',
            border: '1px solid var(--border-subtle)',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            color: 'inherit',
            boxSizing: 'border-box'
          }}
          className="btn-ghost"
          title="Xem danh sách cảnh báo"
        >
          <Bell size={17} color={unreadAlertCount > 0 ? 'var(--warning-text)' : 'var(--text-muted)'} />
          {unreadAlertCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: 'var(--danger)',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 700,
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {unreadAlertCount}
            </span>
          )}
        </Link>

        {/* User Profile */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderLeft: '1px solid var(--border-subtle)',
          paddingLeft: '14px',
          height: '32px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            flexShrink: 0
          }}>
            <User size={16} />
          </div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
            Kỹ sư Nông nghiệp
          </div>
        </div>
      </div>
    </header>
  );
};
