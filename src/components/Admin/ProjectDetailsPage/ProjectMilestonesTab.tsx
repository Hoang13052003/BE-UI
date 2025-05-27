// File: src/components/Admin/ProjectDetailsPage/ProjectMilestonesTab.tsx

import React, { useState, useEffect, useCallback } from 'react';
  import { List, Spin, Empty, Pagination, Tag, Typography, message, Row, Col, Space } from 'antd'; // Bỏ Button, Popconfirm và các icon
import { Milestone, MilestoneStatus } from '../../../types/milestone';
// << THAY ĐỔI IMPORT VÀ TYPE SỬ DỤNG >>
import { ApiPage } from '../../../types/project'; // Import ApiPage từ project.ts
import { getProjectMilestonesOverviewApi } from '../../../api/projectApi'; // API này giờ trả về ApiPage<Milestone>

const { Text } = Typography;

interface ProjectMilestonesTabProps {
  projectId: number;
}

// Hàm lấy màu cho status của milestone
const getMilestoneStatusColor = (status: MilestoneStatus | null): string => {
  if (!status) return 'default';
  switch (status) {
    case 'NEW': return 'cyan';
    case 'SENT': return 'gold';
    case 'REVIEWED': return 'geekblue';
    default: return 'default';
  }
};

const ProjectMilestonesTab: React.FC<ProjectMilestonesTabProps> = ({ projectId }) => {
  // << THAY ĐỔI KIỂU STATE >>
  const [milestonesPage, setMilestonesPage] = useState<ApiPage<Milestone> | null>(null);
  const [loading, setLoading] = useState(false);
  // UI Pagination state (1-indexed)
  const [uiPagination, setUiPagination] = useState({ current: 1, pageSize: 5 });

  const fetchMilestones = useCallback(async (pageToFetch: number, currentSize: number) => {
    if (!projectId || projectId <= 0) {
        setLoading(false);
        setMilestonesPage({ content: [], pageable: { pageNumber: 0, pageSize: currentSize, offset: 0, paged: true, unpaged: false, sort: { sorted: false, unsorted: true, empty: true}}, last: true, totalPages: 0, totalElements: 0, size: currentSize, number: 0, sort: { sorted: false, unsorted: true, empty: true}, first: true, numberOfElements: 0, empty: true } as ApiPage<Milestone>);
        return;
    }
    setLoading(true);
    try {
      const data = await getProjectMilestonesOverviewApi( // Hàm này trả về ApiPage
        projectId, 
        pageToFetch, // 0-indexed
        currentSize, 
        [{property: 'deadlineDate', direction: 'asc'}]
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
  }, [projectId]);

  useEffect(() => {
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
  }

  return (
    <div style={{paddingTop: '10px'}}>
      <List
        itemLayout="horizontal"
        dataSource={milestonesPage?.content}
        loading={loading}
        renderItem={(milestone) => (
          <List.Item>
            <List.Item.Meta
              title={<Text strong>{milestone.name || "Untitled Milestone"}</Text>}
              description={
                <Space direction="vertical" size="small">
                  {milestone.description && <Text type="secondary">{milestone.description}</Text>}
                  <Row gutter={16} align="middle" wrap>
                    <Col>
                      <Tag color={getMilestoneStatusColor(milestone.status)}>{milestone.status || 'N/A'}</Tag>
                    </Col>
                    {milestone.deadlineDate && (
                      <Col>
                        <Text type="secondary">Deadline: {new Date(milestone.deadlineDate).toLocaleDateString()}</Text>
                      </Col>
                    )}
                     {milestone.completionPercentage !== undefined && milestone.completionPercentage !== null && (
                       <Col>
                         <Text type="secondary">Progress: {milestone.completionPercentage}%</Text>
                       </Col>
                     )}
                      {milestone.startDate && (
                       <Col>
                         <Text type="secondary">Start: {new Date(milestone.startDate).toLocaleDateString()}</Text>
                       </Col>
                     )}
                     {milestone.completionDate && (
                       <Col>
                         <Text type="secondary">Completed: {new Date(milestone.completionDate).toLocaleDateString()}</Text>
                       </Col>
                     )}
                  </Row>
                  {milestone.notes && <Text type="secondary" style={{ fontStyle: 'italic' }}>Notes: {milestone.notes}</Text>}
                </Space>
              }
            />
          </List.Item>
        )}
      />

      {milestonesPage && milestonesPage.totalElements > uiPagination.pageSize && (
        <Row justify="center" style={{ marginTop: 24 }}>
          <Pagination
            current={uiPagination.current}
            pageSize={uiPagination.pageSize}
            total={milestonesPage.totalElements}
            onChange={handlePageChange}
            showSizeChanger
            pageSizeOptions={['5', '10', '20', '50']}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
          />
        </Row>
      )}
    </div>
  );
};

export default ProjectMilestonesTab;