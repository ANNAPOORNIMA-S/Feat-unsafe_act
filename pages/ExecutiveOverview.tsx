import React, { useState, useMemo } from 'react';
import { SafetyObservation } from '../types';
import { getKPIs, getVesselData, getTrendData, getRiskDistribution, getObservationsByType, filterObservations, getDateList } from '../services/dataService';
import { KPICard } from '../components/KPICard';
import { CustomVerticalBarChart, CustomLineChart, CustomDonutChart, CustomBarChart } from '../components/Charts';

interface Props {
  data: SafetyObservation[];
}

export const ExecutiveOverview: React.FC<Props> = ({ data }) => {
  const [dateRange, setDateRange] = useState('All');

  const availableDates = useMemo(() => getDateList(data), [data]);

  const filteredData = useMemo(() => {
    return filterObservations(data, { dateRange });
  }, [data, dateRange]);

  // Calculate Aggregations
  const kpis = useMemo(() => getKPIs(filteredData), [filteredData]);
  const vesselData = useMemo(() => getVesselData(filteredData), [filteredData]);
  const trendData = useMemo(() => getTrendData(filteredData), [filteredData]);
  const riskData = useMemo(() => getRiskDistribution(filteredData), [filteredData]);
  const typeData = useMemo(() => getObservationsByType(filteredData), [filteredData]);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Executive Overview</h2>
          <p className="text-sm text-slate-500 mt-1">Fleet Safety Dashboard & Key Performance Indicators</p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-gray-200">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Report Date:</span>
          <select 
            className="bg-transparent outline-none text-slate-700 font-semibold text-sm cursor-pointer"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="All">All Time</option>
            {availableDates.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <KPICard title="Total Observations" value={kpis.totalObservations} />
        <KPICard title="% Corrected" value={`${kpis.percentCorrected}%`} color="blue" />
        <KPICard title="Interventions" value={kpis.interventionCount} color="default" />
        <KPICard title="High Risk" value={kpis.highRiskCount} color="red" />
        <KPICard title="Medium Risk" value={kpis.mediumRiskCount} color="orange" />
        <KPICard title="Low Risk" value={kpis.lowRiskCount} color="green" />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-blue-50/50 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-700">Total Observations by Vessel</h3>
            <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded">Fleet Wide</span>
          </div>
          <CustomVerticalBarChart data={vesselData} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-blue-50/50 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-700">Trend Over Time (Daily)</h3>
            <span className="text-xs font-medium bg-green-50 text-green-600 px-2 py-1 rounded">Activity</span>
          </div>
          <CustomLineChart data={trendData} />
        </div>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-blue-50/50 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-bold text-slate-700 mb-6">Risk Category Distribution</h3>
          <CustomDonutChart data={riskData} />
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-blue-50/50 hover:shadow-lg transition-shadow lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-700 mb-6">Observation Types</h3>
          <CustomBarChart data={typeData} />
        </div>
      </div>
    </div>
  );
};