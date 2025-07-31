import React, { useState, useEffect } from "react";
import {
  Spin,
  Empty,
} from "antd";
import { getProjectUpdateHistoryEnhanced } from '../../../api/projectUpdateHistoryApi';
import AllDataSection from './sections/AllDataSection';
import CurrentWeekSection from './sections/CurrentWeekSection';
import CompletedPreviousWeekSection from './sections/CompletedPreviousWeekSection';
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);


interface ProjectUpdateHistoryMilestonesTabProps {
  historyId: string;
  projectType: string;
}


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
