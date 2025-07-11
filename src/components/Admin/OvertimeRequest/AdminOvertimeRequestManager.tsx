import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Input,
  Select,
  DatePicker,
  Empty,
  Tooltip,
  Badge,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FilterOutlined,
  ProjectOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';
import dayjs from "dayjs";
import { getOvertimeRequestsPaginatedApi, OvertimeRequestFilters } from "../../../api/overtimeRequestApi";
import { useAlert } from "../../../contexts/AlertContext";
import { useAuth } from "../../../contexts/AuthContext";
import { OvertimeRequest, OvertimeRequestStatus } from "../../../types/overtimeRequest";
import ReviewOvertimeRequestModal from "./ReviewOvertimeRequestModal";
import UnauthorizedPage from "../../../pages/UnauthorizedPage";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

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

const AdminOvertimeRequestManager: React.FC = () => {
  const { userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<OvertimeRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<OvertimeRequest | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isViewOnlyMode, setIsViewOnlyMode] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'ALL',
    projectType: 'ALL',
    dateRange: null,
  });
  // Thêm state cho debounce search input
  const [searchInput, setSearchInput] = useState(filters.search);
  const [pagination, setPagination] = useState<PaginationState>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const { addAlert } = useAlert();

  // Security: Only ADMIN can access this component
  if (userRole !== "ADMIN") {
    return <UnauthorizedPage />;
  }

  useEffect(() => {
    fetchOvertimeRequests();
  }, [refreshTrigger, filters, pagination.current, pagination.pageSize]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== filters.search) {
        handleFilterChange({ search: searchInput });
        setRefreshTrigger(prev => prev + 1);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

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

      // Calculate stats from current page data
      // Note: For accurate stats, you might want a separate API endpoint
      const currentStats = {
        total: response.totalElements,
        pending: response.content.filter(r => r.status === 'PENDING').length,
        approved: response.content.filter(r => r.status === 'APPROVED').length,
        rejected: response.content.filter(r => r.status === 'REJECTED').length,
      };
      setStats(currentStats);

    } catch (error: any) {
      addAlert(error.response?.data?.message || "Failed to fetch overtime requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (request: OvertimeRequest) => {
    setSelectedRequest(request);
    setIsViewOnlyMode(true);
    setShowReviewModal(true);
  };

  const handleReview = (request: OvertimeRequest) => {
    if (request.status !== 'PENDING') {
      addAlert("Only pending requests can be reviewed", "warning");
      return;
    }
    setSelectedRequest(request);
    setIsViewOnlyMode(false);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    setSelectedRequest(null);
    setIsViewOnlyMode(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleModalCancel = () => {
    setShowReviewModal(false);
    setSelectedRequest(null);
    setIsViewOnlyMode(false);
  };

  const handleTableChange = (pagination: any) => {
    setPagination(prev => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'ALL',
      projectType: 'ALL',
      dateRange: null,
    });
    setPagination(prev => ({ ...prev, current: 1 }));
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
        return <CloseCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const columns: ColumnsType<OvertimeRequest> = [
    {
      title: 'Request ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: number) => (
        <Text strong style={{ color: '#1890ff' }}>#{id}</Text>
      ),
    },
    {
      title: 'Project',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
      render: (projectName: string, record: OvertimeRequest) => (
        <Space direction="vertical" size={0}>
          <Text strong>{projectName}</Text>
          <Tag color="blue">
            {record.projectType}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Requested By',
      dataIndex: 'requestedByName',
      key: 'requestedByName',
      width: 120,
      render: (name: string) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <Text>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Current End Date',
      dataIndex: 'currentPlannedEndDate',
      key: 'currentPlannedEndDate',
      width: 120,
      render: (date: string) => (
        <Text>{dayjs(date).format("MMM DD, YYYY")}</Text>
      ),
    },
    {
      title: 'Requested End Date',
      dataIndex: 'requestedPlannedEndDate',
      key: 'requestedPlannedEndDate',
      width: 120,
      render: (date: string) => (
        <Text style={{ color: '#52c41a', fontWeight: 600 }}>
          {dayjs(date).format("MMM DD, YYYY")}
        </Text>
      ),
    },
    {
      title: 'Extension',
      key: 'extension',
      width: 100,
      render: (_, record: OvertimeRequest) => {
        const days = dayjs(record.requestedPlannedEndDate)
          .diff(dayjs(record.currentPlannedEndDate), 'day');
        return (
          <Tag color={days > 0 ? 'purple' : 'green'}>
            {days > 0 ? `+${days}` : days} days
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: OvertimeRequestStatus) => (
        <Tag
          color={getStatusColor(status)}
          icon={getStatusIcon(status)}
          style={{ fontWeight: 600 }}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: 'Requested Date',
      dataIndex: 'requestedDate',
      key: 'requestedDate',
      width: 140,
      render: (date: string) => (
        <Text>{dayjs(date).format("MMM DD, YYYY HH:mm")}</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record: OvertimeRequest) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          {record.status === 'PENDING' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleReview(record)}
            >
              Review
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={3} style={{ margin: 0 }}>
                Overtime Request Management
              </Title>
              <Text type="secondary">
                Review and manage all overtime extension requests
              </Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Requests"
              value={stats.total}
              prefix={<ProjectOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Pending Review"
              value={stats.pending}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Approved"
              value={stats.approved}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Rejected"
              value={stats.rejected}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
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

      {/* Requests Table */}
      <Card
        title={
          <Space>
            <Title level={5} style={{ margin: 0 }}>
              Overtime Requests
            </Title>
            {stats.pending > 0 && (
              <Badge count={stats.pending} style={{ backgroundColor: '#faad14' }}>
                <Tag>Pending Review</Tag>
              </Badge>
            )}
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} requests`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          locale={{
            emptyText: (
              <Empty
                description="No overtime requests found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Text type="secondary">
                  {filters.search || filters.status !== 'ALL' || filters.projectType !== 'ALL' || filters.dateRange
                    ? "Try adjusting your filters or project name search"
                    : "No overtime requests have been submitted yet"}
                </Text>
              </Empty>
            ),
          }}
        />
      </Card>

      {/* Review Modal */}
      <ReviewOvertimeRequestModal
        visible={showReviewModal}
        request={selectedRequest}
        onCancel={handleModalCancel}
        onSuccess={handleReviewSuccess}
        viewOnly={isViewOnlyMode}
      />
    </div>
  );
};

export default AdminOvertimeRequestManager; 