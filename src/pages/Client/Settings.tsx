import React from "react";
import { Card, Tabs } from "antd";

const Settings: React.FC = () => {
  return (
    <Card title="Settings" style={{ height: "100%" }}>
      <Tabs
        tabPosition="left"
        style={{ width: "100%", marginBottom: 24 }}
        defaultActiveKey="1"
        tabBarStyle={{ width: 200 }}
        tabBarGutter={0}
        items={Array.from({ length: 3 }).map((_, i) => {
          const id = String(i + 1);
          return {
            label: `Tab ${id}`,
            key: id,
            children: `Content of Tab ${id}`,
          };
        })}
      />
    </Card>
  );
};

export default Settings;
