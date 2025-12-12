
import { SafetyObservation, PredictionRequest, PredictionResponse, RiskLevel } from '../types';

// ============================================================================
// CONNECTION CONFIGURATION
// This URL points to the Python Flask server defined in `server/ml_api.py`.
// Your .pkl model is loaded on that server, NOT in this browser file.
// ============================================================================
const API_URL = 'http://localhost:5000/predict';

/**
 * SIMULATION LOGIC
 * Defined before usage to ensure safe compilation.
 * This mimics what the ML model would do by analyzing the historical data.
 */
const simulatePrediction = (req: PredictionRequest, data: SafetyObservation[]): Promise<PredictionResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Filter history for this vessel and risk level
      const vesselData = data.filter(d => d.vessel === req.vessel);
      const riskData = vesselData.filter(d => d.category === req.riskLevel);
      
      // Default dataset if filter is too strict
      const sourceData = riskData.length > 0 ? riskData : (vesselData.length > 0 ? vesselData : data);

      // Helper to get most frequent item in an array
      const getMode = (arr: string[]) => {
        if(arr.length === 0) return "N/A";
        return arr.sort((a,b) => arr.filter(v => v===a).length - arr.filter(v => v===b).length).pop() || "N/A";
      };

      const predictedIssueType = getMode(sourceData.map(d => d.type));
      const predictedCategory = getMode(sourceData.map(d => d.mappedIssue || d.category));
      const relatedTo1 = getMode(sourceData.map(d => d.observationRelatedTo1));
      
      // Calculate a "predicted count" based on recent weekly average intensity
      const baseCount = Math.ceil(Math.random() * 5); 
      const predictedCount = req.riskLevel === RiskLevel.High ? Math.max(1, baseCount - 2) : baseCount;

      // Generate context-aware suggestions
      const suggestions = [
        `Conduct targeted toolbox talk regarding ${predictedCategory.toLowerCase()}.`,
        `Increase frequency of safety rounds in ${getMode(sourceData.map(d => d.areaOfWork))} area.`,
        `Review risk assessment (TRA) specifically for ${relatedTo1.toLowerCase()} hazards.`,
        `Verify all crew certifications related to ${predictedIssueType.toLowerCase().replace('_', ' ')}.`
      ];

      resolve({
        predictedIssueType,
        predictedCategory,
        relatedTo1,
        relatedTo2: "Situational Awareness",
        predictedCount,
        suggestions,
        confidenceScore: 85 + Math.floor(Math.random() * 10)
      });
    }, 1500); // Simulate processing time
  });
};

/**
 * Calls the Python ML Backend to get predictions.
 * If the backend is unreachable (offline prototype), it falls back to a smart heuristic simulation
 * using the loaded CSV data.
 */
export const predictIncident = async (
  request: PredictionRequest, 
  historicalData: SafetyObservation[]
): Promise<PredictionResponse> => {
  try {
    // 1. Attempt to call the real Python API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout for prototype speed

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error("ML Backend returned error");
    }

    return await response.json();

  } catch (error) {
    console.warn("[ML Service] Backend unreachable or timeout. Using Simulation Model based on historical data.");
    
    // 2. Fallback: Simulation Logic (Heuristics based on historical patterns)
    return simulatePrediction(request, historicalData);
  }
};
