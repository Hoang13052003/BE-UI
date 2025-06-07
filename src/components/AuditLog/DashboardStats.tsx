// src/components/DashboardStats.tsx

import React from 'react';
import { Card, Col, Row, Statistic, Skeleton } from 'antd';
import {
  LineChartOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
// Sử dụng interface RealtimeStatistics chi tiết đã định nghĩa
import { RealtimeStatistics } from '../../types/auditLog.types'; 

interface DashboardStatsProps {
  stats: RealtimeStatistics | null;
  loading: boolean;
}

/**
 * Component hiển thị các thẻ thống kê tổng quan về audit log, sử dụng Ant Design.
 * @param {DashboardStatsProps} props - Props chứa object stats và trạng thái loading.
 */
const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, loading }) => {
  // Dữ liệu cho các thẻ thống kê, dễ dàng cấu hình và mở rộng.
  // Chúng ta sẽ lấy dữ liệu từ `stats.severity_breakdown` và `stats.total_logs`
  const statCards = [
    {
      title: 'Total Logs (24h)',
      // Sử dụng toán tử ?? (Nullish Coalescing) để hiển thị 0 nếu giá trị là null/undefined
      value: stats?.total_logs ?? 0, 
      icon: <LineChartOutlined />,
      color: '#1890ff',
    },
    {
      title: 'Critical Events (24h)',
      value: stats?.severity_breakdown?.['CRITICAL'] ?? 0,
      icon: <ExclamationCircleOutlined />,
      color: '#a8071a',
    },
    {
      title: 'Error Events (24h)',
      value: stats?.severity_breakdown?.['ERROR'] ?? 0,
      icon: <CloseCircleOutlined />,
      color: '#cf1322',
    },
    {
      title: 'Warning Events (24h)',
      value: stats?.severity_breakdown?.['WARNING'] ?? 0,
      icon: <WarningOutlined />,
      color: '#d48806',
    },
  ];

  return (
    // Sử dụng Row và Col của Ant Design để tạo layout responsive
    <Row gutter={[16, 16]}>
      {statCards.map((card, index) => (
        <Col xs={24} sm={12} md={12} lg={6} key={index}>
          <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)' }}>
            {/* 
              Sử dụng Skeleton của Ant Design cho hiệu ứng loading.
              Nó sẽ hiển thị khi `loading` là true.
            */}
            <Skeleton loading={loading} avatar active paragraph={{ rows: 1 }}>
              <Statistic
                title={card.title}
                value={card.value}
                valueStyle={{ color: card.color, fontSize: '2rem' }}
                prefix={
                  <span style={{ color: card.color, marginRight: '8px' }}>
                    {card.icon}
                  </span>
                }
              />
            </Skeleton>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default DashboardStats;