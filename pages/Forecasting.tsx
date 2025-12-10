import React, { useMemo } from 'react';
import { SafetyObservation } from '../types';
import { getWeeklyForecast, getVesselForecast } from '../services/forecastingService';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area } from 'recharts';

interface Props {
  data: SafetyObservation[];
}

export const Forecasting: React.FC<Props> = ({ data }) => {
  const weeklyForecast = useMemo(() => getWeeklyForecast(data, 4), [data]);
  const vesselRiskForecast = useMemo(() => getVesselForecast(data), [data]);

  // Merge historical and predicted for the composed chart
  const chartData = weeklyForecast.map(item => ({
    name: item.name,
    Historical: item.isPrediction ? null : item.value,
    Forecast: item.isPrediction ? item.secondaryValue : null,
    // Connect the last historical point to forecast visually if desired, 
    // but simpler to just show distinct lines or utilize connectNulls
    Combined: item.value || item.secondaryValue
  }));

  return (
    <div className="space-y-8 animate-fade-in pb-10">
       <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Predictive Analytics</h2>
        <p className="text-slate-500">
          Linear regression models projecting fleet safety trends for the next 30 days.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Forecast Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-blue-50/50">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-700">Weekly Incident Forecast</h3>
            <p className="text-xs text-gray-400">Projected incident volume based on historical weekly aggregation.</p>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#003A70" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#003A70" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ color: '#003A70', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" />
                
                {/* Historical Area */}
                <Area type="monotone" dataKey="Historical" stroke="#003A70" fillOpacity={1} fill="url(#colorHist)" strokeWidth={3} name="Historical Data" />
                
                {/* Forecast Line (Dashed) */}
                <Line type="monotone" dataKey="Forecast" stroke="#E74C3C" strokeWidth={3} strokeDasharray="5 5" dot={{r:5, fill:'#E74C3C'}} name="AI Prediction" connectNulls />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Stats */}
        <div className="space-y-8">
           <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-blue-50/50">
              <h3 className="text-lg font-bold text-slate-700 mb-4">Predicted High Risk Vessels</h3>
              <p className="text-xs text-gray-400 mb-4">Vessels projected to have highest activity next week.</p>
              
              <div className="space-y-4">
                {vesselRiskForecast.map((v, i) => (
                  <div key={v.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-sm w-6 h-6 flex items-center justify-center rounded-full ${i===0 ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}`}>
                        {i+1}
                      </span>
                      <span className="text-sm font-semibold text-slate-700">{v.name}</span>
                    </div>
                    <div className="text-sm font-bold text-maire-blue">
                      ~{v.value} <span className="text-[10px] font-normal text-gray-400">est.</span>
                    </div>
                  </div>
                ))}
              </div>
           </div>

           <div className="bg-blue-900 p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="font-bold text-lg mb-2">AI Insight</h3>
               <p className="text-sm text-blue-100 leading-relaxed">
                 Current trends indicate a <span className="font-bold text-white">stabilization</span> in unsafe acts. 
                 However, <span className="font-bold text-yellow-300">MAG Victory</span> shows a projected increase in reports next week based on recent activity.
               </p>
             </div>
             {/* Decor */}
             <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-blue-500 rounded-full blur-[40px] opacity-30"></div>
           </div>
        </div>
      </div>
    </div>
  );
};
