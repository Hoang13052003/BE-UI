import React, { useEffect, useRef } from 'react';
import { Empty } from 'antd';
import Chart from 'chart.js/auto';

interface TimeLogChartProps {
  data: number[];
  labels: string[];
}

const TimeLogChart: React.FC<TimeLogChartProps> = ({ data, labels }) => {
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
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Hours Logged',
              data: data,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Hours',
              }
            },
            x: {
              title: {
                display: true,
                text: 'Date',
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw as number;
                  return `Hours: ${value.toFixed(1)}`;
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
    return <Empty description="No time log data available" />;
  }

  return (
    <div style={{ height: '300px', position: 'relative' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default TimeLogChart;