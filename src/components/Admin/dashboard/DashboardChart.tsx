import React, { useEffect, useRef } from 'react';
import { Empty } from 'antd';
import Chart from 'chart.js/auto';

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
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: [
                '#4CAF50', // Green - Completed
                '#36A2EB', // Blue - In Progress
                '#FFCE56', // Yellow - Planning
                '#FF6384', // Red - At Risk
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                boxWidth: 12,
                padding: 15,
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.raw as number;
                  const total = (context.chart.data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                },
              },
            },
          },
        },
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
    <div style={{ height: '300px', position: 'relative' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default DashboardChart;