import React from "react";
import { Card, Typography, Space, Tag, Descriptions } from "antd";
import { LinkedinOutlined, GithubOutlined } from "@ant-design/icons";

const { Title, Text, Link } = Typography;

const Profile: React.FC = () => {
  const skills = [
    "Project Management",
    "Agile",
    "Team Leadership",
    "Risk Management",
    "Stakeholder Communication",
  ];

  const languages = [
    { name: "English", level: "Native" },
    { name: "Spanish", level: "Intermediate" },
  ];

  return (
    <Card title="Profile Setting" style={{ height: "100%" }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={5}>About</Title>
        <Text>
          Experienced project manager with expertise in software development and
          team leadership.
        </Text>
      </div>

      <div style={{ marginBottom: 32 }}>
        <Title level={5}>Contact Information</Title>
        <Descriptions column={2}>
          <Descriptions.Item label="Email">
            john.smith@example.com
          </Descriptions.Item>
          <Descriptions.Item label="Phone">+1 (555) 123-4567</Descriptions.Item>
          <Descriptions.Item label="Location">New York, USA</Descriptions.Item>
          <Descriptions.Item label="Timezone">UTC-5</Descriptions.Item>
        </Descriptions>
      </div>

      <div style={{ marginBottom: 32 }}>
        <Title level={5}>Skills</Title>
        <Space wrap>
          {skills.map((skill) => (
            <Tag key={skill} color="blue">
              {skill}
            </Tag>
          ))}
        </Space>
      </div>

      <div style={{ marginBottom: 32 }}>
        <Title level={5}>Languages</Title>
        <Descriptions column={1}>
          {languages.map((lang) => (
            <Descriptions.Item key={lang.name} label={lang.name}>
              <Text type="secondary">{lang.level}</Text>
            </Descriptions.Item>
          ))}
        </Descriptions>
      </div>

      <div>
        <Title level={5}>Social Links</Title>
        <Space direction="vertical">
          <Space>
            <LinkedinOutlined />
            <Link href="https://linkedin.com/in/johnsmith" target="_blank">
              linkedin.com/in/johnsmith
            </Link>
          </Space>
          <Space>
            <GithubOutlined />
            <Link href="https://github.com/johnsmith" target="_blank">
              github.com/johnsmith
            </Link>
          </Space>
        </Space>
      </div>
    </Card>
  );
};

export default Profile;
