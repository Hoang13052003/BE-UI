// src/components/DashboardStats.tsx

import React from 'react';
import { AuditStats } from '../../types/auditLog.types';

// Một component nhỏ để hiển thị icon (bạn có thể dùng thư viện icon như react-icons)
// npm install react-icons
import { FiActivity, FiAlertTriangle, FiXCircle, FiAlertCircle } from 'react-icons/fi';

// Import file CSS để làm cho các thẻ trông đẹp hơn
import './DashboardStats.css';

interface DashboardStatsProps {
  stats: AuditStats | null;
}

/**
 * Component hiển thị các thẻ thống kê tổng quan về audit log.
 * @param {DashboardStatsProps} props - Props chứa object stats.
 */
const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  // Một component con nội bộ để tránh lặp lại code cho mỗi thẻ
  const StatCard = ({ title, value, icon, className = '' }: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    className?: string;
  }) => (
    <div className={`stat-card ${className}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <h4>{title}</h4>
        <span>{value}</span>
      </div>
    </div>
  );

  // Hiển thị skeleton loading trong khi chờ stats được tải
  if (!stats) {
    return (
      <div className="stats-container">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="stat-card skeleton">
            <div className="stat-info">
              <h4> </h4>
              <span> </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stats-container">
      <StatCard
        title="Total Logs (24h)"
        value={stats.totalLogs24h ?? 0}
        icon={<FiActivity size={24} />}
        className="info"
      />
      <StatCard
        title="Critical Events (24h)"
        value={stats.criticalLogs24h ?? 0}
        icon={<FiAlertTriangle size={24} />}
        className="critical"
      />
      <StatCard
        title="Error Events (24h)"
        value={stats.errorLogs24h ?? 0}
        icon={<FiXCircle size={24} />}
        className="error"
      />
      <StatCard
        title="Warning Events (24h)"
        value={stats.warningLogs24h ?? 0}
        icon={<FiAlertCircle size={24} />}
        className="warning"
      />
    </div>
  );
};

export default DashboardStats;