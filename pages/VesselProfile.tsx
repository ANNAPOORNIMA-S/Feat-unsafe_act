import React, { useState, useMemo } from 'react';
import { SafetyObservation } from '../types';
import { getKPIs, getVesselList, getTopMappedIssues } from '../services/dataService';
import { KPICard } from '../components/KPICard';
import { CustomTreemap, CustomDonutChart } from '../components/Charts';

interface Props {
  data: SafetyObservation[];
}

export const VesselProfile: React.FC<Props> = ({ data }) => {
  const [selectedVessel, setSelectedVessel] = useState<string>('All');
  
  const vessels = useMemo(() => getVesselList(data), [data]);

  const filteredData = useMemo(() => {
    return selectedVessel === 'All'
      ? data
      : data.filter(d => d.vessel === selectedVessel);
  }, [data, selectedVessel]);

  const kpis = useMemo(() => getKPIs(filteredData), [filteredData]);
  const topIssues = useMemo(() => getTopMappedIssues(filteredData, 5), [filteredData]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-maire-blue">Vessel Safety Profile</h2>
        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
          <select 
            className="p-2 bg-transparent outline-none text-slate-700 font-medium"
            value={selectedVessel}
            onChange={(e) => setSelectedVessel(e.target.value)}
          >
            <option value="All">Select Vessel (All)</option>
            {vessels.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KPICard title="Total Observations" value={kpis.totalObservations} />
        <KPICard title="Percent Corrected" value={`${kpis.percentCorrected}%`} color="blue" />
        <KPICard title="High Risk Count" value={kpis.highRiskCount} color="red" />
        <KPICard title="Medium Risk Count" value={kpis.mediumRiskCount} color="orange" />
        <KPICard title="Low Risk Count" value={kpis.lowRiskCount} color="green" />
      </div>

      {/* Top 5 Issues Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-maire-blue mb-4">Issue Count by Mapped Issue (Treemap)</h3>
          <CustomTreemap data={topIssues} height={300} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-maire-blue mb-4">Issue Count by Mapped Issue (Donut)</h3>
          <CustomDonutChart data={topIssues} height={300} />
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-maire-blue mb-4">Top 5 Mapped Issues (Detail)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mapped Issue</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Count</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topIssues.map((issue, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{issue.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{issue.value}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Total (Top 5)</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {topIssues.reduce((sum, i) => sum + i.value, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};