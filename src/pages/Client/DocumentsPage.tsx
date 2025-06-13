import React from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Avatar,
  Dropdown
} from 'antd';
import {
  SearchOutlined,
  FolderAddOutlined,
  UploadOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  FileOutlined,
  FolderOutlined,
  CodeOutlined,
  UserOutlined,
  MoreOutlined,
  ShareAltOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface Folder {
  name: string;
  files: number;
  size: string;
  icon: React.ReactNode;
}

interface Document {
  name: string;
  size: string;
  date: string;
  author: string;
  type: 'pdf' | 'fig' | 'md' | 'xlsx';
}

const DocumentsPage: React.FC = () => {
  const folders: Folder[] = [
    {
      name: 'Design Assets',
      files: 12,
      size: '235 MB',
      icon: <FolderOutlined style={{ fontSize: '24px', color: '#1677ff' }} />
    },
    {
      name: 'Documentation',
      files: 8,
      size: '156 MB',
      icon: <FileOutlined style={{ fontSize: '24px', color: '#1677ff' }} />
    },
    {
      name: 'Development',
      files: 15,
      size: '340 MB',
      icon: <CodeOutlined style={{ fontSize: '24px', color: '#1677ff' }} />
    },
    {
      name: 'Client Assets',
      files: 6,
      size: '89 MB',
      icon: <UserOutlined style={{ fontSize: '24px', color: '#1677ff' }} />
    }
  ];

  const documents: Document[] = [
    {
      name: 'Project Requirements.pdf',
      size: '2.4 MB',
      date: '2024-02-20',
      author: 'John Smith',
      type: 'pdf'
    },
    {
      name: 'UI Design Mockups.fig',
      size: '15.8 MB',
      date: '2024-02-18',
      author: 'Sarah Johnson',
      type: 'fig'
    },
    {
      name: 'API Documentation.md',
      size: '856 KB',
      date: '2024-02-15',
      author: 'Mike Wilson',
      type: 'md'
    },
    {
      name: 'Project Timeline.xlsx',
      size: '1.2 MB',
      date: '2024-02-14',
      author: 'David Brown',
      type: 'xlsx'
    },
    {
      name: 'Brand Guidelines.pdf',
      size: '4.5 MB',
      date: '2024-02-12',
      author: 'Emily Davis',
      type: 'pdf'
    }
  ];

  const getFileIcon = (type: Document['type']) => {
    switch (type) {
      case 'pdf':
        return <FileOutlined style={{ color: '#ff4d4f' }} />;
      case 'fig':
        return <FileOutlined style={{ color: '#722ed1' }} />;
      case 'md':
        return <FileOutlined style={{ color: '#52c41a' }} />;
      case 'xlsx':
        return <FileOutlined style={{ color: '#1677ff' }} />;
    }
  };
  const actionMenu = {
    items: [
      { key: '1', label: 'Download' },
      { key: '2', label: 'Rename' },
      { key: '3', label: 'Delete' },
    ]
  };

  return (
    <React.Fragment>
      <Card>
        {/* Header */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Title level={4} style={{ margin: 0 }}>E-commerce Platform</Title>
            <Text type="secondary">/ Documents</Text>
          </Space>
          <Button type="primary" icon={<UploadOutlined />}>
            Upload Files
          </Button>
        </div>

        {/* Search and Actions */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search files..."
              style={{ width: 300 }}
            />
          </Col>
          <Col>
            <Space>
              <Button icon={<FolderAddOutlined />}>New Folder</Button>
              <Button type="text" icon={<AppstoreOutlined />} />
              <Button type="text" icon={<UnorderedListOutlined />} />
            </Space>
          </Col>
        </Row>

        {/* Folders Grid */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {folders.map((folder, index) => (
            <Col span={6} key={index}>
              <Card hoverable style={{ textAlign: 'center' }}>
                {folder.icon}
                <Title level={5} style={{ margin: '12px 0 4px' }}>{folder.name}</Title>
                <Text type="secondary">{folder.files} files • {folder.size}</Text>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Files List */}
        {documents.map((doc, index) => (
          <Row 
            key={index}
            align="middle" 
            style={{ 
              padding: '12px', 
              borderBottom: '1px solid #f0f0f0',
              backgroundColor: index % 2 ? '#fafafa' : 'white' 
            }}
          >
            <Col span={12}>
              <Space>
                {getFileIcon(doc.type)}
                <div>
                  <div>{doc.name}</div>
                  <Space size="small">
                    <Text type="secondary">{doc.size}</Text>
                    <Text type="secondary">•</Text>
                    <Text type="secondary">{doc.date}</Text>
                  </Space>
                </div>
              </Space>
            </Col>
            <Col span={8}>
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                <Text>{doc.author}</Text>
              </Space>
            </Col>
            <Col span={4} style={{ textAlign: 'right' }}>
              <Space>
                <Button type="text" icon={<ShareAltOutlined />} />
                <Dropdown menu={actionMenu} placement="bottomRight">
                  <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
              </Space>
            </Col>
          </Row>
        ))}
      </Card>
    </React.Fragment>
  );
};

export default DocumentsPage;