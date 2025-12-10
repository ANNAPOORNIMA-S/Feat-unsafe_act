import React, { useState, useMemo } from 'react';
import { SafetyObservation, RiskLevel } from '../types';
import { getTopMappedIssues, getRiskByVessel, filterObservations, getHeatmapData } from '../services/dataService';
import { KPICard } from '../components/KPICard';
import { CustomVerticalBarChart, CustomStackedBarChart } from '../components/Charts';

interface Props {
  data: SafetyObservation[];
}

export const RiskAnalysis: React.FC<Props> = ({ data }) => {
  const [selectedRisk, setSelectedRisk] = useState<string>('All');

  const filteredData = useMemo(() => {
    return filterObservations(data, { riskLevel: selectedRisk });
  }, [data, selectedRisk]);

  const topIssues = useMemo(() => getTopMappedIssues(filteredData), [filteredData]);
  const riskByVessel = useMemo(() => getRiskByVessel(filteredData), [filteredData]);
  const heatmapData = useMemo(() => getHeatmapData(filteredData), [filteredData]);
  
  const openObs = filteredData.filter(d => d.outcome !== 'Corrected').length;
  const closedObs = filteredData.length - openObs;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-maire-blue">Risk & Consequence Analysis</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KPICard title="Open Observations" value={openObs} color="red" />
        <KPICard title="Closed Observations" value={closedObs} color="green" />
        <KPICard title="High Risk" value={filteredData.filter(d => d.category === RiskLevel.High).length} color="red" />
        <KPICard title="Medium Risk" value={filteredData.filter(d => d.category === RiskLevel.Medium).length} color="orange" />
        <KPICard title="Low Risk" value={filteredData.filter(d => d.category === RiskLevel.Low).length} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Slicer */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit">
          <h3 className="text-lg font-semibold text-maire-blue mb-4">Risk Filter</h3>
          <div className="space-y-2">
            {['All', RiskLevel.High, RiskLevel.Medium, RiskLevel.Low].map((risk) => (
              <button
                key={risk}
                onClick={() => setSelectedRisk(risk)}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors border ${
                  selectedRisk === risk 
                    ? 'bg-maire-blue text-white border-maire-blue font-medium shadow-md' 
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {risk}
              </button>
            ))}
          </div>
          <div className="mt-6 text-xs text-gray-400">
            * Filters below visuals based on selected risk category.
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-maire-blue mb-4">Risk Distribution by Vessel</h3>
                <CustomStackedBarChart data={riskByVessel} />
             </div>
             
             <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-maire-blue mb-4">Top Issues (Filtered by Risk)</h3>
                <CustomVerticalBarChart data={topIssues} height={300} />
             </div>
          </div>

          {/* Real Data Risk Heatmap */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-maire-blue mb-4">Risk vs Consequence Heatmap Matrix</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-center border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 bg-gray-100 text-left border text-sm font-semibold text-gray-600 w-1/3">Potential Consequences</th>
                    <th className="p-3 bg-red-50 border text-red-800 text-sm font-bold">High Risk</th>
                    <th className="p-3 bg-orange-50 border text-orange-800 text-sm font-bold">Medium Risk</th>
                    <th className="p-3 bg-green-50 border text-green-800 text-sm font-bold">Low Risk</th>
                    <th className="p-3 bg-gray-50 border text-gray-800 text-sm font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 border text-left text-sm font-medium text-gray-700">{row.consequence}</td>
                      <td className={`p-3 border text-sm font-bold ${row['High Risk'] > 0 ? 'text-red-600 bg-red-100' : 'text-gray-300'}`}>
                        {row['High Risk']}
                      </td>
                      <td className={`p-3 border text-sm font-bold ${row['Medium Risk'] > 0 ? 'text-orange-600 bg-orange-100' : 'text-gray-300'}`}>
                        {row['Medium Risk']}
                      </td>
                      <td className={`p-3 border text-sm font-bold ${row['Low Risk'] > 0 ? 'text-green-600 bg-green-100' : 'text-gray-300'}`}>
                        {row['Low Risk']}
                      </td>
                      <td className="p-3 border text-sm font-bold text-gray-600">
                        {row['High Risk'] + row['Medium Risk'] + row['Low Risk']}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                    <td className="p-3 border text-left text-sm">Grand Total</td>
                    <td className="p-3 border text-sm text-red-800">
                      {heatmapData.reduce((acc, row) => acc + row['High Risk'], 0)}
                    </td>
                    <td className="p-3 border text-sm text-orange-800">
                      {heatmapData.reduce((acc, row) => acc + row['Medium Risk'], 0)}
                    </td>
                    <td className="p-3 border text-sm text-green-800">
                      {heatmapData.reduce((acc, row) => acc + row['Low Risk'], 0)}
                    </td>
                    <td className="p-3 border text-sm text-gray-800">
                       {filteredData.length}
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