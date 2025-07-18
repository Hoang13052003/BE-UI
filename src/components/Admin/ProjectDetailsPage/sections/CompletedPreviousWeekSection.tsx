import React from 'react';
import { Card, List, Table, Typography, Tag, Empty } from 'antd';
const { Title, Text } = Typography;

interface CompletedPreviousWeekSectionProps {
  data: any;
  type: 'timelog' | 'milestone';
}

const CompletedPreviousWeekSection: React.FC<CompletedPreviousWeekSectionProps> = ({ data, type }) => {
  // Render timeLogs
  console.log('Milestones:', data.milestones);
  if (type === 'timelog') {
    return (
      <Card title={<Title level={4}>Completed Previous Week Time Logs</Title>} style={{ marginBottom: 24 }}>
        <Text type="secondary">{data.description}</Text>
        <div style={{ margin: '12px 0' }}>
          <Tag color="orange">Total: {data.totalCount}</Tag>
        </div>
        {data.timeLogs && data.timeLogs.length > 0 ? (
          <Table
            dataSource={data.timeLogs}
            rowKey="id"
            pagination={false}
            columns={[
              { title: 'Performer', dataIndex: 'performerFullName', key: 'performerFullName' },
              { title: 'Task Date', dataIndex: 'taskDate', key: 'taskDate' },
              { title: 'Description', dataIndex: 'taskDescription', key: 'taskDescription' },
              { title: 'Hours', dataIndex: 'hoursSpent', key: 'hoursSpent' },
              { title: 'Status', dataIndex: 'computedTimelogStatus', key: 'computedTimelogStatus', render: (status: string) => <Tag>{status}</Tag> },
              { title: 'Completion %', dataIndex: 'completionPercentage', key: 'completionPercentage' },
            ]}
          />
        ) : (
          <Empty description="No time logs" />
        )}
      </Card>
    );
  }
  // Render milestones
  if (type === 'milestone') {
    console.log('CompletedPreviousWeekSection - Milestones data:', data.milestones);
    return (
      <Card title={<Title level={4}>Completed Previous Week Milestones</Title>} style={{ marginBottom: 24 }}>
        <Text type="secondary">{data.description}</Text>
        <div style={{ margin: '12px 0' }}>
          <Tag color="orange">Total: {data.totalCount}</Tag>
        </div>
        {data.milestones && data.milestones.length > 0 ? (
          <Table
            dataSource={data.milestones}
            rowKey="id"
            pagination={false}
            columns={[
              { title: 'Start Date', dataIndex: 'startDate', key: 'startDate' },
              { title: 'End Date', dataIndex: 'deadlineDate', key: 'deadlineDate', render: (date: string) => date ? new Date(date).toLocaleDateString() : '-' },
              { title: 'Milestone Name', dataIndex: 'name', key: 'name' },
              { title: 'Description', dataIndex: 'description', key: 'description' },
              { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => <Tag>{status}</Tag> },
              { title: 'Progress', dataIndex: 'completionPercentage', key: 'completionPercentage', render: (percent: number) => <span>{percent}%</span> },
            ]}
          />
        ) : (
          <Empty description="No milestones" />
        )}
      </Card>
    );
  }
  return null;
};

export default CompletedPreviousWeekSection; 