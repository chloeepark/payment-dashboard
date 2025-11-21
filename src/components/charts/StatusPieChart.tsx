import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { formatCurrency } from '@/utils/format';
import { getStatusText } from '@/utils/format';

interface StatusPieChartProps {
  data: Array<{
    status: string;
    count: number;
    amount: number;
  }>;
}

const COLORS = {
  SUCCESS: '#10b981',
  PENDING: '#f59e0b',
  FAILED: '#ef4444',
  CANCELLED: '#6b7280',
  REFUNDED: '#8b5cf6',
};

const StatusPieChart: React.FC<StatusPieChartProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    name: getStatusText(item.status),
    value: item.count,
    amount: item.amount,
    status: item.status,
  }));

  const renderLabel = (entry: any) => {
    return `${entry.name}: ${entry.value}건`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">거래 상태별 통계</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.status as keyof typeof COLORS] || '#999'} 
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string, props: any) => {
              return [
                `${value}건 (${formatCurrency(props.payload.amount)})`,
                name,
              ];
            }}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusPieChart;

