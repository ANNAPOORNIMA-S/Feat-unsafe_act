
import React, { useState, useMemo } from 'react';
import { SafetyObservation, RiskLevel, PredictionRequest, PredictionResponse } from '../types';
import { getVesselList } from '../services/dataService';
import { predictIncident } from '../services/mlService';

interface Props {
  data: SafetyObservation[];
  onBack: () => void;
}

export const FuturePrediction: React.FC<Props> = ({ data, onBack }) => {
  const vessels = useMemo(() => getVesselList(data), [data]);
  
  // Form State
  const [selectedVessel, setSelectedVessel] = useState<string>(vessels[0] || '');
  const [selectedRisk, setSelectedRisk] = useState<string>(RiskLevel.High);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    const request: PredictionRequest = {
      vessel: selectedVessel,
      riskLevel: selectedRisk,
      targetDate: selectedDate
    };

    try {
      const response = await predictIncident(request, data);
      setResult(response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
           <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
           <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Future Incident Prediction</h2>
           <p className="text-slate-500 text-sm">Powered by Machine Learning Model (.pkl)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h3 className="text-lg font-bold text-maire-blue mb-6 border-b pb-2">Model Inputs</h3>
          <form onSubmit={handlePredict} className="space-y-5">
            
            {/* Vessel Input */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Target Vessel</label>
              <div className="relative">
                <select 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-maire-light focus:border-transparent outline-none appearance-none"
                  value={selectedVessel}
                  onChange={(e) => setSelectedVessel(e.target.value)}
                >
                  {vessels.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* Risk Input */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Risk Sensitivity</label>
              <div className="flex gap-2">
                 {[RiskLevel.High, RiskLevel.Medium, RiskLevel.Low].map(risk => (
                   <button
                     key={risk}
                     type="button"
                     onClick={() => setSelectedRisk(risk)}
                     className={`flex-1 py-2 text-xs font-bold rounded-md border transition-all ${
                       selectedRisk === risk 
                       ? risk === RiskLevel.High ? 'bg-red-500 text-white border-red-500' : risk === RiskLevel.Medium ? 'bg-orange-400 text-white border-orange-400' : 'bg-green-500 text-white border-green-500'
                       : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                     }`}
                   >
                     {risk.split(' ')[0]}
                   </button>
                 ))}
              </div>
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Prediction Horizon</label>
              <input 
                type="date" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-maire-light outline-none"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <p className="text-[10px] text-gray-400 mt-1">Select a date within the next 7 days for best accuracy.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 mt-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-maire-blue to-blue-600 hover:shadow-blue-500/30'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing Model...
                </span>
              ) : (
                "Predict Future Incidents"
              )}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
           {!result && !isLoading && (
             <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 min-h-[400px]">
               <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
               <p>Select parameters and run prediction to see AI insights.</p>
             </div>
           )}

           {result && (
             <div className="animate-fade-in-up space-y-6">
                
                {/* Top Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
                      <p className="text-xs text-gray-400 uppercase font-bold">Predicted Count</p>
                      <p className="text-3xl font-extrabold text-slate-800 mt-1">{result.predictedCount}</p>
                      <p className="text-[10px] text-gray-400">Next 7 Days</p>
                   </div>
                   <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
                      <p className="text-xs text-gray-400 uppercase font-bold">Issue Type</p>
                      <p className="text-lg font-bold text-slate-800 mt-2 truncate" title={result.predictedIssueType}>{result.predictedIssueType}</p>
                   </div>
                   <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500">
                      <p className="text-xs text-gray-400 uppercase font-bold">Category</p>
                      <p className="text-lg font-bold text-slate-800 mt-2 truncate" title={result.predictedCategory}>{result.predictedCategory}</p>
                   </div>
                   <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
                      <p className="text-xs text-gray-400 uppercase font-bold">Confidence</p>
                      <p className="text-3xl font-extrabold text-slate-800 mt-1">{result.confidenceScore}%</p>
                   </div>
                </div>

                {/* Main Insight Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   
                   {/* Related Factors */}
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-maire-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Likely Contributing Factors
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                           <span className="text-sm text-gray-600">Primary Factor</span>
                           <span className="font-bold text-maire-blue">{result.relatedTo1}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                           <span className="text-sm text-gray-600">Secondary Factor</span>
                           <span className="font-bold text-slate-600">{result.relatedTo2}</span>
                        </div>
                      </div>
                   </div>

                   {/* Suggestions */}
                   <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-lg text-white">
                      <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        Recommended Actions
                      </h4>
                      <ul className="space-y-3">
                        {result.suggestions.map((s, i) => (
                          <li key={i} className="flex gap-3 text-sm text-gray-300">
                             <span className="text-yellow-500 mt-1">➤</span>
                             <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                   </div>

                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
