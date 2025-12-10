import React from 'react';

interface Props {
  onEnter: () => void;
}

export const Welcome: React.FC<Props> = ({ onEnter }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-[#003A70] to-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="z-10 flex flex-col items-center text-center space-y-6 p-4 md:p-8 animate-fade-in-up w-full max-w-4xl">
        
        {/* Custom Vessel Data Illustration */}
        <div className="w-full h-64 md:h-80 relative flex items-center justify-center mb-4">
          <svg className="w-full h-full drop-shadow-2xl" viewBox="0 0 600 350" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="hullGradient" x1="150" y1="200" x2="450" y2="300" gradientUnits="userSpaceOnUse">
                <stop stopColor="#003A70" />
                <stop offset="1" stopColor="#0F172A" />
              </linearGradient>
              <linearGradient id="skyGradient" x1="300" y1="0" x2="300" y2="350" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2AA4F4" stopOpacity="0.15" />
                <stop offset="1" stopColor="#2AA4F4" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Abstract Background Glow */}
            <circle cx="300" cy="180" r="140" fill="url(#skyGradient)" />

            {/* Ship Silhouette / Vector Group */}
            <g transform="translate(100, 20)">
                {/* Rear Structure (Bridge) */}
                <path d="M280 140 L360 140 L360 220 L280 220 Z" fill="white" fillOpacity="0.05" stroke="white" strokeOpacity="0.2" />
                <rect x="290" y="150" width="60" height="8" rx="2" fill="white" />
                <rect x="290" y="165" width="60" height="8" rx="2" fill="white" />
                <rect x="290" y="180" width="60" height="8" rx="2" fill="white" />
                
                {/* Hull */}
                <path d="M40 220 L380 220 L350 280 H100 L40 220Z" fill="url(#hullGradient)" stroke="#2AA4F4" strokeWidth="2" />
                {/* Updated Text on Hull */}
                <text x="320" y="250" fill="white" fontSize="10" opacity="0.5" fontFamily="sans-serif" letterSpacing="2">FLEET</text>
                
                {/* Cargo Containers (Stacked) */}
                <rect x="80" y="180" width="40" height="40" fill="#2AA4F4" stroke="#003A70" strokeWidth="1" />
                <rect x="120" y="180" width="40" height="40" fill="#2AA4F4" fillOpacity="0.7" stroke="#003A70" strokeWidth="1" />
                <rect x="160" y="180" width="40" height="40" fill="#2AA4F4" stroke="#003A70" strokeWidth="1" />
                <rect x="200" y="180" width="40" height="40" fill="#2AA4F4" fillOpacity="0.7" stroke="#003A70" strokeWidth="1" />
                
                <rect x="100" y="140" width="40" height="40" fill="#2AA4F4" fillOpacity="0.5" stroke="#003A70" strokeWidth="1" />
                <rect x="140" y="140" width="40" height="40" fill="#2AA4F4" stroke="#003A70" strokeWidth="1" />
                <rect x="180" y="140" width="40" height="40" fill="#2AA4F4" fillOpacity="0.5" stroke="#003A70" strokeWidth="1" />

                {/* Crane / Mast */}
                <path d="M320 140 L320 100 L300 100" stroke="white" strokeWidth="3" strokeLinecap="round" />
                <circle cx="320" cy="95" r="3" fill="#E74C3C" className="animate-pulse" />
            </g>

            {/* Data Flow Lines (Waves) representing Analytics */}
            <path d="M50 280 Q 150 260, 250 280 T 450 280 T 650 280" stroke="#2AA4F4" strokeWidth="2" strokeOpacity="0.6" fill="none" />
            <path d="M30 295 Q 130 275, 230 295 T 430 295 T 630 295" stroke="#2AA4F4" strokeWidth="1.5" strokeOpacity="0.3" fill="none" />
            
            {/* Floating Data Nodes (Animated) */}
            <g className="animate-bounce" style={{animationDuration: '3s'}}>
              <circle cx="180" cy="120" r="4" fill="white" />
              <text x="190" y="125" fill="#2AA4F4" fontSize="10" fontWeight="bold">SAFETY</text>
              <line x1="180" y1="120" x2="200" y2="160" stroke="white" strokeOpacity="0.3" strokeDasharray="4 4" />
            </g>

            <g className="animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}>
              <circle cx="450" cy="150" r="4" fill="#2ECC71" />
              <text x="460" y="155" fill="#2ECC71" fontSize="10" fontWeight="bold">SUSTAINABILITY</text>
              <line x1="450" y1="150" x2="400" y2="200" stroke="white" strokeOpacity="0.3" strokeDasharray="4 4" />
            </g>

            <g className="animate-pulse">
               <circle cx="80" cy="220" r="2" fill="white" />
               <circle cx="500" cy="220" r="2" fill="white" />
               <circle cx="300" cy="320" r="2" fill="white" />
            </g>
          </svg>
        </div>

        {/* Title Block */}
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight drop-shadow-lg">
            Vessel <span className="text-transparent bg-clip-text bg-gradient-to-r from-maire-light to-cyan-300">Safety Management</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 font-light tracking-wide max-w-2xl mx-auto opacity-90">
            Analytics & Forecasting Platform
          </p>
        </div>

        {/* Description */}
        <p className="max-w-xl text-gray-300 text-sm md:text-base leading-relaxed opacity-80">
          Advanced insights into unsafe acts, conditions, and risk trends. 
          Empowering data-driven decisions for a safer maritime environment.
        </p>

        {/* Action Button */}
        <button 
          onClick={onEnter}
          className="mt-8 group relative px-10 py-4 bg-white text-maire-blue font-bold rounded-full shadow-[0_0_25px_rgba(42,164,244,0.4)] hover:shadow-[0_0_40px_rgba(42,164,244,0.6)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-3 text-lg">
            Go to Dashboard
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1 text-maire-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
          <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>

      {/* Footer / Meta */}
      <div className="absolute bottom-8 text-white/30 text-xs tracking-widest uppercase flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
        System Operational • v1.1
      </div>
    </div>
  );
};