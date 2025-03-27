
import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';

interface TopicChartProps {
  data: { timestamp: string; popularity: number }[];
  className?: string;
  height?: number;
}

const TopicChart: React.FC<TopicChartProps> = ({ 
  data, 
  className = "",
  height = 80
}) => {
  // Format data for display
  const formattedData = data.map(item => ({
    date: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: item.popularity
  }));

  // Calculate min and max for domain
  const values = formattedData.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.1;

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ChartContainer
        config={{
          value: {
            color: '#3b82f6'
          }
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={false}
              height={0}
            />
            <YAxis 
              domain={[min - padding, max + padding]}
              axisLine={false}
              tickLine={false}
              tick={false}
              width={0}
            />
            <ChartTooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <ChartTooltipContent payload={payload} />
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              dot={false}
              stroke="#3b82f6" 
              strokeWidth={1.5}
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default TopicChart;
