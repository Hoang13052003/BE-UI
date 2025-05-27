// File: src/components/Admin/ProjectDetailsPage/ProjectUpdatesTab.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Button, 
  Spin, 
  Empty, 
  Typography, 
  Tag, 
  Avatar, 
  Popover, 
  Progress, 
  Space, 
  message, 
  Row, 
  Col
} from 'antd';
import { 
  UserOutlined, 
  CalendarOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined,
  InfoCircleOutlined,
  PercentageOutlined,
  // PaperClipOutlined, // Bỏ comment nếu dùng cho attachments
} from '@ant-design/icons';
import { ProjectUpdateTimelineItem, UserSummary, ApiPage } from '../../../types/project'; // Import ApiPage
import { getProjectUpdatesTimelineApi } from '../../../api/projectApi'; // API này giờ trả về ApiPage
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(localizedFormat);

const { Title, Text, Paragraph } = Typography; // Bỏ Link nếu không dùng

interface ProjectUpdatesTabProps {
  projectId: number;
  theme?: string;
}

const getUpdateStatusStyle = (status: string | null | undefined, theme?: string): React.CSSProperties => {
  const baseStyle: React.CSSProperties = { fontWeight: 500, fontSize: '0.85em' };
  if (!status) return { ...baseStyle, color: theme === 'dark' ? '#a0a0a0' : '#8c8c8c' };
  
  switch (status.toUpperCase()) {
    case 'ON_TRACK': return { ...baseStyle, color: theme === 'dark' ? '#73d13d' : '#389e0d' };
    case 'COMPLETED': return { ...baseStyle, color: theme === 'dark' ? '#69c0ff' : '#0958d9' };
    case 'AT_RISK': return { ...baseStyle, color: theme === 'dark' ? '#ffc53d' : '#d48806' };
    case 'OFF_TRACK': return { ...baseStyle, color: theme === 'dark' ? '#ff7875' : '#cf1322' };
    case 'ON_HOLD': return { ...baseStyle, color: theme === 'dark' ? '#b37feb' : '#531dab' };
    default: return { ...baseStyle, color: theme === 'dark' ? '#a0a0a0' : '#8c8c8c' };
  }
};

