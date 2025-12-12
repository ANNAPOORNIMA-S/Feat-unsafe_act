import React, { useState, useRef } from 'react';
import { SafetyObservation } from '../types';
import { parseCSV } from '../utils/csvParser';

interface Props {
  onDataLoaded: (data: SafetyObservation[]) => void;
}

const DataUpload: React.FC<Props> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setIsLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsedData = parseCSV(text);
        
        if (parsedData.length === 0) {
          throw new Error("No valid records found in CSV.");
        }

        // Simulate a small delay for UX "Analyzing" effect
        setTimeout(() => {
          onDataLoaded(parsedData);
        }, 800);
      } catch (err) {
        console.error(err);
        setError("Failed to parse CSV. Please ensure it matches the standard format.");
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Error reading file.");
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen w-full bg-bg-slate flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-xl w-full border border-gray-100 animate-fade-in-up">
        
        <div className="text-center mb-8">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-maire-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Upload Data Source</h2>
          <p className="text-slate-500 mt-2">Upload your HSE Observation CSV file to generate the dashboard, forecast models, and chatbot context.</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maire-blue"></div>
            <p className="text-maire-blue font-semibold animate-pulse">Analyzing Dataset & Training AI...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Drag Drop Zone */}
            <div 
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
                isDragging 
                  ? 'border-maire-light bg-blue-50' 
                  : 'border-gray-300 hover:border-maire-blue hover:bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv"
                onChange={handleFileSelect}
              />
              <p className="text-slate-600 font-medium">
                Drag & Drop your CSV file here
              </p>
              <p className="text-sm text-gray-400 mt-2">or click to browse</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataUpload;