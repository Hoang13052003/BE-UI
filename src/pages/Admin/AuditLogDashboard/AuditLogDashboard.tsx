// src/pages/AuditLogDashboard.tsx

import React, { useState } from 'react';
import { useAuditLogs } from '../../../hooks/useAuditLogs';
import DashboardStats from '../../../components/AuditLog/DashboardStats';
import AuditLogTable from '../../../components/AuditLog/AuditLogTable';
import { FilterParams } from '../../../services/auditLogService';

// Import các component cho bộ lọc và phân trang (chúng ta sẽ tạo chúng sau)
// import FilterBar from '../components/FilterBar';
// import Pagination from '../components/Pagination';

import './AuditLogDashboard.css';

/**
 * Trang chính hiển thị toàn bộ Dashboard Audit Log.
 * Sử dụng `useAuditLogs` hook để quản lý state và logic.
 * Điều phối dữ liệu tới các component con.
 */
const AuditLogDashboard: React.FC = () => {  // Lấy tất cả state và các hàm cần thiết từ custom hook
  const { 
    logs, 
    stats, 
    pagination, 
    loading, 
    error, 
    isConnected, // <-- Lấy state mới
    fetchFilteredLogs 
  } = useAuditLogs();
  
  // State để quản lý các giá trị của bộ lọc hiện tại
  const [filters, setFilters] = useState<FilterParams>({
    page: 0,
    size: 50, // Kích thước trang mặc định
  });

  /**
   * Hàm được gọi khi người dùng thay đổi bộ lọc hoặc trang.
   * @param newFilters - Các giá trị lọc mới.
   */
  const handleFilterChange = (newFilters: Partial<FilterParams>) => {
    // Kết hợp bộ lọc cũ và mới, reset về trang đầu tiên nếu bộ lọc thay đổi
    const updatedFilters = {
      ...filters,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 0,
    };
    setFilters(updatedFilters);
    fetchFilteredLogs(updatedFilters);
  };
  
  // Hiển thị thông báo lỗi lớn nếu có lỗi xảy ra khi tải dữ liệu ban đầu
  if (error && logs.length === 0) {
    return <div className="error-message-fullpage">Error: {error}</div>;
  }

  return (    <div className="dashboard-layout">
      <header className="dashboard-header">
        <h1>Audit Log Dashboard</h1>
        {/* Hiển thị trạng thái kết nối */}
        <div className={`connection-status ${isConnected ? 'connected' : ''}`}>
          {isConnected ? '● Real-time' : '○ Disconnected'}
        </div>
      </header>
      
      <section className="stats-section">
        {/* Truyền stats vào component. Component này có skeleton loading riêng */}
        <DashboardStats stats={stats} />
      </section>
      
      {/* 
        ============================================================
        PHẦN BỘ LỌC VÀ PHÂN TRANG - SẼ ĐƯỢC HOÀN THIỆN Ở GIAI ĐOẠN SAU
        ============================================================
        <section className="filter-section">
          <FilterBar onFilter={handleFilterChange} />
        </section>
      */}

      <main className="main-content">
        <div className="table-header">
          <h2>Activity Feed</h2>
          {loading && <div className="spinner"></div>}
        </div>
        
        {/* 
          Hiển thị thông báo lỗi nhỏ nếu lỗi xảy ra trong quá trình lọc/phân trang
          nhưng vẫn còn dữ liệu cũ để hiển thị
        */}
        {error && <div className="error-message-inline">Could not update logs: {error}</div>}

        <AuditLogTable 
          logs={logs} 
          isLoading={loading && logs.length === 0} // Chỉ hiển thị skeleton khi chưa có log nào
        />
        
        {/* 
          <Pagination 
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={(page) => handleFilterChange({ page })}
          />
        */}
      </main>
    </div>
  );
};

export default AuditLogDashboard;