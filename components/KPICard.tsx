import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtext?: string;
  color?: 'default' | 'red' | 'orange' | 'green' | 'blue';
}

const colorMap = {
  default: 'text-maire-blue',
  red: 'text-risk-high',
  orange: 'text-risk-medium',
  green: 'text-risk-low',
  blue: 'text-maire-light'
};

export const KPICard: React.FC<KPICardProps> = ({ title, value, subtext, color = 'default' }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 flex flex-col justify-between h-32 transition-transform hover:scale-[1.02]">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
      <div className={`text-3xl font-bold ${colorMap[color]}`}>
        {value}
      </div>
      {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
    </div>
  );
};