const renderUser = (user: UserSummary | null | undefined, _theme?: string) => {
    if (!user) return <Tag icon={<UserOutlined />} style={{cursor: 'default'}}>Unknown User</Tag>;
    const userInitial = user.fullName ? user.fullName.charAt(0).toUpperCase() : <UserOutlined />;
    return (
      <Popover 
        content={
            <Space direction="vertical" size="small">
                <Text style={{fontSize: '0.8em'}}>Email: {user.email}</Text>
                <Text style={{fontSize: '0.8em'}}>User ID: {user.id}</Text>
            </Space>
        } 
        title={<Text strong>Updated by</Text>}
        trigger="hover"
      >
        <Tag 
            icon={<Avatar size="small" style={{ backgroundColor: '#1677ff', marginRight: 4 }}>{userInitial}</Avatar>}
            style={{ padding: '2px 8px 2px 4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
            color="blue"
        >
            <Text style={{color: '#fff', fontSize: '0.9em'}}>{user.fullName}</Text>
        </Tag>
      </Popover>
    );
};

const ProjectUpdatesTab: React.FC<ProjectUpdatesTabProps> = ({ projectId, theme }) => {
  const [updatesPage, setUpdatesPage] = useState<ApiPage<ProjectUpdateTimelineItem> | null>(null); // State dùng ApiPage
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed cho API
  const [pageSize] = useState(5);
  const [allUpdatesLoaded, setAllUpdatesLoaded] = useState(false);

  const fetchUpdates = useCallback(async (pageToFetch: number, currentSize: number, append = false) => {
    if (!projectId || projectId <= 0) { // Thêm kiểm tra projectId > 0
        setLoading(false);
        setUpdatesPage({ // Trả về trang rỗng nếu projectId không hợp lệ
            content: [], pageable: { pageNumber: 0, pageSize: currentSize, offset: 0, paged: true, unpaged: false, sort: { sorted: false, unsorted: true, empty: true}}, 
            last: true, totalPages: 0, totalElements: 0, size: currentSize, number: 0, 
            sort: { sorted: false, unsorted: true, empty: true}, first: true, numberOfElements: 0, empty: true 
        } as ApiPage<ProjectUpdateTimelineItem>);
        setAllUpdatesLoaded(true);
        return;
    }
    setLoading(true);
    try {
      // getProjectUpdatesTimelineApi giờ trả về Promise<ApiPage<ProjectUpdateTimelineItem>>
      const data = await getProjectUpdatesTimelineApi(
        projectId,
        pageToFetch,
        currentSize,
        [{ property: 'updateDate', direction: 'desc' }]
      );
      
      console.log("ProjectUpdatesTab - API Response Data:", JSON.stringify(data, null, 2));

      if (append && updatesPage && updatesPage.content) {
        setUpdatesPage(prevPage => {
          if (!prevPage) return data; // Nếu trang trước đó là null, trả về data mới
          return { // Kết hợp dữ liệu mới và cũ, giữ metadata từ data (response mới nhất)
            ...data, 
            content: [...prevPage.content, ...data.content],
          };
        });
      } else {
        setUpdatesPage(data); // Gán data mới hoàn toàn
      }

      if (data.last || data.content.length === 0 && pageToFetch > 0) { // Điều kiện data.content.length === 0 && pageToFetch > 0 để xử lý load more mà không có thêm data
        setAllUpdatesLoaded(true);
      } else {
        setAllUpdatesLoaded(false);
      }

    } catch (error) {
      console.error('Failed to fetch project updates:', error);
      message.error('Failed to load project updates.');
      setUpdatesPage(null); // Reset về null khi có lỗi
      setAllUpdatesLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [projectId, updatesPage]); // Giữ updatesPage cho logic append

  useEffect(() => {
    // Reset state và fetch trang đầu tiên khi projectId hoặc pageSize thay đổi
    setUpdatesPage(null); 
    setCurrentPage(0);
    setAllUpdatesLoaded(false);
    if (projectId && projectId > 0) { // Chỉ fetch nếu projectId hợp lệ
        fetchUpdates(0, pageSize, false); // Fetch trang đầu (page 0)
    } else {
        // Nếu projectId không hợp lệ ngay từ đầu, set trạng thái rỗng
        setLoading(false);
        setUpdatesPage({ content: [], pageable: { pageNumber: 0, pageSize: pageSize, offset: 0, paged: true, unpaged: false, sort: { sorted: false, unsorted: true, empty: true}}, last: true, totalPages: 0, totalElements: 0, size: pageSize, number: 0, sort: { sorted: false, unsorted: true, empty: true}, first: true, numberOfElements: 0, empty: true } as ApiPage<ProjectUpdateTimelineItem>);
        setAllUpdatesLoaded(true);
    }
  }, [projectId, pageSize]); // Bỏ fetchUpdates, gọi trực tiếp và chỉ chạy khi projectId/pageSize thay đổi

  const handleLoadMore = () => {
    if (!loading && !allUpdatesLoaded) {
      const nextPageToFetch = currentPage + 1;
      fetchUpdates(nextPageToFetch, pageSize, true); // append = true
      setCurrentPage(nextPageToFetch); // Cập nhật số trang hiện tại đã yêu cầu
    }
  };

  // Hàm mới để nhóm updates theo ngày
  const groupUpdatesByDate = (updates: ProjectUpdateTimelineItem[]) => {
    if (!updates || updates.length === 0) return {};
    return updates.reduce((acc, update) => {
      const dateStr = dayjs(update.updateDate).format('YYYY-MM-DD'); // Nhóm theo YYYY-MM-DD
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(update);
      return acc;
    }, {} as Record<string, ProjectUpdateTimelineItem[]>);
  };

  const groupedUpdates = updatesPage ? groupUpdatesByDate(updatesPage.content) : {};
  const sortedDates = Object.keys(groupedUpdates).sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf()); // Sắp xếp ngày mới nhất trước

  if (loading && (!updatesPage || updatesPage.content.length === 0)) {
    return <Spin tip="Loading updates..." style={{ display: 'block', textAlign: 'center', marginTop: 40, marginBottom: 40 }} />;
  }
  
  // Sau khi fetch lần đầu, nếu không có content và không loading -> Empty
  if (!loading && (!updatesPage || updatesPage.content.length === 0)) {
    return <Empty description="No updates found for this project." style={{marginTop: 40, marginBottom: 40}}/>;
  }
  
  // Nếu updatesPage là null (trường hợp lỗi nặng hoặc chưa kịp fetch)
  if (!updatesPage) {
     return <Empty description="Could not load updates." style={{marginTop: 40, marginBottom: 40}}/>;
  }

  return (
    <div style={{ padding: '24px 8px' }}>
      {sortedDates.map(dateStr => (
        <div key={dateStr} style={{ marginBottom: '24px' }}>
          <div style={{ 
            paddingBottom: '8px', 
            marginBottom: '16px', 
            borderBottom: `1px solid ${theme === 'dark' ? '#303030' : '#d9d9d9'}` 
          }}>
            <Space align="center">
              <CalendarOutlined style={{ color: theme === 'dark' ? '#8c8c8c' : '#595959' }} />
              <Title level={5} style={{ margin: 0, color: theme === 'dark' ? 'rgba(255,255,255,0.85)' : undefined }}>
                Updates on {dayjs(dateStr).format('MMMM D, YYYY')}
              </Title>
            </Space>
          </div>

          {groupedUpdates[dateStr].map(update => (
            <div 
              key={update.id} 
              style={{
                border: `1px solid ${theme === 'dark' ? '#303030' : '#e8e8e8'}`,
                borderRadius: '6px',
                padding: '16px',
                marginBottom: '16px',
                background: theme === 'dark' ? '#1e1e1e' : '#fff',
              }}
            >
              {/* Hàng trên cùng: Summary và các actions/info phụ */}
              <Row justify="space-between" align="top" style={{ marginBottom: '8px' }}>
                <Col xs={24} md={18}>
                  <Text strong style={{ fontSize: '1.05rem', color: theme === 'dark' ? 'rgba(255,255,255,0.9)' : undefined, display: 'block' }}>
                    {update.summary || "Project Update"}
                  </Text>
                </Col>
                <Col xs={24} md={6} style={{ textAlign: 'right' }}>
                  <Space direction={window.innerWidth < 768 ? "vertical" : "horizontal"} align="end" size="small" wrap>
                    {/* Có thể thêm ID của update hoặc link xem chi tiết update nếu có */}
                    {/* <Text type="secondary" style={{fontFamily: 'monospace', fontSize: '0.8em'}}>ID: {update.id}</Text> */}
                     <Tag icon={update.published ? <EyeOutlined /> : <EyeInvisibleOutlined />} color={update.published ? "success" : "default"} style={{fontSize: '0.8em'}}>
                        {update.published ? 'Published' : 'Internal'}
                    </Tag>
                  </Space>
                </Col>
              </Row>

              {/* Hàng thông tin user và ngày */}
              <Row align="middle" style={{ marginBottom: '12px' }}>
                <Col>
                  {renderUser(update.createdBy, theme)}
                  <Text type="secondary" style={{ marginLeft: '8px', fontSize: '0.85em' }}>
                     committed on {dayjs(update.updateDate).format('MMM D')}
                  </Text>
                </Col>
              </Row>
              
              {/* Details */}
              {update.details && (
                <div style={{marginBottom: '12px', paddingLeft: '30px'}}> {/* Thụt lề cho details */}
                  <Paragraph 
                    ellipsis={{ rows: 3, expandable: true, symbol: <Text strong style={{color: '#1677ff', fontSize:'0.9em'}}>more</Text> }}
                    style={{color: theme === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)', whiteSpace: 'pre-line', lineHeight: '1.6', fontSize: '0.9em'}}
                  >
                    {update.details}
                  </Paragraph>
                </div>
              )}
              
              {/* Status và Progress */}
              <Row gutter={16} align="middle" style={{paddingLeft: '30px'}}>
                {update.statusAtUpdate && (
                    <Col>
                        <Text style={{...getUpdateStatusStyle(update.statusAtUpdate, theme)}}>
                            <InfoCircleOutlined style={{marginRight: 3}}/> Status: {update.statusAtUpdate.replace(/_/g, " ")}
                        </Text>
                    </Col>
                )}
                {update.completionPercentage !== null && update.completionPercentage !== undefined && (
                  <Col>
                    <Space align="center" size="small">
                      <PercentageOutlined style={{color: theme === 'dark' ? '#8c8c8c' : '#595959', fontSize:'0.9em'}}/>
                      <Text style={{color: theme === 'dark' ? 'rgba(255,255,255,0.85)' : undefined, fontSize: '0.9em', marginRight: '4px'}}>Progress: </Text>
                      <Progress 
                        percent={update.completionPercentage} 
                        size="small" 
                        style={{width: '100px'}} 
                        status={update.completionPercentage === 100 ? 'success' : (update.completionPercentage > 70 ? 'normal' : (update.completionPercentage < 30 ? 'exception' : 'active'))} 
                      />
                    </Space>
                  </Col>
                )}
              </Row>
              {/* Bạn có thể thêm nút "Browse files" ở đây nếu có chức năng snapshot */}
              {/* <Button size="small" style={{marginTop: 10, marginLeft: 30}} onClick={() => handleBrowseSnapshot(update.id)}>Browse files at this update</Button> */}

            </div>
          ))}
        </div>
      ))}

      {/* Nút Load More và text "All updates loaded" */}
      {!allUpdatesLoaded && !loading && updatesPage && updatesPage.content.length > 0 && (
        <Row justify="center" style={{ marginTop: 20 }}>
          <Button onClick={handleLoadMore} disabled={loading || allUpdatesLoaded}>
            Load More Updates
          </Button>
        </Row>
      )}
       {!loading && allUpdatesLoaded && updatesPage && updatesPage.content.length > 0 && (
        <Row justify="center" style={{ marginTop: 20 }}>
            <Text type="secondary">All updates loaded.</Text>
        </Row>
      )}
    </div>
  );
};

export default ProjectUpdatesTab;