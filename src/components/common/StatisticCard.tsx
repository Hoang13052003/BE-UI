import React from "react";
import { Card, Statistic } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

const StatisticCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconColor?: string;
  subInfo?: string;
  subInfoColor?: string;
  valueSuffix?: string;
  valuePrefix?: React.ReactNode;
  isImprovement?: boolean;
  changeDirection?: "up" | "down";
}> = ({
  title,
  value,
  icon,
  iconColor,
  subInfo,
  subInfoColor = "#888",
  valueSuffix,
  valuePrefix,
  isImprovement,
  changeDirection,
}) => {
  const isValueNumeric = typeof value === "number";

  return (
    <Card
      style={{
        position: "relative",
        boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.24)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          fontSize: 20,
          color: iconColor,
        }}
      >
        {icon}
      </div>
      <Statistic
        title={
          <span
            style={{ fontSize: "0.9em", color: "#888", fontWeight: "normal" }}
          >
            {title}
          </span>
        }
        valueRender={() => (
          <>
            <div
              style={{
                color: "#333",
                marginBottom: 4,
              }}
            >
              {valuePrefix}
              {isValueNumeric ? value.toLocaleString() : value}
              {valueSuffix}
            </div>
            {subInfo && (
              <span style={{ fontSize: "0.8em", color: subInfoColor }}>
                {changeDirection === "up" && <ArrowUpOutlined />}
                {changeDirection === "down" && <ArrowDownOutlined />}
                {isImprovement && <ArrowDownOutlined />}{" "}
                {!isImprovement &&
                  changeDirection === undefined &&
                  (subInfo.includes("+") ? (
                    <ArrowUpOutlined />
                  ) : subInfo.includes("-") && subInfo.includes("%") ? (
                    <ArrowDownOutlined />
                  ) : null)}{" "}
                {subInfo}
              </span>
            )}
          </>
        )}
      />
    </Card>
  );
};

export default StatisticCard;
