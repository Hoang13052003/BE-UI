// File: src/components/Admin/ProjectDetailsPage/ProjectMilestonesTab.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Spin, 
  Empty, 
  Pagination, 
  Tag, 
  Typography, 
  message, 
  Row, 
  Col, 
  Space, 
  Card, 
  Progress, 
  Badge,
  Divider,
  Tooltip,
  Button,
  List,
  Input,
  DatePicker
} from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  FileTextOutlined,
  FlagOutlined,
  AppstoreOutlined,
  BarsOutlined,
  SearchOutlined,
  ClearOutlined
} from '@ant-design/icons';
import { Milestone, MilestoneStatus } from '../../../types/milestone';
// << THAY ĐỔI IMPORT VÀ TYPE SỬ DỤNG >>
import { ApiPage } from '../../../types/project'; // Import ApiPage từ project.ts
import { getProjectMilestonesOverviewApi } from '../../../api/projectApi'; // API này giờ trả về ApiPage<Milestone>
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(localizedFormat);
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const { Text, Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

interface ProjectMilestonesTabProps {
  projectId: number;
}

// Hàm lấy màu cho status của milestone
const getMilestoneStatusColor = (status: MilestoneStatus | null): string => {
  if (!status) return 'default';
  switch (status) {
    case 'NEW': return 'processing';
    case 'SENT': return 'warning';
    case 'REVIEWED': return 'success';
    default: return 'default';
  }
};

// Hàm lấy icon cho status
const getMilestoneStatusIcon = (status: MilestoneStatus | null) => {
  switch (status) {
    case 'NEW': return <ClockCircleOutlined />;
    case 'SENT': return <FileTextOutlined />;
    case 'REVIEWED': return <CheckCircleOutlined />;
    default: return <FlagOutlined />;
  }
};

// Hàm tính toán màu progress dựa trên completion percentage
const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return '#52c41a'; // green
  if (percentage >= 70) return '#faad14'; // orange
  if (percentage >= 50) return '#1890ff'; // blue
  return '#ff4d4f'; // red
};

