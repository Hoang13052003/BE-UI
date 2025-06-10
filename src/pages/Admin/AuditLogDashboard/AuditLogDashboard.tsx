// // src/pages/AuditLogDashboard.tsx

// import React from 'react';
// import { Layout, Typography, Space, Alert, Tag, Card } from 'antd';
// import { useAuditLogs } from '../../../hooks/useAuditLogs';
// import DashboardStats from '../../../components/AuditLog/DashboardStats';
// import AuditLogTable from '../../../components/AuditLog/AuditLogTable';
// // import FilterBar from '../../../components/FilterBar'; // Component này sẽ được xây dựng sau

// const { Header, Content } = Layout;
// const { Title } = Typography;

// /**
//  * Trang chính hiển thị toàn bộ Dashboard Audit Log.
//  * Đóng vai trò là "nhạc trưởng", điều phối state từ hook tới các component UI.
//  */
// const AuditLogDashboard: React.FC = () => {  // Lấy tất cả state và các hàm cần thiết từ custom hook mạnh mẽ của chúng ta.
//   const {
//     logs,
//     paginationConfig,
//     stats,
//     loading,
//     error,
//     isConnected,
//     handleTableChange,
//     // filterOptions, // Sẽ dùng cho FilterBar sau này
//   } = useAuditLogs();

//   // Wrapper function để tương thích với AuditLogTable component hiện tại
//   const handleTableChangeWrapper = (
//     pagination: any,
//     filters: Record<string, any>
//   ) => {
//     // Gọi handleTableChange với sorter mặc định
//     handleTableChange(pagination, filters, {});
//   };
//   return (
//     <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
//       <Header 
//         style={{ 
//           backgroundColor: '#fff', 
//           padding: '0 24px', 
//           borderBottom: '1px solid #f0f0f0',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between'
//         }}
//       >
//         <Title level={3} style={{ margin: 0 }}>Audit Log Dashboard</Title>
//         <Tag color={isConnected ? 'green' : 'red'} style={{ fontWeight: 'bold' }}>
//           {isConnected ? '● REAL-TIME' : '○ DISCONNECTED'}
//         </Tag>
//       </Header>

//       <Content style={{ padding: '24px' }}>
//         {/* Chỉ hiển thị lỗi nếu có và không trong trạng thái loading */}
//         {error && !loading && (
//           <Alert 
//             message="Error" 
//             description={error} 
//             type="error" 
//             showIcon 
//             closable 
//             style={{ marginBottom: '24px' }} 
//           />
//         )}
        
//         <Space direction="vertical" size="large" style={{ width: '100%' }}>
//           {/* Component thống kê: truyền stats và trạng thái loading */}
//           <DashboardStats stats={stats} loading={loading && !stats} />

//           {/* Component bộ lọc (sẽ thêm sau) */}
//           <Card title="Filters & Search" bordered={false}>
//             {/* <FilterBar options={filterOptions} onFilter={handleTableChange} /> */}
//             <p>Filter controls will be placed here.</p>
//           </Card>
          
//           {/* Component bảng dữ liệu */}
//           <Card title="Activity Feed" bordered={false}>            <AuditLogTable
//               logs={logs}
//               loading={loading}
//               pagination={paginationConfig} // Truyền cấu hình pagination từ hook
//               handleTableChange={handleTableChangeWrapper} // Truyền hàm callback wrapper
//             />
//           </Card>
//         </Space>
//       </Content>
//     </Layout>
//   );
// };

// export default AuditLogDashboard;