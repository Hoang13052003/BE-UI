import React from 'react';
import {
  Layout,
  Menu,
  Card,
  Input,
  Select,
  Form,
  Button,
  Typography
} from 'antd';
import {
  GlobalOutlined,
  BellOutlined,
  LockOutlined,
  SkinOutlined,
  ApiOutlined,
  SaveOutlined
} from '@ant-design/icons';

const { Sider, Content } = Layout;
const { Title } = Typography;

const SystemSettings: React.FC = () => {
  const [form] = Form.useForm();

  const menuItems = [
    {
      key: 'general',
      icon: <GlobalOutlined />,
      label: 'General',
    },
    {
      key: 'notifications',
      icon: <BellOutlined />,
      label: 'Notifications',
    },
    {
      key: 'security',
      icon: <LockOutlined />,
      label: 'Security',
    },
    {
      key: 'appearance',
      icon: <SkinOutlined />,
      label: 'Appearance',
    },
    {
      key: 'integrations',
      icon: <ApiOutlined />,
      label: 'Integrations',
    },
  ];

  return (
    <Card>
    <Layout style={{ background: '#fff' }}>
      <Sider width={200} style={{ background: '#fff' }}>
        <Menu
          mode="vertical"
          defaultSelectedKeys={['general']}
          style={{ borderRight: 'none' }}
          items={menuItems}
        />
      </Sider>
      <Content style={{ padding: '24px', minHeight: 280 }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            companyName: '',
            timezone: 'UTC+7',
            language: 'English',
            dateFormat: 'DD/MM/YYYY'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <Title level={5} style={{ margin: 0 }}>General Settings</Title>
            <Button type="primary" icon={<SaveOutlined />}>
              Save Changes
            </Button>
          </div>

          <Form.Item
            label="Company Name"
            name="companyName"
          >
            <Input placeholder="Enter company name" />
          </Form.Item>

          <Form.Item
            label="Timezone"
            name="timezone"
          >
            <Select>
              <Select.Option value="UTC+7">UTC+7</Select.Option>
              <Select.Option value="UTC+8">UTC+8</Select.Option>
              <Select.Option value="UTC+9">UTC+9</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Language"
            name="language"
          >
            <Select>
              <Select.Option value="English">English</Select.Option>
              <Select.Option value="Vietnamese">Vietnamese</Select.Option>
              <Select.Option value="Japanese">Japanese</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Date Format"
            name="dateFormat"
          >
            <Select>
              <Select.Option value="DD/MM/YYYY">DD/MM/YYYY</Select.Option>
              <Select.Option value="MM/DD/YYYY">MM/DD/YYYY</Select.Option>
              <Select.Option value="YYYY/MM/DD">YYYY/MM/DD</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  </Card>
  );
};

export default SystemSettings;