import React from 'react';
import { Typography, Space } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

interface MilestoneInfoProps {
  name: string | null;
  description: string | null;
  notes: string | null;
  completed?: boolean;
}

const MilestoneInfo: React.FC<MilestoneInfoProps> = ({ name, description, notes, completed }) => {
  const textDecorationStyle = completed ? 'line-through' : 'none';
  const textColor = completed ? 'text-secondary' : undefined; // Optional: làm mờ chữ hơn khi completed

  return (
    <Space direction="vertical" size={4} style={{ width: '100%' }}>
      <Text
        strong
        style={{ fontSize: '16px', textDecoration: textDecorationStyle }}
        className={textColor} // Áp dụng class nếu có
      >
        {name || 'Unnamed Milestone'} {/* Cung cấp giá trị mặc định tốt hơn 'emty' */}
      </Text>
      {description && ( // Chỉ render Paragraph nếu có description
        <Paragraph
          type="secondary"
          style={{ whiteSpace: 'pre-wrap', margin: 0, textDecoration: textDecorationStyle }}
          className={textColor}
        >
          {description}
        </Paragraph>
      )}
      {notes && ( // Chỉ render phần notes nếu có notes
        <div style={{ marginTop: completed && !description ? 0 : 8 }}> {/* Điều chỉnh margin nếu không có description */}
          <Space align="start">
            <FileTextOutlined style={{ color: '#8c8c8c', marginTop: '4px' }} />
            <Paragraph
              type="secondary"
              style={{ margin: 0, whiteSpace: 'pre-wrap', textDecoration: textDecorationStyle }}
              className={textColor}
            >
              {notes}
            </Paragraph>
          </Space>
        </div>
      )}
    </Space>
  );
};

export default MilestoneInfo;