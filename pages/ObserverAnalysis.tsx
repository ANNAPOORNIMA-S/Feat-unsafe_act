import React, { useState, useMemo, useEffect } from 'react';
import { SafetyObservation, RiskLevel } from '../types';
import { getVesselList, getAreaOfWorkStats, getTopRelatedObservations, getDateList } from '../services/dataService';
import { CustomHorizontalBarChart, CustomBarChart } from '../components/Charts';

interface Props {
  data: SafetyObservation[];
}

export const ObserverAnalysis: React.FC<Props> = ({ data }) => {
  // Filters State
  const [filterDate, setFilterDate] = useState('All');
  const [filterVessel, setFilterVessel] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');
  const [filterOutcome, setFilterOutcome] = useState('All');

  // --- Cascading Logic (Waterfall) ---

  // 1. Available Dates (Always derived from full data)
  const availableDates = useMemo(() => getDateList(data), [data]);

  // Data after Date Filter
  const dateFilteredData = useMemo(() => {
      if (filterDate === 'All') return data;
      return data.filter(d => d.dateReported === filterDate);
  }, [data, filterDate]);

  // 2. Available Vessels (Derived from Date-Filtered Data)
  const availableVessels = useMemo(() => getVesselList(dateFilteredData), [dateFilteredData]);

  // Data after Vessel Filter
  const vesselFilteredData = useMemo(() => {
      if (filterVessel === 'All') return dateFilteredData;
      return dateFilteredData.filter(d => d.vessel === filterVessel);
  }, [dateFilteredData, filterVessel]);

  // 3. Available Risks (Derived from Vessel-Filtered Data)
  const availableRisks = useMemo(() => {
      const unique = Array.from(new Set(vesselFilteredData.map(d => d.category).filter(Boolean)));
      return [RiskLevel.High, RiskLevel.Medium, RiskLevel.Low].filter(r => unique.includes(r));
  }, [vesselFilteredData]);

  // Data after Risk Filter
  const riskFilteredData = useMemo(() => {
      if (filterRisk === 'All') return vesselFilteredData;
      return vesselFilteredData.filter(d => d.category === filterRisk);
  }, [vesselFilteredData, filterRisk]);

  // 4. Available Outcomes (Derived from Risk-Filtered Data)
  const availableOutcomes = useMemo(() => {
      return Array.from(new Set(riskFilteredData.map(d => d.outcome).filter(Boolean))).sort();
  }, [riskFilteredData]);

  // Final Data (Outcome Filtered)
  const finalFilteredData = useMemo(() => {
      if (filterOutcome === 'All') return riskFilteredData;
      return riskFilteredData.filter(d => d.outcome === filterOutcome);
  }, [riskFilteredData, filterOutcome]);


  // --- Reset Logic (If parent filter changes, reset invalid children) ---
  useEffect(() => {
      // If the selected vessel is no longer in the available list (due to date change), reset it
      if (filterVessel !== 'All' && !availableVessels.includes(filterVessel)) {
          setFilterVessel('All');
      }
  }, [availableVessels, filterVessel]);

  useEffect(() => {
      if (filterRisk !== 'All' && !availableRisks.includes(filterRisk as any)) {
          setFilterRisk('All');
      }
  }, [availableRisks, filterRisk]);

  useEffect(() => {
      if (filterOutcome !== 'All' && !availableOutcomes.includes(filterOutcome)) {
          setFilterOutcome('All');
      }
  }, [availableOutcomes, filterOutcome]);


  // --- Aggregations for Charts ---
  // Top 10 Related Observations
  const relatedObservations = useMemo(() => getTopRelatedObservations(finalFilteredData, 10), [finalFilteredData]);
  
  // Area of Work Stats (Top 7)
  const workAreaStats = useMemo(() => getAreaOfWorkStats(finalFilteredData), [finalFilteredData]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-maire-blue">Observer Issue Profile & Work Area Trends</h2>
      </div>

      {/* Filters Row - Reordered: Date -> Vessel -> Risk -> Outcome */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        
        {/* 1. Date Reported */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Date Reported</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-maire-light focus:outline-none bg-white"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          >
            <option value="All">All Dates</option>
            {availableDates.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>

        {/* 2. Vessel */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Vessel</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-maire-light focus:outline-none bg-white"
            value={filterVessel}
            onChange={(e) => setFilterVessel(e.target.value)}
          >
            <option value="All">All Vessels</option>
            {availableVessels.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        {/* 3. Risk Level */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Risk Level</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-maire-light focus:outline-none bg-white"
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
          >
            <option value="All">All Risks</option>
            {availableRisks.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* 4. Outcome */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Outcome</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-maire-light focus:outline-none bg-white"
            value={filterOutcome}
            onChange={(e) => setFilterOutcome(e.target.value)}
          >
            <option value="All">All Outcomes</option>
            {availableOutcomes.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

      </div>

      {/* Visuals */}
      <div className="space-y-6">
        
        {/* Chart 1: Observation Related */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-maire-blue mb-4">Issue Count by Observation Related (Top 10)</h3>
          {/* Horizontal Bar Chart with values */}
          <CustomHorizontalBarChart data={relatedObservations} height={400} />
        </div>

        {/* Chart 2: Area of Work */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-maire-blue mb-4">Area of Work Distribution (Top 7)</h3>
          <div className="w-full space-y-8">
             {/* Bar Chart */}
             <CustomBarChart data={workAreaStats} height={350} />

             {/* Summary Table */}
             <div className="overflow-x-auto border-t border-gray-200 pt-6">
               <h4 className="text-md font-semibold text-slate-700 mb-3">Area of Observation by Total Observation Count</h4>
               <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Area of Observation</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total Observation Count</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {workAreaStats.length > 0 ? (
                      workAreaStats.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                          <td className="px-6 py-3 text-sm font-medium text-gray-700">{item.name}</td>
                          <td className="px-6 py-3 text-sm text-gray-900 text-right font-semibold">{item.value}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">No data available for current selection</td>
                      </tr>
                    )}
                    {workAreaStats.length > 0 && (
                      <tr className="bg-blue-50 border-t-2 border-blue-100">
                        <td className="px-6 py-3 text-sm font-bold text-maire-blue">Total (Top 7)</td>
                        <td className="px-6 py-3 text-sm font-bold text-maire-blue text-right">
                           {workAreaStats.reduce((sum, item) => sum + item.value, 0)}
                        </td>
                      </tr>
                    )}
                  </tbody>
               </table>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};