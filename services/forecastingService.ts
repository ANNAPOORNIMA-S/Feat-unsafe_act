
import { SafetyObservation, ChartDataPoint } from '../types';

// Helper to parse dates (dd-mm-yyyy) as UTC to avoid timezone/DST issues
const parseDateUTC = (dateStr: string) => {
  if (!dateStr || typeof dateStr !== 'string') return new Date(NaN);
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date(NaN);
  // Create date at 12:00 UTC to be safe from any boundary shifts
  return new Date(Date.UTC(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), 12, 0, 0));
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

  // Avoid division by zero if all x are the same (only 1 data point)
  const denominator = (n * sumXX - sumX * sumX);
  if (denominator === 0) return { slope: 0, intercept: sumY / n, r2: 0 };

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept, r2: 0 }; 
};

// Helper: Buckets data by 7-Day Cycles starting from the FIRST DATE in dataset
const groupDataByCycle = (data: SafetyObservation[]) => {
  if (data.length === 0) return { xValues: [], yValues: [], distinctDates: [], dateMap: new Map() };

  // 1. Find the earliest valid date (Start of dataset)
  let minDateVal = Infinity;
  let maxDateVal = -Infinity;

  const validData = data.filter(d => {
    const t = parseDateUTC(d.dateReported).getTime();
    return !isNaN(t);
  });

  if (validData.length === 0) return { xValues: [], yValues: [], distinctDates: [], dateMap: new Map() };
  
  validData.forEach(d => {
     const t = parseDateUTC(d.dateReported).getTime();
     if(t < minDateVal) minDateVal = t;
     if(t > maxDateVal) maxDateVal = t;
  });
  
  const startDate = new Date(minDateVal);
  // Normalize to UTC midnight for clean math
  startDate.setUTCHours(0,0,0,0);

  const groupedData: Map<string, number> = new Map();
  const dateMap: Map<string, Date> = new Map();

  // 2. Bucket data into 7-day chunks starting from startDate
  validData.forEach(d => {
    const date = parseDateUTC(d.dateReported);
    date.setUTCHours(0,0,0,0);
    
    // Calculate days passed since start (using UTC ensures 24h days)
    const diffTime = date.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Determine 7-day bucket index (0 = first 7 days, 1 = next 7 days...)
    const cycleIndex = Math.max(0, Math.floor(diffDays / 7));
    
    // Calculate bucket start date label
    const bucketDate = new Date(startDate);
    bucketDate.setUTCDate(startDate.getUTCDate() + (cycleIndex * 7));
    
    const key = bucketDate.toISOString().split('T')[0];
    groupedData.set(key, (groupedData.get(key) || 0) + 1);
    dateMap.set(key, bucketDate);
  });

  // 3. Fill gaps to ensure continuous X-axis for regression
  const totalDaysRange = Math.floor((maxDateVal - minDateVal) / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDaysRange / 7);

  const xValues: number[] = [];
  const yValues: number[] = [];
  const distinctDates: string[] = [];

  for (let i = 0; i <= totalWeeks; i++) {
     const bucketDate = new Date(startDate);
     bucketDate.setUTCDate(startDate.getUTCDate() + (i * 7));
     const key = bucketDate.toISOString().split('T')[0];
     
     xValues.push(i);
     yValues.push(groupedData.get(key) || 0); // Use 0 if no data in that week
     distinctDates.push(key);
     dateMap.set(key, bucketDate);
  }

  return { xValues, yValues, distinctDates, dateMap };
};

export const getWeeklyForecast = (data: SafetyObservation[], weeksToPredict: number = 4): ChartDataPoint[] => {
  const { xValues, yValues, distinctDates, dateMap } = groupDataByCycle(data);

  if (distinctDates.length === 0) return [];

  // Calculate Regression
  const { slope, intercept } = calculateRegression(xValues, yValues);

  // Build Result Data (Historical)
  const result: ChartDataPoint[] = distinctDates.map((dateStr, i) => {
    const d = dateMap.get(dateStr);
    
    // Construct Range Label (Start Date - End Date)
    let label = dateStr;
    if (d) {
        const startDay = d.getUTCDate();
        const startMonth = d.getUTCMonth() + 1;
        
        // Calculate End Date of the 7-day cycle
        const endDate = new Date(d);
        endDate.setUTCDate(d.getUTCDate() + 6);
        const endDay = endDate.getUTCDate();
        const endMonth = endDate.getUTCMonth() + 1;
        
        label = `${startDay}/${startMonth}-${endDay}/${endMonth}`;
    }

    return {
      name: label,
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
    // Prediction formula: y = mx + b
    const rawPrediction = slope * nextIndex + intercept;
    const predictedValue = Math.max(0, Math.round(rawPrediction)); // Prevent negative incidents
    
    // Calculate Start Date of Prediction Week
    const nextDate = new Date(lastDate);
    nextDate.setUTCDate(nextDate.getUTCDate() + (i * 7));
    
    // Calculate End Date of Prediction Week
    const endDate = new Date(nextDate);
    endDate.setUTCDate(nextDate.getUTCDate() + 6);
    
    const label = `${nextDate.getUTCDate()}/${nextDate.getUTCMonth()+1}-${endDate.getUTCDate()}/${endDate.getUTCMonth()+1}`;

    result.push({
      name: `${label} (Est)`,
      value: 0, // No actual data
      secondaryValue: predictedValue,
      isPrediction: true
    });
  }

  return result;
};

export const getVesselForecast = (data: SafetyObservation[]): ChartDataPoint[] => {
  // 1. Get List of Vessels
  const vessels = Array.from(new Set(data.map(d => d.vessel).filter(Boolean)));
  const forecast: ChartDataPoint[] = [];

  vessels.forEach(v => {
    // 2. Filter data for this vessel
    const vesselData = data.filter(d => d.vessel === v);
    
    // 3. Run Regression specific to this vessel using the same cycle logic
    const { xValues, yValues } = groupDataByCycle(vesselData);
    
    if (xValues.length < 2) {
      // Not enough data points to forecast trend, fallback to average
      const avg = vesselData.length / (xValues.length || 1);
      forecast.push({ name: v, value: Math.round(avg) });
      return;
    }

    const { slope, intercept } = calculateRegression(xValues, yValues);
    
    // 4. Predict Next Week's Value
    const nextIndex = xValues[xValues.length - 1] + 1;
    let predictedNextWeek = slope * nextIndex + intercept;
    
    // Weighting: If slope is positive (increasing incidents), add a penalty weight
    if (slope > 0) {
      predictedNextWeek = predictedNextWeek * 1.2; 
    }

    forecast.push({
      name: v,
      value: Math.max(0, Math.round(predictedNextWeek))
    });
  });

  // Sort by highest predicted incidents
  return forecast.sort((a, b) => b.value - a.value).slice(0, 5);
};
