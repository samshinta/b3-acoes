
import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { StockDataPoint } from '../types';

interface StockChartProps {
  data: StockDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload as StockDataPoint;
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-white font-bold text-lg">
          ${item.price.toFixed(2)}
        </p>
        <p className={`text-xs font-medium uppercase ${item.type === 'predicted' ? 'text-cyan-400' : 'text-emerald-400'}`}>
          {item.type}
        </p>
      </div>
    );
  }
  return null;
};

const StockChart: React.FC<StockChartProps> = ({ data }) => {
  const minPrice = Math.min(...data.map(d => d.price)) * 0.98;
  const maxPrice = Math.max(...data.map(d => d.price)) * 1.02;

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(str) => {
                const date = new Date(str);
                return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            }}
          />
          <YAxis 
            domain={[minPrice, maxPrice]} 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(val) => `$${val.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#22d3ee" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
          />
          {/* Transition Line */}
          {data.find(d => d.type === 'predicted') && (
            <ReferenceLine 
              x={data.find(d => d.type === 'predicted')?.date} 
              stroke="#fbbf24" 
              strokeDasharray="5 5" 
              label={{ position: 'top', value: 'Forecast Start', fill: '#fbbf24', fontSize: 10 }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
