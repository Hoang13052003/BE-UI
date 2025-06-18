import React, { useEffect, useRef } from "react";
import { Empty } from "antd";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";

interface DashboardChartProps {
  data: number[];
  labels: string[];
}

const DashboardChart: React.FC<DashboardChartProps> = ({ data, labels }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data.length || !labels.length) return;

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create the chart
    const ctx = chartRef.current.getContext("2d");
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: [
                "#A5D8FF", // Pastel Blue
                "#B2F2BB", // Pastel Green
                "#FFD6A5", // Pastel Yellow
                "#FFADAD", // Pastel Red
              ],
              borderWidth: 2,
              borderRadius: 16,
              hoverOffset: 16,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: 24 },
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                boxWidth: 18,
                boxHeight: 18,
                borderRadius: 8,
                padding: 18,
                font: { size: 15, weight: "bold" },
                color: "#333",
              },
            },
            datalabels: {
              color: "#222",
              font: { weight: "bold", size: 16 },
              formatter: (value: number, context: any) => {
                const total = context.chart.data.datasets[0].data.reduce(
                  (a: number, b: number) => a + b,
                  0
                );
                if (!total) return "";
                const percent = Math.round((value / total) * 100);
                return percent > 0 ? percent + "%" : "";
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || "";
                  const value = context.raw as number;
                  const total = (
                    context.chart.data.datasets[0].data as number[]
                  ).reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                },
              },
            },
          },
        },
        plugins: [ChartDataLabels],
      });
    }

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, labels]);

  if (!data.length || !labels.length) {
    return <Empty description="No data available" />;
  }

  return (
    <div
      style={{
        height: "320px",
        position: "relative",
        background: "#f8fafc",
        borderRadius: 18,
        boxShadow: "0 2px 12px #e3e8ee",
        padding: 16,
      }}
    >
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default DashboardChart;
