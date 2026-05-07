
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface PriceChartProps {
  category: string;
  timeRange: string;
}

export default function PriceChart({ category, timeRange }: PriceChartProps) {
  const getChartData = (category: string, timeRange: string) => {
    // Mock data for different time ranges
    const baseData = {
      '7-days': [
        { date: '14/12', buyPrice: 79500, sellPrice: 82000, day: 'T2' },
        { date: '15/12', buyPrice: 80200, sellPrice: 82700, day: 'T3' },
        { date: '16/12', buyPrice: 79800, sellPrice: 82300, day: 'T4' },
        { date: '17/12', buyPrice: 80200, sellPrice: 82700, day: 'T5' },
        { date: '18/12', buyPrice: 79500, sellPrice: 82000, day: 'T6' },
        { date: '19/12', buyPrice: 80000, sellPrice: 82800, day: 'T7' },
        { date: '20/12', buyPrice: 82500, sellPrice: 85000, day: 'CN' }
      ],
      '30-days': [
        { date: '25/11', buyPrice: 75000, sellPrice: 77500, day: '' },
        { date: '30/11', buyPrice: 76500, sellPrice: 79000, day: '' },
        { date: '05/12', buyPrice: 78000, sellPrice: 80500, day: '' },
        { date: '10/12', buyPrice: 79200, sellPrice: 81700, day: '' },
        { date: '15/12', buyPrice: 80200, sellPrice: 82700, day: '' },
        { date: '20/12', buyPrice: 82500, sellPrice: 85000, day: '' }
      ],
      '90-days': [
        { date: 'T9', buyPrice: 68000, sellPrice: 70500, day: '' },
        { date: 'T10', buyPrice: 71500, sellPrice: 74000, day: '' },
        { date: 'T11', buyPrice: 75000, sellPrice: 77500, day: '' },
        { date: 'T12', buyPrice: 82500, sellPrice: 85000, day: '' }
      ]
    };
    
    return baseData[timeRange as keyof typeof baseData] || baseData['7-days'];
  };

  const data = getChartData(category, timeRange);

  const formatPrice = (value: number) => {
    return `${value.toLocaleString()}đ`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">
                  {entry.dataKey === 'buyPrice' ? 'Giá mua vào' : 'Giá bán ra'}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {formatPrice(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="buyPriceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="sellPriceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickFormatter={formatPrice}
          />
          <Tooltip content={<CustomTooltip />} />
          
          <Area
            type="monotone"
            dataKey="buyPrice"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#buyPriceGradient)"
          />
          <Area
            type="monotone"
            dataKey="sellPrice"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#sellPriceGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Chart Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Giá mua vào</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Giá bán ra</span>
        </div>
      </div>
    </div>
  );
}
