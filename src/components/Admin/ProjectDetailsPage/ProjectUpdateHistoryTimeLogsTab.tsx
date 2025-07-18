import React, { useState, useEffect, useCallback } from "react";
import {
  List,
  Spin,
  Empty,
  Pagination,
  Typography,
  message,
  Row,
  Col,
  Tag,
  Space,
  Avatar,
  Card,
  Input,
  Button,
  Tooltip,
  Radio,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  ClearOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
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
const { Text, Paragraph, Title } = Typography;
const { Search } = Input;

interface ProjectUpdateHistoryTimeLogsTabProps {
  historyId: string;
  projectType: string;
}

const ProjectUpdateHistoryTimeLogsTab: React.FC<ProjectUpdateHistoryTimeLogsTabProps> = ({ historyId, projectType }) => {
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

  if (loading) return <Spin size="large" tip="Loading time log history..." />;
  if (!historyData) return <Empty description="No history data found" />;
  if (projectType !== 'LABOR') return <Empty description="Not a labor project" />;

  return (
    <div>
      <AllDataSection data={historyData.allData} type="timelog" />
      <CurrentWeekSection data={historyData.currentWeekData} type="timelog" />
      <CompletedPreviousWeekSection data={historyData.completedPreviousWeekData} type="timelog" />
    </div>
  );
};

export default ProjectUpdateHistoryTimeLogsTab;
