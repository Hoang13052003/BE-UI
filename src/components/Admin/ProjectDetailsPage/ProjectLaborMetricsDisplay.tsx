import React from "react";
import { Card, Row, Col, Statistic, Typography } from "antd";
import { ProjectLaborDetailResponse } from "../../../types/project";
import { PieChart, Pie, Cell } from "recharts";
import { ClockCircleOutlined, CheckCircleOutlined, HourglassOutlined, CalendarOutlined, FieldTimeOutlined, FundOutlined, DollarCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Props {
  project: ProjectLaborDetailResponse;
}

const COLORS = ["#36cfc9", "#e6f7ff"];
const PIE_SHADOW = {
  filter: "drop-shadow(0 1px 2px rgba(24,144,255,0.06))"
};

const STATISTICS = [
  {
    title: "Overall Progress",
    valueKey: "overallProcess",
    suffix: "%",
    icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  },
  {
    title: "Actual Progress",
    valueKey: "actualProcess",
    suffix: "%",
    icon: <FundOutlined style={{ color: '#1890ff' }} />,
  },
  {
    title: "Remaining Hours",
    valueKey: "remainingHours",
    suffix: "h",
    icon: <HourglassOutlined style={{ color: '#faad14' }} />,
  },
  {
    title: "Days Until Deadline",
    valueKey: "daysUntilDeadline",
    icon: <CalendarOutlined style={{ color: '#722ed1' }} />,
  },
  {
    title: "Total Actual Hours",
    valueKey: "totalActualHours",
    suffix: "h",
    icon: <FieldTimeOutlined style={{ color: '#13c2c2' }} />,
  },
  {
    title: "Total Estimated Hours",
    valueKey: "totalEstimatedHours",
    suffix: "h",
    icon: <ClockCircleOutlined style={{ color: '#eb2f96' }} />,
  },
  {
    title: "Budget",
    valueKey: "totalBudget",
    suffix: "₫",
    icon: <DollarCircleOutlined style={{ color: '#fa541c' }} />,
  },
];

const ProjectLaborMetricsDisplay: React.FC<Props> = ({ project }) => {
  const progress = project.completionPercentage ?? 0;
  const progressData = [
    { name: "Completed", value: progress },
    { name: "Remaining", value: 100 - progress },
  ];

  return (
    <Card
      title={<Title level={4} style={{ margin: 0 }}>Project Overview (Labor)</Title>}
      style={{ boxShadow: "0 4px 24px rgba(24,144,255,0.08)", borderRadius: 16 }}
      styles={{ body: { padding: 24 } }}
    >
      <Row gutter={[32, 32]} align="middle">
        <Col xs={24} md={6} style={{ textAlign: "center" }}>
          <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto' }}>
            <PieChart width={160} height={160} style={PIE_SHADOW}>
              <Pie
                data={progressData}
                dataKey="value"
                innerRadius={60}
                outerRadius={75}
                startAngle={90}
                endAngle={-270}
                paddingAngle={2}
                stroke="none"
                isAnimationActive={false}
              >
                {progressData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
            {/* Hiển thị % completed ở giữa vòng tròn */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              pointerEvents: 'none',
            }}>
              <span style={{ fontWeight: 700, fontSize: 22, color: '#36cfc9', lineHeight: 1 }}>{progress}%</span>
              <span style={{ fontSize: 13, color: '#888' }}>Complete</span>
            </div>
          </div>
        </Col>
        <Col xs={24} md={18}>
          <Row gutter={[24, 24]}>
            {STATISTICS.map((stat, _idx) => (
              <Col span={8} key={stat.title}>
                <div style={{
                  background: '#f6ffed',
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  minHeight: 80
                }}>
                  {stat.icon}
                  <div>
                    <Text type="secondary" style={{ fontSize: 13 }}>{stat.title}</Text>
                    <div>
                      <Statistic
                        value={typeof project[stat.valueKey as keyof ProjectLaborDetailResponse] === 'number' ? (project[stat.valueKey as keyof ProjectLaborDetailResponse] as number) : 0}
                        suffix={stat.suffix}
                        valueStyle={{ fontWeight: 600, fontSize: 20 }}
                      />
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default ProjectLaborMetricsDisplay; 