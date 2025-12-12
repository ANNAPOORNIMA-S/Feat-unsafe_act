import React, { useState } from 'react';
import { SafetyObservation } from './types';
import { ExecutiveOverview } from './pages/ExecutiveOverview';
import { RiskAnalysis } from './pages/RiskAnalysis';
import { VesselProfile } from './pages/VesselProfile';
import { ObserverAnalysis } from './pages/ObserverAnalysis';
import { Forecasting } from './pages/Forecasting';
import { Welcome } from './pages/Welcome';
import DataUpload from './components/DataUpload';
import { ChatWindow } from './components/ChatWindow';

// SVGs for Icons
const DashboardIcon = () => (
  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
);
const RiskIcon = () => (
  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
);
const ShipIcon = () => (
  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
);
const ChartIcon = () => (
  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
);
const TrendIcon = () => (
  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
);
const ChatIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
);

type AppView = 'welcome' | 'upload' | 'dashboard';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('welcome');
  const [activeTab, setActiveTab] = useState<'overview' | 'risk' | 'vessel' | 'observer' | 'forecasting'>('overview');
  const [data, setData] = useState<SafetyObservation[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Flow Handlers
  const handleWelcomeEnter = () => {
    setCurrentView('upload');
  };

  const handleDataLoaded = (uploadedData: SafetyObservation[]) => {
    setData(uploadedData);
    setCurrentView('dashboard');
  };

  // --- Views ---

  if (currentView === 'welcome') {
    return <Welcome onEnter={handleWelcomeEnter} />;
  }

  if (currentView === 'upload') {
    return <DataUpload onDataLoaded={handleDataLoaded} />;
  }

  // Dashboard View
  return (
    <div className="flex min-h-screen bg-bg-slate text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-maire-blue text-white fixed h-full shadow-lg z-10 flex flex-col transition-all duration-300">
        <div className="p-6 border-b border-blue-900">
          <h1 className="text-xl font-bold tracking-wide">MARITIME HSE</h1>
          <p className="text-xs text-blue-200 mt-1">Analytics Platform</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'overview' ? 'bg-maire-light shadow-md' : 'hover:bg-blue-900 text-blue-100'
            }`}
          >
            <DashboardIcon />
            <span>Executive Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'risk' ? 'bg-maire-light shadow-md' : 'hover:bg-blue-900 text-blue-100'
            }`}
          >
            <RiskIcon />
            <span>Risk Analysis</span>
          </button>
          <button
            onClick={() => setActiveTab('forecasting')}
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'forecasting' ? 'bg-maire-light shadow-md' : 'hover:bg-blue-900 text-blue-100'
            }`}
          >
            <TrendIcon />
            <span>Forecasting</span>
          </button>
          <button
            onClick={() => setActiveTab('vessel')}
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'vessel' ? 'bg-maire-light shadow-md' : 'hover:bg-blue-900 text-blue-100'
            }`}
          >
            <ShipIcon />
            <span>Vessel Safety Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('observer')}
            className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === 'observer' ? 'bg-maire-light shadow-md' : 'hover:bg-blue-900 text-blue-100'
            }`}
          >
            <ChartIcon />
            <span>Observer Analysis</span>
          </button>
        </nav>
        <div className="p-4 border-t border-blue-900">
           <button 
             onClick={() => setCurrentView('upload')}
             className="w-full text-xs text-blue-300 hover:text-white underline text-center mb-2"
           >
             Upload New File
           </button>
          <p className="text-xs text-blue-300 text-center">Version 1.2.0 (Prototype)</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'overview' && <ExecutiveOverview data={data} />}
          {activeTab === 'risk' && <RiskAnalysis data={data} />}
          {activeTab === 'forecasting' && <Forecasting data={data} />}
          {activeTab === 'vessel' && <VesselProfile data={data} />}
          {activeTab === 'observer' && <ObserverAnalysis data={data} />}
        </div>
      </main>

      {/* Chatbot Floating Action Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-8 right-8 bg-maire-light hover:bg-blue-500 text-white p-4 rounded-full shadow-xl transition-transform hover:scale-110 z-50 flex items-center justify-center group"
      >
        <ChatIcon />
        <span className="absolute right-full mr-3 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          AI Assistant
        </span>
      </button>

      {/* Chatbot Window */}
      <ChatWindow 
        data={data}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
};

export default App;