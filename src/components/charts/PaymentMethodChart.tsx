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

interface PaymentMethodChartProps {
  data: Array<{
    payType: string;
    count: number;
    amount: number;
  }>;
}

const COLORS = {
  ONLINE: '#2563eb',
  DEVICE: '#3b82f6',
  MOBILE: '#60a5fa',
  VACT: '#f59e0b',
  BILLING: '#fbbf24',
};

const PaymentMethodChart: React.FC<PaymentMethodChartProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    name: getStatusText(item.payType),
    value: item.count,
    amount: item.amount,
    payType: item.payType,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const renderLabel = (entry: any) => {
    const percent = ((entry.value / total) * 100).toFixed(0);
    return `${percent}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 h-[400px] flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">결제 수단별 비율</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
            label={renderLabel}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.payType as keyof typeof COLORS] || '#999'} 
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
    </div>
  );
};

export default PaymentMethodChart;

