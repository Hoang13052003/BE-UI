import React from "react";
import { Card, Timeline, Row, Col, Tag, Progress, Divider } from "antd";
import { ProjectUpdateTimelineDto } from "../../../types/project";

interface Props {
  updates: ProjectUpdateTimelineDto[];
}

const ProjectLaborUpdatesTimeline: React.FC<Props> = ({ updates }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'blue';
      case 'in_progress': return 'orange';
      case 'completed': return 'green';
      case 'feedback': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <Card 
      title="Project Updates Timeline"
      style={{ width: '100%', minHeight: '400px' }}
      bodyStyle={{ padding: '20px' }}
    >
      <Timeline
        mode="left"
        style={{ width: '100%' }}
        items={updates.map(update => ({
          color: update.published ? "green" : "gray",
          children: (
            <div style={{ 
              width: '100%', 
              maxWidth: '100%',
              padding: '16px',
              backgroundColor: '#fafafa',
              borderRadius: '8px',
              border: '1px solid #e8e8e8',
              marginBottom: '16px'
            }}>
              {/* Header Row - Basic Info */}
              <Row gutter={[16, 8]} style={{ marginBottom: '16px' }}>
                <Col xs={24} sm={12} md={6}>
                  <div style={{ fontWeight: 'bold', color: '#1890ff', marginBottom: '4px' }}>Date:</div>
                  <div style={{ fontSize: '14px' }}>{update.updateDate}</div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div style={{ fontWeight: 'bold', color: '#1890ff', marginBottom: '4px' }}>Updated By:</div>
                  <div style={{ fontSize: '14px' }}>{update.createdBy.fullName}</div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div style={{ fontWeight: 'bold', color: '#1890ff', marginBottom: '4px' }}>Status:</div>
                  <Tag color={getStatusColor(update.statusAtUpdate)}>
                    {update.statusAtUpdate}
                  </Tag>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div style={{ fontWeight: 'bold', color: '#1890ff', marginBottom: '4px' }}>Published:</div>
                  <Tag color={update.published ? 'green' : 'red'}>
                    {update.published ? 'Published' : 'Draft'}
                  </Tag>
                </Col>
              </Row>
              
              <Divider style={{ margin: '12px 0' }} />
              
              {/* Content Row - Summary & Details */}
              <Row gutter={[16, 8]} style={{ marginBottom: '16px' }}>
                <Col xs={24} lg={12}>
                  <div style={{ fontWeight: 'bold', color: '#1890ff', marginBottom: '8px' }}>Summary:</div>
                  <div style={{ 
                    padding: '12px',
                    backgroundColor: '#fff',
                    borderRadius: '6px',
                    border: '1px solid #e8e8e8',
                    wordBreak: 'break-word',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    {update.summary}
                  </div>
                </Col>
                {update.details && (
                  <Col xs={24} lg={12}>
                    <div style={{ fontWeight: 'bold', color: '#1890ff', marginBottom: '8px' }}>Details:</div>
                    <div style={{ 
                      padding: '12px',
                      backgroundColor: '#fff',
                      borderRadius: '6px',
                      border: '1px solid #e8e8e8',
                      wordBreak: 'break-word',
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}>
                      {update.details}
                    </div>
                  </Col>
                )}
              </Row>

              {/* Progress Row */}
              {(update.overallProcess !== null || update.actualProcess !== null) && (
                <>
                  <Divider style={{ margin: '12px 0' }} />
                  <Row gutter={[16, 8]}>
                    {update.overallProcess !== null && (
                      <Col xs={24} md={12}>
                        <div style={{ fontWeight: 'bold', color: '#1890ff', marginBottom: '8px' }}>
                          Overall Progress: {update.overallProcess}%
                        </div>
                        <Progress 
                          percent={update.overallProcess} 
                          strokeColor="#1890ff"
                          trailColor="#f0f0f0"
                          showInfo={false}
                        />
                      </Col>
                    )}
                    {update.actualProcess !== null && (
                      <Col xs={24} md={12}>
                        <div style={{ fontWeight: 'bold', color: '#1890ff', marginBottom: '8px' }}>
                          Actual Progress: {update.actualProcess}%
                        </div>
                        <Progress 
                          percent={update.actualProcess} 
                          strokeColor="#52c41a"
                          trailColor="#f0f0f0"
                          showInfo={false}
                        />
                      </Col>
                    )}
                  </Row>
                </>
              )}
            </div>
          )
        }))}
      />
    </Card>
  );
};

export default ProjectLaborUpdatesTimeline; 