const ProjectMilestonesTab: React.FC<ProjectMilestonesTabProps> = ({ projectId }) => {
  // << THAY ĐỔI KIỂU STATE >>
  const [milestonesPage, setMilestonesPage] = useState<ApiPage<Milestone> | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  // UI Pagination state (1-indexed)
  const [uiPagination, setUiPagination] = useState({ current: 1, pageSize: 6 });  const fetchMilestones = useCallback(async (pageToFetch: number, currentSize: number) => {
    if (!projectId || projectId <= 0) {
        setLoading(false);
        setMilestonesPage({ content: [], pageable: { pageNumber: 0, pageSize: currentSize, offset: 0, paged: true, unpaged: false, sort: { sorted: false, unsorted: true, empty: true}}, last: true, totalPages: 0, totalElements: 0, size: currentSize, number: 0, sort: { sorted: false, unsorted: true, empty: true}, first: true, numberOfElements: 0, empty: true } as ApiPage<Milestone>);
        return;
    }
    setLoading(true);
    try {      const data = await getProjectMilestonesOverviewApi( // Hàm này trả về ApiPage
        projectId, 
        pageToFetch, // 0-indexed
        currentSize, 
        [{property: 'startDate', direction: 'asc'}]
      );
      console.log("ProjectMilestonesTab - API Response Data:", JSON.stringify(data, null, 2));
      setMilestonesPage(data);
      setUiPagination({ // Cập nhật UI pagination từ response
          current: data.number + 1,
          pageSize: data.size,
          // total không cần set ở đây, Pagination của AntD sẽ lấy từ totalElements của milestonesPage
      });
    } catch (error) {
      console.error('Failed to fetch project milestones:', error);
      message.error('Failed to load milestones.');
      setMilestonesPage(null); // Reset khi lỗi
    } finally {
      setLoading(false);
    }
  }, [projectId]);  useEffect(() => {
    if (projectId && projectId > 0) {
        fetchMilestones(uiPagination.current - 1, uiPagination.pageSize);
    }
  }, [projectId, uiPagination.current, uiPagination.pageSize, fetchMilestones]);
  const handlePageChange = (page: number, newPageSize?: number) => {
    setUiPagination(prev => ({
        ...prev,
        current: page,
        pageSize: newPageSize || prev.pageSize,
    }));
  };

  // Reset pagination when search or filters change
  useEffect(() => {
    setUiPagination(prev => ({ ...prev, current: 1 }));
  }, [searchText, startDate, endDate]);
  // Function to handle view mode change
  const handleViewModeChange = (newMode: 'grid' | 'list') => {
    setViewMode(newMode);
    // Adjust pageSize based on view mode
    const newPageSize = newMode === 'grid' ? 6 : 10;
    setUiPagination(prev => ({
      ...prev,
      current: 1, // Reset to first page
      pageSize: newPageSize
    }));
  };
  // Filter milestones based on search text and date range
  const filteredMilestones = milestonesPage?.content.filter(milestone => {
    // Search filter
    const matchesSearch = !searchText || 
      (milestone.name && milestone.name.toLowerCase().includes(searchText.toLowerCase())) ||
      (milestone.notes && milestone.notes.toLowerCase().includes(searchText.toLowerCase()));
    
    // Date filter
    const matchesDateRange = (!startDate && !endDate) || 
      (milestone.startDate && (
        (!startDate || dayjs(milestone.startDate).isAfter(dayjs(startDate).subtract(1, 'day'))) &&
        (!endDate || dayjs(milestone.startDate).isBefore(dayjs(endDate).add(1, 'day')))
      ));
    
    return matchesSearch && matchesDateRange;
  });
  // Get paginated data for current page
  const paginatedMilestones = filteredMilestones?.slice(
    (uiPagination.current - 1) * uiPagination.pageSize,
    uiPagination.current * uiPagination.pageSize
  ) || [];

  if (loading && !milestonesPage) { // Chỉ hiển thị Spin to khi chưa có dữ liệu gì cả
    return <Spin tip="Loading milestones..." style={{ display: 'block', textAlign: 'center', marginTop: 20 }} />;
  }

  // Sau khi fetch lần đầu, nếu không có content và không loading -> Empty
  if (!loading && (!milestonesPage || milestonesPage.content.length === 0)) {
    return (
        <div style={{paddingTop: '10px'}}>
            <Empty description="No milestones found for this project." />
        </div>
    );
  }

  // Nếu milestonesPage là null (trường hợp lỗi nặng không mong muốn sau lần fetch đầu)
  if (!milestonesPage) {
     return (
        <div style={{paddingTop: '10px'}}>
            <Empty description="Could not load milestones." />
        </div>
     );
  }  // Render Grid View
  const renderGridView = () => (
    <Row gutter={[16, 16]}>
      {paginatedMilestones?.map((milestone) => (
        <Col xs={24} sm={24} md={12} lg={8} xl={8} key={milestone.id}>
          <Card
            hoverable
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0',
              height: '100%'
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <div style={{ marginBottom: '12px' }}>
              <Badge 
                status={getMilestoneStatusColor(milestone.status) as any}
                text={
                  <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                    {milestone.name || "Untitled Milestone"}
                  </Text>
                }
              />
            </div>

            {milestone.description && (
              <div style={{ marginBottom: '16px' }}>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  {milestone.description}
                </Text>
              </div>
            )}

            <Divider style={{ margin: '12px 0' }} />

            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {/* Status Tag with Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag 
                  icon={getMilestoneStatusIcon(milestone.status)}
                  color={getMilestoneStatusColor(milestone.status)}
                  style={{ margin: 0 }}
                >
                  {milestone.status || 'N/A'}
                </Tag>
              </div>

              {/* Progress Bar */}
              {milestone.completionPercentage !== undefined && milestone.completionPercentage !== null && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Progress</Text>
                    <Text strong style={{ fontSize: '12px' }}>{milestone.completionPercentage}%</Text>
                  </div>
                  <Progress 
                    percent={milestone.completionPercentage} 
                    size="small"
                    strokeColor={getProgressColor(milestone.completionPercentage)}
                    showInfo={false}
                  />
                </div>
              )}

              {/* Dates Information */}
              <Space direction="vertical" size={2} style={{ width: '100%' }}>
                {milestone.startDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CalendarOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Start: {new Date(milestone.startDate).toLocaleDateString()}
                    </Text>
                  </div>
                )}
                
                {milestone.deadlineDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ClockCircleOutlined style={{ 
                      color: new Date(milestone.deadlineDate) < new Date() ? '#ff4d4f' : '#faad14',
                      fontSize: '12px' 
                    }} />
                    <Text 
                      type="secondary" 
                      style={{ 
                        fontSize: '12px',
                        color: new Date(milestone.deadlineDate) < new Date() ? '#ff4d4f' : undefined
                      }}
                    >
                      Deadline: {new Date(milestone.deadlineDate).toLocaleDateString()}
                    </Text>
                  </div>
                )}

                {milestone.completionDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Completed: {new Date(milestone.completionDate).toLocaleDateString()}
                    </Text>
                  </div>
                )}
              </Space>

              {/* Notes */}
              {milestone.notes && (
                <div style={{ marginTop: '8px' }}>
                  <Tooltip title={milestone.notes}>
                    <Text 
                      type="secondary" 
                      style={{ 
                        fontSize: '12px', 
                        fontStyle: 'italic',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <FileTextOutlined style={{ marginRight: '4px' }} />
                      {milestone.notes}
                    </Text>
                  </Tooltip>
                </div>
              )}
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );  // Render List View
  const renderListView = () => (
    <List
      itemLayout="horizontal"
      dataSource={paginatedMilestones}
      renderItem={(milestone) => (
        <List.Item
          style={{
            background: '#fafafa',
            marginBottom: '12px',
            borderRadius: '8px',
            border: '1px solid #f0f0f0',
            padding: '16px'
          }}
        >
          <List.Item.Meta
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                  {milestone.name || "Untitled Milestone"}
                </Text>
                <Tag 
                  icon={getMilestoneStatusIcon(milestone.status)}
                  color={getMilestoneStatusColor(milestone.status)}
                >
                  {milestone.status || 'N/A'}
                </Tag>
              </div>
            }
            description={
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                {milestone.description && (
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    {milestone.description}
                  </Text>
                )}
                
                <Row gutter={[16, 8]} align="middle">
                  {milestone.completionPercentage !== undefined && milestone.completionPercentage !== null && (
                    <Col span={8}>
                      <Space direction="vertical" size={2}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Progress</Text>
                        <Progress 
                          percent={milestone.completionPercentage} 
                          size="small"
                          strokeColor={getProgressColor(milestone.completionPercentage)}
                        />
                      </Space>
                    </Col>
                  )}
                  
                  <Col span={16}>
                    <Space wrap>
                      {milestone.startDate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CalendarOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Start: {new Date(milestone.startDate).toLocaleDateString()}
                          </Text>
                        </div>
                      )}
                      
                      {milestone.deadlineDate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ClockCircleOutlined style={{ 
                            color: new Date(milestone.deadlineDate) < new Date() ? '#ff4d4f' : '#faad14',
                            fontSize: '12px' 
                          }} />
                          <Text 
                            type="secondary" 
                            style={{ 
                              fontSize: '12px',
                              color: new Date(milestone.deadlineDate) < new Date() ? '#ff4d4f' : undefined
                            }}
                          >
                            Deadline: {new Date(milestone.deadlineDate).toLocaleDateString()}
                          </Text>
                        </div>
                      )}

                      {milestone.completionDate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Completed: {new Date(milestone.completionDate).toLocaleDateString()}
                          </Text>
                        </div>
                      )}
                    </Space>
                  </Col>
                </Row>

                {milestone.notes && (
                  <Text type="secondary" style={{ fontSize: '12px', fontStyle: 'italic' }}>
                    <FileTextOutlined style={{ marginRight: '4px' }} />
                    {milestone.notes}
                  </Text>
                )}
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );  return (
    <div style={{ padding: '16px 0' }}>
      {/* Header Section */}
      <div style={{ marginBottom: 24 }}>
        {/* Title and View Toggle Row */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>            <Space direction="vertical" size="small">
              <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                <FlagOutlined style={{ marginRight: 8 }} />
                Milestones
              </Title>
              {milestonesPage && (
                <Space size="middle">                  <Tag color="blue" style={{ borderRadius: 16, fontSize: '14px', padding: '5px 15px' }}>
                    <Text strong style={{ color: '#1890ff' }}>
                      {filteredMilestones?.length || 0} of {milestonesPage.totalElements} milestones
                    </Text>
                  </Tag>
                </Space>
              )}
            </Space>
          </Col>
          <Col>
            {/* View Mode Toggle */}
            <Button.Group>
              <Button
                type={viewMode === 'grid' ? 'primary' : 'default'}
                icon={<AppstoreOutlined />}
                onClick={() => handleViewModeChange('grid')}
              >
                Grid
              </Button>
              <Button
                type={viewMode === 'list' ? 'primary' : 'default'}
                icon={<BarsOutlined />}
                onClick={() => handleViewModeChange('list')}
              >
                List
              </Button>
            </Button.Group>
          </Col>
        </Row>

        {/* Controls Row */}
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={24} md={8} lg={8}>
            <Search
              placeholder="Search by name or notes"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={24} md={10} lg={10}>
            <RangePicker
              allowClear
              onChange={(_, dateStrings) => {
                setStartDate(dateStrings[0] || undefined);
                setEndDate(dateStrings[1] || undefined);
                setUiPagination(prev => ({ ...prev, current: 1 }));
              }}
              style={{ width: '100%' }}
              value={startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : undefined}
              placeholder={['Start date', 'End date']}
            />
          </Col>
          <Col xs={24} sm={24} md={6} lg={6}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Tooltip title="Clear all filters">
                <Button
                  type="text"
                  icon={<ClearOutlined />}
                  onClick={() => {
                    setStartDate(undefined);
                    setEndDate(undefined);
                    setSearchText('');
                    setUiPagination(prev => ({ ...prev, current: 1 }));
                  }}
                  disabled={!searchText && !startDate && !endDate}
                  style={{
                    color: '#ff4d4f',
                    borderColor: '#ff4d4f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '32px',
                    width: '32px'
                  }}
                />
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </div>      {/* Content */}
      {!loading && (!filteredMilestones || filteredMilestones.length === 0) ? (
        <Card style={{ textAlign: 'center', backgroundColor: '#fafafa' }}>
          <Empty 
            description={
              <span style={{ color: '#8c8c8c' }}>
                {searchText || startDate || endDate 
                  ? 'No milestones match your search criteria' 
                  : 'No milestones found for this project'
                }
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        viewMode === 'grid' ? renderGridView() : renderListView()
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" tip="Loading milestones..." />
        </div>
      )}      {filteredMilestones && filteredMilestones.length > uiPagination.pageSize && (
        <Row justify="center" style={{ marginTop: 32 }}>
          <Pagination
            current={uiPagination.current}
            pageSize={uiPagination.pageSize}
            total={filteredMilestones.length}
            onChange={handlePageChange}
            showSizeChanger
            pageSizeOptions={viewMode === 'grid' ? ['6', '12', '24', '48'] : ['5', '10', '20', '50']}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} milestones`}
            style={{
              padding: '16px',
              background: '#fafafa',
              borderRadius: '8px',
              border: '1px solid #f0f0f0'
            }}
          />
        </Row>
      )}
    </div>
  );
};

export default ProjectMilestonesTab;