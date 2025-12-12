import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Treemap, LabelList
} from 'recharts';
import { ChartDataPoint } from '../types';

interface SimpleChartProps {
  data: any[];
  title?: string;
  height?: number;
  dataKey?: string;
  categoryKey?: string;
  color?: string; // Optional single color override
}

const COLORS = ['#003A70', '#2AA4F4', '#F39C12', '#E74C3C', '#2ECC71', '#9B59B6', '#34495E'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg text-sm z-50">
        <p className="font-bold text-maire-blue mb-1">{label || payload[0].payload.name}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color || entry.payload.fill }} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.payload.fill }}></span>
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const CustomBarChart: React.FC<SimpleChartProps> = ({ data, height = 300 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
      <Tooltip cursor={{ fill: '#F1F5F9' }} content={<CustomTooltip />} />
      <Bar dataKey="value" fill="#2AA4F4" radius={[4, 4, 0, 0]} barSize={40} />
    </BarChart>
  </ResponsiveContainer>
);

export const CustomVerticalBarChart: React.FC<SimpleChartProps> = ({ data, height = 300 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} interval={0} angle={-45} textAnchor="end" height={60} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
      <Tooltip cursor={{ fill: '#F1F5F9' }} content={<CustomTooltip />} />
      <Bar dataKey="value" fill="#2AA4F4" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export const CustomHorizontalBarChart: React.FC<SimpleChartProps> = ({ data, height = 300, color }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 50, left: 40, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#E2E8F0" />
      <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
      <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
      <Tooltip cursor={{ fill: '#F1F5F9' }} content={<CustomTooltip />} />
      <Bar dataKey="value" fill={color || "#003A70"} radius={[0, 4, 4, 0]} barSize={30}>
        {!color && data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
         <LabelList dataKey="value" position="right" style={{ fill: '#64748B', fontSize: 12, fontWeight: 'bold' }} />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

export const CustomStackedBarChart: React.FC<SimpleChartProps> = ({ data, height = 300 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} interval={0} angle={-45} textAnchor="end" height={60} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
      <Tooltip cursor={{ fill: '#F1F5F9' }} content={<CustomTooltip />} />
      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
      <Bar dataKey="High Risk" stackId="a" fill="#E74C3C" radius={[0, 0, 0, 0]} />
      <Bar dataKey="Medium Risk" stackId="a" fill="#F39C12" radius={[0, 0, 0, 0]} />
      <Bar dataKey="Low Risk" stackId="a" fill="#2ECC71" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export const CustomClusteredBarChart: React.FC<SimpleChartProps> = ({ data, height = 300 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} interval={0} angle={-45} textAnchor="end" height={60} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
      <Tooltip cursor={{ fill: '#F1F5F9' }} content={<CustomTooltip />} />
      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
      <Bar dataKey="Unsafe Act" fill="#2AA4F4" radius={[4, 4, 0, 0]} />
      <Bar dataKey="Unsafe Condition" fill="#F39C12" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export const CustomLineChart: React.FC<SimpleChartProps> = ({ data, height = 300 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
      <Tooltip content={<CustomTooltip />} />
      <Line 
        type="monotone" 
        dataKey="value" 
        stroke="#2AA4F4" 
        strokeWidth={3} 
        dot={{ r: 4, fill: '#2AA4F4', strokeWidth: 2, stroke: '#fff' }} 
        activeDot={{ r: 6 }}
        name="Observations" 
      />
    </LineChart>
  </ResponsiveContainer>
);

export const CustomDonutChart: React.FC<SimpleChartProps> = ({ data, height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={true}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Custom Treemap Content for better visibility
const CustomizedTreemapContent = (props: any) => {
  const { root, depth, x, y, width, height, index, name, value } = props;
  
  // Safety check for undefined name or small size
  const label = name || '';
  
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: COLORS[index % COLORS.length],
          stroke: '#fff',
          strokeWidth: 3,
          strokeOpacity: 1,
        }}
        className="transition-opacity hover:opacity-90 cursor-pointer"
      />
      {width > 60 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#fff"
          fontSize={14}
          fontWeight="bold"
          style={{ 
            pointerEvents: 'none',
            textShadow: '0px 1px 3px rgba(0,0,0,0.5)' 
          }}
        >
          {label.length > 15 ? label.substring(0, 15) + '...' : label}
        </text>
      )}
       {width > 60 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 20}
          textAnchor="middle"
          fill="rgba(255,255,255,0.95)"
          fontSize={12}
          fontWeight="500"
          style={{ 
            pointerEvents: 'none',
            textShadow: '0px 1px 2px rgba(0,0,0,0.5)'
          }}
        >
          {value} Issues
        </text>
      )}
    </g>
  );
};

export const CustomTreemap: React.FC<SimpleChartProps> = ({ data, height = 300 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <Treemap
      data={data}
      dataKey="value"
      stroke="#fff"
      fill="#8884d8"
      content={<CustomizedTreemapContent />}
    >
      <Tooltip content={<CustomTooltip />} />
    </Treemap>
  </ResponsiveContainer>
);