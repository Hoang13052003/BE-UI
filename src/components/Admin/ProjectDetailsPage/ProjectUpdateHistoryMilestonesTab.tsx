import React, { useState, useEffect, useCallback } from "react";
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
  DatePicker,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  FlagOutlined,
  SyncOutlined,
  AppstoreOutlined,
  BarsOutlined,
  SearchOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { ApiPage } from "../../../types/project";
import { getProjectUpdateHistoryEnhanced } from '../../../api/projectUpdateHistoryApi';
import AllDataSection from './sections/AllDataSection';
import CurrentWeekSection from './sections/CurrentWeekSection';
import CompletedPreviousWeekSection from './sections/CompletedPreviousWeekSection';
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import { isMilestoneCompleted, isOverdueMilestone, calculateMilestoneStats } from "../../../utils/milestoneUtils";

const { Text, Title } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

interface ProjectUpdateHistoryMilestonesTabProps {
  historyId: string;
  projectType: string;
}

const getMilestoneStatusColor = (status: string | null): string => {
  if (!status) return "default";
  switch (status) {
    case "TODO":
      return "blue";
    case "DOING":
      return "processing";
    case "PENDING":
      return "warning";
    case "COMPLETED":
      return "success";
    default:
      return "default";
  }
};
const getMilestoneStatusIcon = (status: string | null) => {
  switch (status) {
    case "TODO":
      return <ClockCircleOutlined />;
    case "DOING":
      return <SyncOutlined spin />;
    case "PENDING":
      return <FileTextOutlined />;
    case "COMPLETED":
      return <CheckCircleOutlined />;
    default:
      return <FlagOutlined />;
  }
};
const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return "#52c41a";
  if (percentage >= 70) return "#faad14";
  if (percentage >= 50) return "#1890ff";
  return "#ff4d4f";
};

const ProjectUpdateHistoryMilestonesTab: React.FC<ProjectUpdateHistoryMilestonesTabProps> = ({ historyId, projectType }) => {
  const [historyData, setHistoryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
    setLoading(true);
    try {
        const res = await getProjectUpdateHistoryEnhanced(historyId);
        setHistoryData(res);
      } catch (e) {
        setHistoryData(null);
    } finally {
      setLoading(false);
    }
    };
    if (historyId) fetchData();
  }, [historyId]);

  if (loading) return <Spin size="large" tip="Loading milestone history..." />;
  if (!historyData) return <Empty description="No history data found" />;
  if (projectType !== 'FIXED_PRICE') return <Empty description="Not a fixed price project" />;

  return (
    <div>
      <AllDataSection data={historyData.allData} type="milestone" />
      <CurrentWeekSection data={historyData.currentWeekData} type="milestone" />
      <CompletedPreviousWeekSection data={historyData.completedPreviousWeekData} type="milestone" />
    </div>
  );
};

export default ProjectUpdateHistoryMilestonesTab;
