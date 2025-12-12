
import React, { useMemo } from 'react';
import { SafetyObservation } from '../types';
import { getWeeklyForecast, getVesselForecast } from '../services/forecastingService';
import { ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface Props {
  data: SafetyObservation[];
  onNavigateToPredict: () => void; // Added prop for navigation
}

export const Forecasting: React.FC<Props> = ({ data, onNavigateToPredict }) => {
  const weeklyForecast = useMemo(() => getWeeklyForecast(data, 4), [data]);
  const vesselRiskForecast = useMemo(() => getVesselForecast(data), [data]);

  // Merge historical and predicted for the composed chart
  const chartData = weeklyForecast.map(item => ({
    name: item.name,
    Historical: item.isPrediction ? null : item.value,
    Forecast: item.isPrediction ? item.secondaryValue : null,
  }));

  // Determine trend direction for dynamic insight
  const lastHistorical = weeklyForecast.filter(x => !x.isPrediction).pop()?.value || 0;
  const firstForecast = weeklyForecast.find(x => x.isPrediction)?.secondaryValue || 0;
  
  let trendDirection = 'Stabilizing';
  if (firstForecast > lastHistorical) trendDirection = 'Increasing';
  if (firstForecast < lastHistorical) trendDirection = 'Decreasing';

  const topRiskVesselName = vesselRiskForecast.length > 0 ? vesselRiskForecast[0].name : "None";

  return (
    <div className="space-y-8 animate-fade-in pb-10">
       <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Predictive Analytics</h2>
        <p className="text-slate-500">
          Forecasting models utilizing Linear Regression (Least Squares) to project future incident volumes based on your specific historical timeline.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Forecast Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-blue-50/50">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-700">Fleet-Wide Weekly Trend & Forecast</h3>
            <p className="text-xs text-gray-400 mt-1">
              Data is aggregated into 7-day cycles (Weekly Sums) starting from the first recorded date in your uploaded file.
            </p>
          </div>
          
          <div className="h-[350px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
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
                <Area type="monotone" dataKey="Historical" stroke="#003A70" fillOpacity={1} fill="url(#colorHist)" strokeWidth={3} name="Actual Incidents (Weekly Total)" />
                
                {/* Forecast Line (Dashed) */}
                <Line type="monotone" dataKey="Forecast" stroke="#E74C3C" strokeWidth={3} strokeDasharray="5 5" dot={{r:5, fill:'#E74C3C'}} name="AI Prediction" connectNulls />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Plot Explanation */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm space-y-3">
            <h4 className="font-bold text-slate-700 border-b border-slate-200 pb-2">How to read this plot:</h4>
            <ul className="space-y-2 text-slate-600">
              <li className="flex gap-2">
                 <span className="font-semibold text-slate-800 min-w-[80px]">X-Axis:</span>
                 <span>Shows the <strong>7-Day Range</strong> (e.g., 01/11 - 07/11). The first date corresponds exactly to your first record.</span>
              </li>
              <li className="flex gap-2">
                 <span className="font-semibold text-maire-blue min-w-[80px]">Blue Area:</span>
                 <span>Represents the <strong>Total Sum</strong> of incidents reported during that entire week (not just one day).</span>
              </li>
              <li className="flex gap-2">
                 <span className="font-semibold text-risk-high min-w-[80px]">Red Line:</span>
                 <span>The <strong>Prediction</strong>. It uses Linear Regression to draw a "best fit" line through your weekly totals and extends it 4 weeks into the future.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Side Stats */}
        <div className="space-y-8">
           {/* Risk List */}
           <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-blue-50/50">
              <h3 className="text-lg font-bold text-slate-700 mb-2">Predicted High Risk Vessels</h3>
              <p className="text-xs text-gray-400 mb-4 border-b pb-4">
                These vessels show the steepest <strong>upward trend</strong> in incident reports. The value is the forecasted count for next week.
              </p>
              
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
                      ~{v.value} <span className="text-[10px] font-normal text-gray-400">next week</span>
                    </div>
                  </div>
                ))}
              </div>
           </div>

           {/* AI Insight */}
           <div className="bg-blue-900 p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="font-bold text-lg mb-2">AI Trend Summary</h3>
               <p className="text-sm text-blue-100 leading-relaxed">
                 Based on the statistical slope of your data, the fleet-wide incident trend is: <span className="font-bold text-white uppercase">{trendDirection}</span>. 
                 <br/><br/>
                 <strong>Recommendation:</strong> Focus supervision on <span className="font-bold text-yellow-300">{topRiskVesselName}</span> as it has the highest projected increase.
               </p>
             </div>
             {/* Decor */}
             <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-blue-500 rounded-full blur-[40px] opacity-30"></div>
           </div>
        </div>
      </div>

      {/* Advanced Prediction CTA */}
      <div className="bg-gradient-to-r from-slate-100 to-white p-8 rounded-2xl border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">Advanced ML Future Prediction</h3>
          <p className="text-slate-500 mt-2 max-w-xl">
             Utilize our trained Machine Learning Model (.pkl) to predict specific issue types, categories, and generate actionable suggestions for a specific vessel and risk profile over the next 7 days.
          </p>
        </div>
        <button 
          onClick={onNavigateToPredict}
          className="px-8 py-4 bg-maire-blue text-white font-bold rounded-xl shadow-lg hover:bg-blue-800 transition-all transform hover:-translate-y-1 flex items-center gap-3 whitespace-nowrap"
        >
          <span>Predict Future</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </button>
      </div>

    </div>
  );
};
