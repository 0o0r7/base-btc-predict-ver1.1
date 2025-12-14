import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PricePoint } from '../types';
import { COLORS } from '../constants';

interface PriceChartProps {
  data: PricePoint[];
}

const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
  const currentPrice = data.length > 0 ? data[data.length - 1].price : 0;
  const prevPrice = data.length > 1 ? data[data.length - 2].price : currentPrice;
  const isUp = currentPrice >= prevPrice;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-gray-500 text-sm font-medium">Bitcoin (BTC)</h2>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isUp ? '▲' : '▼'} Live
            </span>
          </div>
        </div>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }} 
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={['auto', 'auto']} 
              orientation="right" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              width={60}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: COLORS.baseBlue, fontWeight: 'bold' }}
              labelStyle={{ color: '#64748b', fontSize: '12px' }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke={COLORS.baseBlue} 
              strokeWidth={2} 
              dot={false} 
              activeDot={{ r: 4, fill: COLORS.baseBlue }}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;
