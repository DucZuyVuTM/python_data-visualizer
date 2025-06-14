import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { BarChart3, LineChart, PieChart, TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ChartData {
  x: [];
  y: number[];
  type: string;
  title: string;
  xlabel: string;
  ylabel: string;
}

interface ChartVisualizationProps {
  chartData: ChartData | null;
}

const ChartVisualization: React.FC<ChartVisualizationProps> = ({ chartData }) => {
  const chartRef = useRef(null);

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'line':
        return <LineChart className="w-5 h-5 text-blue-500" />;
      case 'pie':
        return <PieChart className="w-5 h-5 text-green-500" />;
      case 'scatter':
        return <TrendingUp className="w-5 h-5 text-purple-500" />;
      default:
        return <BarChart3 className="w-5 h-5 text-orange-500" />;
    }
  };

  const generateColors = (count: number) => {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
    ];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };

  const prepareChartData = (data: ChartData) => {
    const colors = generateColors(data.y.length);
    
    // For scatter plots, we need to format data as {x, y} objects
    if (data.type === 'scatter') {
      const scatterData = data.x.map((xVal, index) => ({
        x: xVal,
        y: data.y[index]
      }));

      return {
        datasets: [{
          label: data.ylabel || 'Data',
          data: scatterData,
          backgroundColor: colors[0] + '80',
          borderColor: colors[0],
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        }]
      };
    }

    // For other chart types, use the standard format
    const config = {
      labels: data.x,
      datasets: [{
        label: data.ylabel || 'Data',
        data: data.y,
        backgroundColor: data.type === 'pie' ? colors : colors[0] + '80',
        borderColor: data.type === 'pie' ? colors : colors[0],
        borderWidth: 2,
        tension: data.type === 'line' ? 0.4 : 0,
        fill: data.type === 'line' ? false : true,
      }]
    };

    return config;
  };

  const getChartOptions = (data: ChartData) => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            boxWidth: 12,
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        title: {
          display: true,
          text: data.title,
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: 20
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          callbacks: data.type === 'scatter' ? {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label: function(context: any) {
              return `${data.xlabel}: ${context.parsed.x}, ${data.ylabel}: ${context.parsed.y}`;
            }
          } : {}
        }
      },
      scales: data.type !== 'pie' ? {
        x: {
          type: data.type === 'scatter' ? 'linear' : 'category',
          title: {
            display: true,
            text: data.xlabel,
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        y: {
          title: {
            display: true,
            text: data.ylabel,
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      } : {},
      elements: {
        point: {
          radius: data.type === 'line' ? 3 : data.type === 'scatter' ? 4 : 0,
          hoverRadius: data.type === 'line' ? 6 : data.type === 'scatter' ? 8 : 0,
        }
      }
    };

    return baseOptions;
  };

  // Map chart types to Chart.js types
  const getChartType = (type: string) => {
    switch (type) {
      case 'scatter':
        return 'scatter';
      case 'line':
        return 'line';
      case 'pie':
        return 'pie';
      case 'bar':
      default:
        return 'bar';
    }
  };

  if (!chartData || chartData.x.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800">Data Visualization</h3>
        </div>
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No visualization data</p>
            <p className="text-sm">Use the visualize() function in your Python code to create charts</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getChartIcon(chartData.type)}
          <h3 className="text-lg font-semibold text-gray-800">Data Visualization</h3>
        </div>
        <div className="text-sm text-gray-600">
          {chartData.y.length} data points • {chartData.type} chart
        </div>
      </div>
      
      <div className="p-4">
        <div className="h-96">
          <Chart
            ref={chartRef}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            type={getChartType(chartData.type) as any}
            data={prepareChartData(chartData)}
            options={getChartOptions(chartData)}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartVisualization;