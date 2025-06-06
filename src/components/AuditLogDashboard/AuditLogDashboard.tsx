// src/components/AuditLogDashboard/AuditLogDashboard.tsx
import React, { useCallback, useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Button, Space, Typography, Tag, Tabs } from 'antd';
import { 
  SafetyCertificateOutlined, 
  ReloadOutlined, 
  DisconnectOutlined, 
  LinkOutlined,
  WarningOutlined,
  DashboardOutlined,
  FilterOutlined,
  HistoryOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useAuditLogData } from '../../hooks/useAuditLogData';
import { useStompContext } from '../../contexts/StompContext';
import { useAuditLogFilters } from '../../hooks/useAuditLogFilters';
import LiveFeed from './LiveFeed';
import LogTable from './LogTable';
import AuditLogFilters from './AuditLogFilters';
import AuditLogStats from './AuditLogStats';
import UserActivityPanel from './UserActivityPanel';
import ErrorAlert from './ErrorAlert';
import AuditLogDebug from './AuditLogDebug';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AuditLogDashboard: React.FC = () => {
  const { isConnected, connectStomp, disconnectStomp } = useStompContext();
  const { 
    liveAuditLogs, 
    pagedAuditLogData, 
    isLoadingPagedLogs, 
    fetchAuditLogs, 
    reconnectionStatus, 
    resetReconnection,
    error,
    clearError
  } = useAuditLogData();
  
  const {
    filter,
    setFilter,
    clearFilters,
    filteredData,
    isLoading: isFilterLoading,
    error: filterError,
    fetchFilteredLogs,
    hasActiveFilters
  } = useAuditLogFilters();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [activeTab, setActiveTab] = useState('overview');
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);
  const [showDebug, setShowDebug] = useState(false);

  // Auto refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStatsRefreshTrigger(prev => prev + 1);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleConnect = () => {
    console.log("Dashboard: Attempting to connect STOMP...");
    connectStomp(true);
  };

  const handleDisconnect = () => {
    console.log("Dashboard: Attempting to disconnect STOMP...");
    disconnectStomp();
  };

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    if (hasActiveFilters) {
      fetchFilteredLogs(newPage, pageSize);
    } else {
      fetchAuditLogs({ page: newPage, size: pageSize });
    }
  }, [fetchAuditLogs, fetchFilteredLogs, hasActiveFilters, pageSize]);

  const handleRefresh = useCallback(() => {
    if (hasActiveFilters) {
      fetchFilteredLogs(currentPage, pageSize);
    } else {
      fetchAuditLogs({ page: currentPage, size: pageSize });
    }
    setStatsRefreshTrigger(prev => prev + 1);
  }, [fetchAuditLogs, fetchFilteredLogs, hasActiveFilters, currentPage, pageSize]);

  const handleResetReconnection = useCallback(() => {
    resetReconnection();
    console.log("Dashboard: Reconnection reset, attempting to connect...");
    connectStomp(true);
  }, [resetReconnection, connectStomp]);

  const handleFilterChange = useCallback((newFilter: any) => {
    setFilter(newFilter);
    setCurrentPage(0); // Reset to first page when filter changes
  }, [setFilter]);

  const currentLogData = hasActiveFilters ? filteredData : pagedAuditLogData;
  const currentLoading = hasActiveFilters ? isFilterLoading : isLoadingPagedLogs;

  const getConnectionStatusColor = () => {
    if (isConnected) return '#52c41a';
    if (reconnectionStatus.canReconnect) return '#fa8c16';
    return '#ff4d4f';
  };

  const getConnectionStatusText = () => {
    if (isConnected) return 'Connected';
    if (reconnectionStatus.canReconnect) return 'Disconnected (Can Reconnect)';
    return 'Disconnected (Max Attempts Reached)';
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Content style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SafetyCertificateOutlined style={{ color: '#1890ff' }} />
            Audit Log Dashboard
          </Title>
          <Text type="secondary">Real-time monitoring and analysis of system audit logs</Text>
        </div>

        {/* Error Alerts */}
        {error && (
          <ErrorAlert
            error={error}
            onRetry={handleRefresh}
            onDismiss={clearError}
            type="error"
          />
        )}

        {filterError && (
          <ErrorAlert
            error={filterError}
            onRetry={() => fetchFilteredLogs(currentPage, pageSize)}
            type="warning"
          />
        )}

        {/* Connection Status Card */}
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Space size="large">
                <div>
                  <Text strong>Connection Status: </Text>
                  <Tag 
                    color={getConnectionStatusColor()}
                    icon={isConnected ? <LinkOutlined /> : <DisconnectOutlined />}
                  >
                    {getConnectionStatusText()}
                  </Tag>
                </div>
                
                <div>
                  <Text strong>Reconnection: </Text>
                  <span>{reconnectionStatus.attempts}/{reconnectionStatus.maxAttempts} attempts</span>
                  {!reconnectionStatus.shouldReconnect && (
                    <Tag color="warning" style={{ marginLeft: '8px' }}>
                      <WarningOutlined /> Auto-reconnection disabled
                    </Tag>
                  )}
                </div>

                <div>
                  <Text strong>Live Events: </Text>
                  <Tag color={liveAuditLogs.length > 0 ? 'green' : 'default'}>
                    {liveAuditLogs.length} recent
                  </Tag>
                </div>
              </Space>
            </Col>
            
            <Col>
              <Space>
                {!isConnected && reconnectionStatus.canReconnect && (
                  <Button 
                    type="primary"
                    icon={<LinkOutlined />}
                    onClick={handleConnect}
                  >
                    Connect
                  </Button>
                )}
                {isConnected && (
                  <Button 
                    danger
                    icon={<DisconnectOutlined />}
                    onClick={handleDisconnect}
                  >
                    Disconnect
                  </Button>
                )}
                {!reconnectionStatus.canReconnect && (
                  <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={handleResetReconnection}
                    style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
                  >
                    Reset & Reconnect
                  </Button>
                )}                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={currentLoading}
                >
                  Refresh All
                </Button>
                <AuditLogDebug 
                  visible={showDebug} 
                  onToggle={() => setShowDebug(!showDebug)} 
                />
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Main Content Tabs */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          type="card"
          size="large"
        >
          <TabPane
            tab={
              <span>
                <DashboardOutlined />
                Overview
              </span>
            }
            key="overview"
          >
            <Row gutter={[16, 16]}>
              {/* Statistics */}
              <Col span={24}>
                <AuditLogStats refreshTrigger={statsRefreshTrigger} />
              </Col>

              {/* Live Feed and User Activity */}
              <Col xs={24} lg={16}>
                <LiveFeed logs={liveAuditLogs} />
              </Col>
              <Col xs={24} lg={8}>
                <UserActivityPanel refreshTrigger={statsRefreshTrigger} />
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <HistoryOutlined />
                History & Filters
              </span>
            }
            key="history"
          >
            <Row gutter={[16, 16]}>
              {/* Filters */}
              <Col span={24}>
                <AuditLogFilters
                  filter={filter}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearFilters}
                  loading={currentLoading}
                />
              </Col>

              {/* Results Info */}
              {hasActiveFilters && (
                <Col span={24}>
                  <Card size="small">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space>
                        <FilterOutlined style={{ color: '#1890ff' }} />
                        <Text strong>Filtered Results</Text>
                        {filteredData && (
                          <Tag color="blue">{filteredData.totalElements} entries found</Tag>
                        )}
                      </Space>
                      <Button 
                        size="small" 
                        onClick={clearFilters}
                        ghost
                      >
                        View All Logs
                      </Button>
                    </div>
                  </Card>
                </Col>
              )}

              {/* Log Table */}
              <Col span={24}>
                <LogTable
                  logPage={currentLogData}
                  onPageChange={handlePageChange}
                  onRefresh={handleRefresh}
                  currentPage={currentPage}
                  isLoading={currentLoading}
                />
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <TeamOutlined />
                User Activity
              </span>
            }
            key="users"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <UserActivityPanel refreshTrigger={statsRefreshTrigger} limit={20} />
              </Col>
              <Col xs={24} lg={12}>
                <AuditLogStats refreshTrigger={statsRefreshTrigger} />
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
};

export default AuditLogDashboard;