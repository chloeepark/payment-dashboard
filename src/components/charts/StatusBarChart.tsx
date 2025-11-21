import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { CheckCircle, XCircle, Ban, Clock } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { getStatusText } from '@/utils/format';

interface StatusBarChartProps {
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
  CANCELLED: '#64748b',
};

const GRADIENT_COLORS = {
  SUCCESS: ['#10b981', '#059669'],
  PENDING: ['#f59e0b', '#d97706'],
  FAILED: ['#ef4444', '#dc2626'],
  CANCELLED: ['#64748b', '#475569'],
};

const STATUS_ICONS = {
  SUCCESS: CheckCircle,
  PENDING: Clock,
  FAILED: XCircle,
  CANCELLED: Ban,
};

const StatusBarChart: React.FC<StatusBarChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  const chartData = data.map((item) => ({
    name: getStatusText(item.status),
    value: item.count,
    percent: total > 0 ? ((item.count / total) * 100).toFixed(1) : 0,
    amount: item.amount,
    status: item.status,
  })).sort((a, b) => b.value - a.value);

  const CustomYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const entry = chartData.find(d => d.name === payload.value);
    const Icon = entry ? STATUS_ICONS[entry.status as keyof typeof STATUS_ICONS] : null;
    const color = entry ? COLORS[entry.status as keyof typeof COLORS] : '#64748b';

    return (
      <g transform={`translate(${x},${y})`}>
        {Icon && (
          <foreignObject x={-60} y={-12} width={20} height={20}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={18} color={color} strokeWidth={2.5} />
            </div>
          </foreignObject>
        )}
        <text
          x={-35}
          y={0}
          dy={4}
          textAnchor="start"
          fill="#374151"
          fontSize={13}
          fontWeight={500}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  const CustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    return (
      <text
        x={x + width + 10}
        y={y + height / 2}
        fill="#6b7280"
        fontSize={13}
        fontWeight={600}
        textAnchor="start"
        dominantBaseline="middle"
      >
        {value}건
      </text>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 h-[400px] flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">거래 상태별 분포</h3>
        <p className="text-sm text-gray-500 mt-1">총 {total.toLocaleString()}건의 거래</p>
      </div>
      
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            layout="vertical"
            margin={{ top: 10, right: 120, left: 100, bottom: 10 }}
          >
            <defs>
              {Object.entries(GRADIENT_COLORS).map(([status, colors]) => (
                <linearGradient key={status} id={`gradient-${status}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={colors[0]} />
                  <stop offset="100%" stopColor={colors[1]} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis 
              type="number" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#d1d5db"
              axisLine={{ strokeWidth: 1 }}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={<CustomYAxisTick />}
              width={90}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              formatter={(value: number, name: string, props: any) => {
                return [
                  `${value}건 (${props.payload.percent}%)`,
                  '거래 건수',
                ];
              }}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '12px',
              }}
              labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
            />
            <Bar 
              dataKey="value" 
              radius={[0, 8, 8, 0]} 
              maxBarSize={50}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#gradient-${entry.status})`}
                  style={{ 
                    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
              <LabelList 
                content={<CustomLabel />}
                position="right"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatusBarChart;

