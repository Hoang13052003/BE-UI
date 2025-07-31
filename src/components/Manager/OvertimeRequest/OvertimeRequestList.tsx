import React, { useState, useEffect } from "react";
import {
  Card,
  List,
  Tag,
  Space,
  Typography,
  Button,
  Row,
  Col,
  Divider,
  Empty,
  Spin,
  Input,
  Select,
  DatePicker,
  Tooltip,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  ProjectOutlined,
  EyeOutlined,
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getOvertimeRequestsPaginatedApi, OvertimeRequestFilters } from "../../../api/overtimeRequestApi";
import { useAlert } from "../../../contexts/AlertContext";
import { OvertimeRequest, OvertimeRequestStatus } from "../../../types/overtimeRequest";

const { Text, Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface OvertimeRequestListProps {
  refreshTrigger?: number;
  onViewDetails?: (request: OvertimeRequest) => void;
}

interface FilterState {
  search: string;
  status: OvertimeRequestStatus | 'ALL';
  projectType: 'LABOR' | 'FIXED_PRICE' | 'ALL';
  dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
}

interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

const OvertimeRequestList: React.FC<OvertimeRequestListProps> = ({
  refreshTrigger = 0,
  onViewDetails,
}) => {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<OvertimeRequest[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [localRefreshTrigger, setLocalRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'ALL',
    projectType: 'ALL',
    dateRange: null,
  });
  const [pagination, setPagination] = useState<PaginationState>({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const { addAlert } = useAlert();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== filters.search) {
        handleFilterChange({ search: searchInput });
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    fetchOvertimeRequests();
  }, [refreshTrigger, localRefreshTrigger, filters, pagination.current, pagination.pageSize]);

  const fetchOvertimeRequests = async () => {
    setLoading(true);
    try {
      // Build API filters
      const apiFilters: OvertimeRequestFilters = {
        page: pagination.current - 1, // Backend uses 0-based indexing
        size: pagination.pageSize,
        sort: ['requestedDate,desc'], // Default sort by requested date descending
      };

      // Add status filter
      if (filters.status !== 'ALL') {
        apiFilters.status = filters.status;
      }

      // Add project type filter
      if (filters.projectType !== 'ALL') {
        apiFilters.projectType = filters.projectType;
      }

      // Add project name filter for search
      if (filters.search.trim()) {
        apiFilters.projectName = filters.search.trim();
      }

      const response = await getOvertimeRequestsPaginatedApi(apiFilters);
      
      setRequests(response.content);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements,
      }));

    } catch (error: any) {
      addAlert(error.response?.data?.message || "Failed to fetch overtime requests", "error");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page when filters change
    setLocalRefreshTrigger(prev => prev + 1); // Trigger fetch
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'ALL',
      projectType: 'ALL',
      dateRange: null,
    });
    setSearchInput('');
    setPagination(prev => ({ ...prev, current: 1 }));
    setLocalRefreshTrigger(prev => prev + 1); // Trigger fetch
  };

  const handleTableChange = (pagination: any) => {
    setPagination(prev => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  const getStatusColor = (status: OvertimeRequestStatus): string => {
    switch (status) {
      case "PENDING":
        return "orange";
      case "APPROVED":
        return "green";
      case "REJECTED":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: OvertimeRequestStatus) => {
    switch (status) {
      case "PENDING":
        return <ClockCircleOutlined />;
      case "APPROVED":
        return <CheckCircleOutlined />;
      case "REJECTED":
        return <ExclamationCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const calculateDaysExtension = (currentEnd: string, requestedEnd: string): number => {
    const current = dayjs(currentEnd);
    const requested = dayjs(requestedEnd);
    return requested.diff(current, "day");
  };

  const renderRequestItem = (request: OvertimeRequest) => {
    const daysExtension = calculateDaysExtension(
      request.currentPlannedEndDate,
      request.requestedPlannedEndDate
    );

    return (
      <List.Item
        style={{
          border: "1px solid #f0f0f0",
          borderRadius: 12,
          marginBottom: 16,
          padding: 0,
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ padding: "20px", width: "100%" }}>
          {/* Header */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
            <Space>
              <Tag
                color={getStatusColor(request.status)}
                icon={getStatusIcon(request.status)}
                style={{ fontWeight: 600, borderRadius: 6 }}
              >
                {request.status}
              </Tag>
              <Tag style={{ background: "#f6f6f6", border: "none", borderRadius: 6 }}>
                <ProjectOutlined style={{ marginRight: 4 }} />
                {request.projectType}
              </Tag>
            </Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              #{request.id}
            </Text>
          </Row>

          {/* Project Info */}
          <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
            <Col span={24}>
              <Space direction="vertical" size={0}>
                <Space>
                  <ProjectOutlined style={{ color: "#1890ff" }} />
                  <Text strong style={{ fontSize: 16 }}>
                    Project: {request.projectName}
                  </Text>
                </Space>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ID: {request.projectId}
                </Text>
              </Space>
            </Col>
          </Row>

          {/* Date Information */}
          <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={8}>
              <Space direction="vertical" size={0}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Current End Date
                </Text>
                <Space>
                  <CalendarOutlined style={{ color: "#faad14" }} />
                  <Text>{dayjs(request.currentPlannedEndDate).format("MMM DD, YYYY")}</Text>
                </Space>
              </Space>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Space direction="vertical" size={0}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Requested End Date
                </Text>
                <Space>
                  <CalendarOutlined style={{ color: "#52c41a" }} />
                  <Text>{dayjs(request.requestedPlannedEndDate).format("MMM DD, YYYY")}</Text>
                </Space>
              </Space>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Space direction="vertical" size={0}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Extension Period
                </Text>
                <Space>
                  <ClockCircleOutlined style={{ color: "#722ed1" }} />
                  <Text style={{ fontWeight: 600, color: daysExtension > 0 ? "#722ed1" : "#52c41a" }}>
                    {daysExtension > 0 ? `+${daysExtension} days` : `${daysExtension} days`}
                  </Text>
                </Space>
              </Space>
            </Col>
          </Row>

          {/* Reason */}
          <div style={{ marginBottom: 16 }}>
            <Space style={{ marginBottom: 8 }}>
              <FileTextOutlined style={{ color: "#1890ff" }} />
              <Text strong>Reason:</Text>
            </Space>
            <div
              style={{
                background: "#fafafa",
                padding: 12,
                borderRadius: 8,
                borderLeft: "4px solid #1890ff",
              }}
            >
              <Text>{request.reason}</Text>
            </div>
          </div>

          {/* Request Details */}
          <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12}>
              <Space>
                <UserOutlined style={{ color: "#1890ff" }} />
                <Space direction="vertical" size={0}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Requested by
                  </Text>
                  <Text>{request.requestedByName}</Text>
                </Space>
              </Space>
            </Col>
            <Col xs={24} sm={12}>
              <Space>
                <CalendarOutlined style={{ color: "#1890ff" }} />
                <Space direction="vertical" size={0}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Requested on
                  </Text>
                  <Text>{dayjs(request.requestedDate).format("MMM DD, YYYY HH:mm")}</Text>
                </Space>
              </Space>
            </Col>
          </Row>

          {/* Review Information (if reviewed) */}
          {(request.reviewedBy || request.reviewNote) && (
            <>
              <Divider style={{ margin: "16px 0" }} />
              <div style={{ background: "#f6f6f6", padding: 12, borderRadius: 8 }}>
                <Text strong style={{ display: "block", marginBottom: 8 }}>
                  Review Information:
                </Text>
                <Row gutter={[16, 8]}>
                  {request.reviewedBy && (
                    <Col xs={24} sm={12}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Reviewed by:
                      </Text>
                      <br />
                      <Text>{request.reviewedBy}</Text>
                    </Col>
                  )}
                  {request.reviewedDate && (
                    <Col xs={24} sm={12}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Reviewed on:
                      </Text>
                      <br />
                      <Text>{dayjs(request.reviewedDate).format("MMM DD, YYYY HH:mm")}</Text>
                    </Col>
                  )}
                </Row>
                {request.reviewNote && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Review Note:
                    </Text>
                    <br />
                    <Text>{request.reviewNote}</Text>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Actions */}
          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onViewDetails?.(request)}
            >
              View Details
            </Button>
          </div>
        </div>
      </List.Item>
    );
  };

  if (loading) {
    return (
      <div>
        {/* Filters - Always visible even when loading */}
        <Card title="Filters" style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Search
                placeholder="Search by project name"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                style={{ width: '100%' }}
                placeholder="Status"
                value={filters.status}
                onChange={(value) => handleFilterChange({ status: value })}
              >
                <Option value="ALL">All Status</Option>
                <Option value="PENDING">Pending</Option>
                <Option value="APPROVED">Approved</Option>
                <Option value="REJECTED">Rejected</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                style={{ width: '100%' }}
                placeholder="Project Type"
                value={filters.projectType}
                onChange={(value) => handleFilterChange({ projectType: value })}
              >
                <Option value="ALL">All Types</Option>
                <Option value="LABOR">Labor</Option>
                <Option value="FIXED_PRICE">Fixed Price</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                style={{ width: '100%' }}
                value={filters.dateRange}
                onChange={(dates) => handleFilterChange({ dateRange: dates })}
                placeholder={['Start Date', 'End Date']}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Button
                icon={<FilterOutlined />}
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Loading Results */}
        <Card>
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>Loading overtime requests...</Text>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Filters - Always visible */}
      <Card title="Filters" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Search
              placeholder="Search by project name"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Status"
              value={filters.status}
              onChange={(value) => handleFilterChange({ status: value })}
            >
              <Option value="ALL">All Status</Option>
              <Option value="PENDING">Pending</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="REJECTED">Rejected</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="Project Type"
              value={filters.projectType}
              onChange={(value) => handleFilterChange({ projectType: value })}
            >
              <Option value="ALL">All Types</Option>
              <Option value="LABOR">Labor</Option>
              <Option value="FIXED_PRICE">Fixed Price</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              value={filters.dateRange}
              onChange={(dates) => handleFilterChange({ dateRange: dates })}
              placeholder={['Start Date', 'End Date']}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              icon={<FilterOutlined />}
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Results */}
      <Card
        title={
          <Space>
            <ClockCircleOutlined style={{ color: "#1890ff" }} />
            <Title level={5} style={{ margin: 0 }}>
              Overtime Requests ({requests.length})
            </Title>
          </Space>
        }
      >
        <List
          dataSource={requests}
          renderItem={renderRequestItem}
          pagination={
            requests.length > 0
              ? {
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} requests`,
                  pageSizeOptions: ['5', '10', '20', '50'],
                  onChange: handleTableChange,
                }
              : false
          }
          locale={{
            emptyText: (
              <Empty
                description="No overtime requests found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Text type="secondary">
                  {filters.search || filters.status !== 'ALL' || filters.projectType !== 'ALL' || filters.dateRange
                    ? "Try adjusting your filters or project name search"
                    : "You haven't created any overtime requests yet"}
                </Text>
              </Empty>
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default OvertimeRequestList; 