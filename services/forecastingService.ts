import { SafetyObservation, ChartDataPoint } from '../types';

// Helper to parse dates
const parseDate = (dateStr: string) => {
  if (!dateStr || typeof dateStr !== 'string') return new Date(NaN); // Return Invalid Date
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date(NaN);
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
};

interface RegressionResult {
  slope: number;
  intercept: number;
  r2: number;
}

// Simple Linear Regression: y = mx + b
const calculateRegression = (xValues: number[], yValues: number[]): RegressionResult => {
  const n = xValues.length;
  if (n === 0) return { slope: 0, intercept: 0, r2: 0 };

  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept, r2: 0 }; // R2 omitted for brevity
};

export const getWeeklyForecast = (data: SafetyObservation[], weeksToPredict: number = 4): ChartDataPoint[] => {
  // 1. Group data by ISO Week (simplistic approach: timestamps sorted)
  const groupedData: Map<string, number> = new Map();
  const dateMap: Map<string, Date> = new Map();

  // Sort data chronologically, handling invalid dates
  const sortedData = [...data].sort((a, b) => {
    const da = parseDate(a.dateReported);
    const db = parseDate(b.dateReported);
    if (isNaN(da.getTime())) return 1;
    if (isNaN(db.getTime())) return -1;
    return da.getTime() - db.getTime();
  });
  
  if (sortedData.length === 0) return [];

  // Bucket by week start date
  sortedData.forEach(d => {
    const date = parseDate(d.dateReported);
    
    // Skip if invalid date
    if (isNaN(date.getTime())) return;

    // Get Monday of the week
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(date);
    monday.setDate(diff);
    monday.setHours(0,0,0,0);
    
    try {
      const key = monday.toISOString().split('T')[0];
      groupedData.set(key, (groupedData.get(key) || 0) + 1);
      dateMap.set(key, monday);
    } catch (e) {
      // Ignore dates that result in invalid calculations
    }
  });

  // Convert to arrays for regression
  const distinctDates = Array.from(groupedData.keys()).sort();
  const xValues = distinctDates.map((_, i) => i); // 0, 1, 2...
  const yValues = distinctDates.map(k => groupedData.get(k) || 0);

  if (distinctDates.length === 0) return [];

  // Calculate Regression
  const { slope, intercept } = calculateRegression(xValues, yValues);

  // Build Result Data (Historical)
  const result: ChartDataPoint[] = distinctDates.map((dateStr, i) => {
    const d = dateMap.get(dateStr);
    return {
      name: d ? `${d.getDate()}/${d.getMonth()+1}` : dateStr,
      value: yValues[i],
      secondaryValue: undefined,
      isPrediction: false
    };
  });

  // Add Predictions
  const lastIndex = xValues.length - 1;
  const lastDateStr = distinctDates[lastIndex];
  const lastDate = dateMap.get(lastDateStr) || new Date();

  for (let i = 1; i <= weeksToPredict; i++) {
    const nextIndex = lastIndex + i;
    const predictedValue = Math.max(0, Math.round(slope * nextIndex + intercept)); // Prevent negative incidents
    
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + (i * 7));

    result.push({
      name: `${nextDate.getDate()}/${nextDate.getMonth()+1} (Est)`,
      value: 0, // No actual data
      secondaryValue: predictedValue,
      isPrediction: true
    });
  }

  return result;
};

export const getVesselForecast = (data: SafetyObservation[]): ChartDataPoint[] => {
  // Determine which vessel is trending upwards the fastest
  const vessels = Array.from(new Set(data.map(d => d.vessel)));
  const forecast: ChartDataPoint[] = [];

  vessels.forEach(v => {
    const vesselData = data.filter(d => d.vessel === v);
    // Calculate simple trend (incidents last 7 days vs previous 7 days)
    // For this prototype, let's just use total count scaled slightly by risk for "Predicted Risk Score"
    const total = vesselData.length;
    const highRisk = vesselData.filter(d => d.category === 'High Risk').length;
    
    // A dummy prediction metric: momentum
    const predictedNextWeek = Math.round(total * 0.1 + highRisk * 0.5); 
    
    forecast.push({
      name: v,
      value: predictedNextWeek
    });
  });

  return forecast.sort((a, b) => b.value - a.value).slice(0, 5);
};