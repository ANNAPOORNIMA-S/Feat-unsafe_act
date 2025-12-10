import React, { useState, useMemo } from 'react';
import { SafetyObservation, RiskLevel } from '../types';
import { getVesselList, getAreaOfWorkStats, getTopMappedIssues, getDateList } from '../services/dataService';
import { CustomHorizontalBarChart, CustomBarChart } from '../components/Charts';

interface Props {
  data: SafetyObservation[];
}

export const ObserverAnalysis: React.FC<Props> = ({ data }) => {
  const [filterVessel, setFilterVessel] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');
  const [filterOutcome, setFilterOutcome] = useState('All');
  const [filterDate, setFilterDate] = useState('All');

  const vessels = useMemo(() => getVesselList(data), [data]);
  const outcomes = useMemo(() => Array.from(new Set(data.map(d => d.outcome))), [data]);
  const availableDates = useMemo(() => getDateList(data), [data]);

  const filteredData = useMemo(() => {
    return data.filter(d => {
      const vMatch = filterVessel === 'All' || d.vessel === filterVessel;
      const rMatch = filterRisk === 'All' || d.category === filterRisk;
      const oMatch = filterOutcome === 'All' || d.outcome === filterOutcome;
      const dMatch = filterDate === 'All' || d.dateReported === filterDate;
      return vMatch && rMatch && oMatch && dMatch;
    });
  }, [data, filterVessel, filterRisk, filterOutcome, filterDate]);

  // Top 10 for Horizontal Bar
  const mappedIssues = useMemo(() => getTopMappedIssues(filteredData, 10), [filteredData]);
  const workAreaStats = useMemo(() => getAreaOfWorkStats(filteredData), [filteredData]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-maire-blue">Observer Issue Profile & Work Area Trends</h2>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Vessel</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-maire-light focus:outline-none"
            value={filterVessel}
            onChange={(e) => setFilterVessel(e.target.value)}
          >
            <option value="All">All</option>
            {vessels.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Risk Level</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-maire-light focus:outline-none"
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
          >
            <option value="All">All</option>
            <option value={RiskLevel.High}>{RiskLevel.High}</option>
            <option value={RiskLevel.Medium}>{RiskLevel.Medium}</option>
            <option value={RiskLevel.Low}>{RiskLevel.Low}</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Outcome</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-maire-light focus:outline-none"
            value={filterOutcome}
            onChange={(e) => setFilterOutcome(e.target.value)}
          >
            <option value="All">All</option>
            {outcomes.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Date Reported</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-maire-light focus:outline-none"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          >
             <option value="All">All Dates</option>
             {availableDates.map(date => (
               <option key={date} value={date}>{date}</option>
             ))}
          </select>
        </div>
      </div>

      {/* Visuals */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-maire-blue mb-4">Issue Count by Mapped Issue (Top 10)</h3>
          {/* Horizontal Bar Chart */}
          <CustomHorizontalBarChart data={mappedIssues} height={400} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-maire-blue mb-4">Area of Work Distribution</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
               <CustomBarChart data={workAreaStats} height={400} />
            </div>
            <div className="lg:col-span-1 overflow-y-auto max-h-[400px]">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Area</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Count</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {workAreaStats.map((stat, idx) => (
                    <tr key={idx} className={idx < 3 ? "bg-blue-50" : "hover:bg-gray-50"}>
                      <td className="px-4 py-2 text-sm text-gray-700">{stat.name}</td>
                      <td className="px-4 py-2 text-sm font-semibold text-gray-900 text-right">{stat.value}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold border-t-2 border-gray-200">
                    <td className="px-4 py-3 text-sm text-gray-900">Total</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {workAreaStats.reduce((sum, item) => sum + item.value, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};