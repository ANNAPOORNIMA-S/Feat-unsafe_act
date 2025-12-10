import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

// Note: To run this, you would need 'express', 'cors', 'csv-parse' installed.
// This file serves as the Backend API implementation requested in Step 2.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Use explicit any cast for middleware to avoid strict type issues with Express types in this environment
app.use(cors() as any);
app.use(express.json() as any);

// Path to CSV file
const CSV_FILE_PATH = path.join(__dirname, 'data.csv');

// Interfaces (Shared with Frontend ideally)
interface Observation {
  'SI #': string;
  'Date Reported': string;
  'Vessel': string;
  'Type': string;
  'Category Of Observation': string;
  'Outcome': string;
  'Mapped Issue': string;
}

// In-memory cache for demo purposes
let observations: Observation[] = [];

// Load Data
const loadData = () => {
  try {
    const fileContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
    observations = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    console.log(`Loaded ${observations.length} records.`);
  } catch (error) {
    console.error("Error reading CSV:", error);
  }
};

// Initial load
loadData();

// --- Endpoints ---

// 1. Get Summary Stats (KPIs)
app.get('/api/kpi', (req: any, res: any) => {
  const total = observations.length;
  const corrected = observations.filter(o => o['Outcome'] === 'Corrected').length;
  const highRisk = observations.filter(o => o['Category Of Observation'] === 'High Risk').length;
  
  res.json({
    totalObservations: total,
    percentCorrected: total > 0 ? (corrected / total) * 100 : 0,
    highRiskCount: highRisk,
    // ... add other KPIs
  });
});

// 2. Get Time Series Data
app.get('/api/trend', (req: any, res: any) => {
  const trendMap: Record<string, number> = {};
  
  observations.forEach(o => {
    const date = o['Date Reported'];
    trendMap[date] = (trendMap[date] || 0) + 1;
  });

  const trendData = Object.entries(trendMap).map(([date, count]) => ({
    date,
    count
  }));

  res.json(trendData);
});

// 3. Get Filtered Observations
app.get('/api/observations', (req: any, res: any) => {
  const { vessel, risk } = req.query;
  let filtered = observations;

  if (vessel) {
    filtered = filtered.filter(o => o['Vessel'] === vessel);
  }
  if (risk) {
    filtered = filtered.filter(o => o['Category Of Observation'] === risk);
  }

  res.json(filtered.slice(0, 100)); // Limit payload
});

app.listen(PORT, () => {
  console.log(`MAIRE HSE API running on http://localhost:${PORT}`);
});