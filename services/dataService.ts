import { SafetyObservation, KPI, ChartDataPoint, FilterState, RiskLevel, Outcome } from '../types';
import { parseCSV } from '../utils/csvParser';

export const loadDemoData = async (): Promise<SafetyObservation[]> => {
  try {
    const response = await fetch('data/Unsafe-act-and-conditions_data.csv');
    if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    const text = await response.text();
    return parseCSV(text);
  } catch (error) {
    console.error("Failed to load observations:", error);
    return [];
  }
};

// Deprecated alias for backward compatibility if needed, though we will update App.tsx
export const getObservations = loadDemoData;

export const filterObservations = (data: SafetyObservation[], filters: Partial<FilterState>): SafetyObservation[] => {
  return data.filter(d => {
    if (filters.vessel && filters.vessel !== 'All' && d.vessel !== filters.vessel) return false;
    if (filters.riskLevel && filters.riskLevel !== 'All' && d.category !== filters.riskLevel) return false;
    if (filters.dateRange && filters.dateRange !== 'All' && d.dateReported !== filters.dateRange) return false;
    return true;
  });
};

export const getKPIs = (data: SafetyObservation[]): KPI => {
  const total = data.length;
  const corrected = data.filter(d => d.outcome === Outcome.Corrected).length;
  const interventions = data.filter(d => d.intervention).length;
  const high = data.filter(d => d.category === RiskLevel.High).length;
  const medium = data.filter(d => d.category === RiskLevel.Medium).length;
  const low = data.filter(d => d.category === RiskLevel.Low).length;

  return {
    totalObservations: total,
    correctedCount: corrected,
    percentCorrected: total ? Math.round((corrected / total) * 100) : 0,
    interventionCount: interventions,
    highRiskCount: high,
    mediumRiskCount: medium,
    lowRiskCount: low
  };
};

export const getVesselData = (data: SafetyObservation[]): ChartDataPoint[] => {
  const counts: Record<string, number> = {};
  data.forEach(d => {
    if(d.vessel) counts[d.vessel] = (counts[d.vessel] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

export const getTrendData = (data: SafetyObservation[]): ChartDataPoint[] => {
  const counts: Record<string, number> = {};
  data.forEach(d => {
      if(d.dateReported && typeof d.dateReported === 'string') {
          counts[d.dateReported] = (counts[d.dateReported] || 0) + 1;
      }
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => {
        if (!a.name || typeof a.name !== 'string') return 1;
        if (!b.name || typeof b.name !== 'string') return -1;

        const partsA = a.name.split('-');
        const partsB = b.name.split('-');
        if (partsA.length < 3) return 1;
        if (partsB.length < 3) return -1;
        
        // Assuming dd-mm-yyyy
        const dateA = new Date(parseInt(partsA[2]), parseInt(partsA[1]) - 1, parseInt(partsA[0]));
        const dateB = new Date(parseInt(partsB[2]), parseInt(partsB[1]) - 1, parseInt(partsB[0]));
        
        const timeA = !isNaN(dateA.getTime()) ? dateA.getTime() : 0;
        const timeB = !isNaN(dateB.getTime()) ? dateB.getTime() : 0;
        
        return timeA - timeB;
    });
};

export const getRiskDistribution = (data: SafetyObservation[]): ChartDataPoint[] => {
  return [
    { name: RiskLevel.High, value: data.filter(d => d.category === RiskLevel.High).length, color: '#E74C3C' },
    { name: RiskLevel.Medium, value: data.filter(d => d.category === RiskLevel.Medium).length, color: '#F39C12' },
    { name: RiskLevel.Low, value: data.filter(d => d.category === RiskLevel.Low).length, color: '#2ECC71' }
  ].filter(d => d.value > 0);
};

export const getObservationsByType = (data: SafetyObservation[]): ChartDataPoint[] => {
  const counts: Record<string, number> = {};
  data.forEach(d => {
    if(d.type) counts[d.type] = (counts[d.type] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
};

export const getObservationTypesByVessel = (data: SafetyObservation[]): any[] => {
  const vessels = Array.from(new Set(data.map(d => d.vessel).filter(Boolean)));
  return vessels.map(v => {
    const vData = data.filter(d => d.vessel === v);
    return {
      name: v,
      'Unsafe Act': vData.filter(d => d.type === 'UNSAFE_ACT').length,
      'Unsafe Condition': vData.filter(d => d.type === 'UNSAFE_CONDITION').length,
      total: vData.length
    };
  }).sort((a, b) => b.total - a.total).slice(0, 7);
};

export const getDateList = (data: SafetyObservation[]): string[] => {
  return Array.from(new Set(data.map(d => d.dateReported).filter(Boolean))).sort((a, b) => {
      if (!a || typeof a !== 'string') return 1;
      if (!b || typeof b !== 'string') return -1;

      const partsA = a.split('-');
      const partsB = b.split('-');
      if (partsA.length < 3) return 1;
      if (partsB.length < 3) return -1;

      const dateA = new Date(parseInt(partsA[2]), parseInt(partsA[1]) - 1, parseInt(partsA[0]));
      const dateB = new Date(parseInt(partsB[2]), parseInt(partsB[1]) - 1, parseInt(partsB[0]));
      
      const timeA = !isNaN(dateA.getTime()) ? dateA.getTime() : 0;
      const timeB = !isNaN(dateB.getTime()) ? dateB.getTime() : 0;

      return timeA - timeB;
  });
};

export const getTopMappedIssues = (data: SafetyObservation[], limit = 10): ChartDataPoint[] => {
  const counts: Record<string, number> = {};
  const displayMap: Record<string, string> = {}; 

  data.forEach(d => {
      const rawIssue = d.mappedIssue || '';
      
      // Simple Normalization: Trim and Lowercase only
      // We avoid aggressive regex replacement to prevent merging distinct categories like "Type A" and "Type-A" if they are meant to be different,
      // or "Issue (Minor)" and "Issue (Major)".
      let normalized = rawIssue.trim().toLowerCase();
      
      // Normalize internal whitespace (e.g. "A  B" -> "A B")
      normalized = normalized.replace(/\s+/g, ' ');

      if (
          !normalized ||
          normalized === '' || 
          normalized === 'not specified' || 
          normalized === 'unspecified' || 
          normalized === 'null' || 
          normalized === 'n/a'
      ) {
          return;
      }

      counts[normalized] = (counts[normalized] || 0) + 1;

      // Track the display name (Use the first encountered format)
      if (!displayMap[normalized]) {
          displayMap[normalized] = rawIssue.trim();
      }
  });

  return Object.entries(counts)
    .map(([key, value]) => ({ 
        name: displayMap[key] || key, 
        value 
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
};

export const getTopRelatedObservations = (data: SafetyObservation[], limit = 10): ChartDataPoint[] => {
  const counts: Record<string, number> = {};
  const displayMap: Record<string, string> = {}; 

  data.forEach(d => {
      const rawValue = d.observationRelatedTo1 || '';
      
      // Simple Normalization: Trim and Lowercase only
      let normalized = rawValue.trim().toLowerCase();
      normalized = normalized.replace(/\s+/g, ' ');
      
      if (
          !normalized ||
          normalized === '' || 
          normalized === 'not specified' || 
          normalized === 'unspecified' || 
          normalized === 'null' || 
          normalized === 'n/a'
      ) {
          return;
      }

      counts[normalized] = (counts[normalized] || 0) + 1;

      if (!displayMap[normalized]) {
          displayMap[normalized] = rawValue.trim();
      }
  });

  return Object.entries(counts)
    .map(([key, value]) => ({ 
        name: displayMap[key] || key, 
        value 
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
};

export const getRiskByVessel = (data: SafetyObservation[]): any[] => {
  const vessels = Array.from(new Set(data.map(d => d.vessel).filter(Boolean)));
  const result = vessels.map(vessel => {
    const vData = data.filter(d => d.vessel === vessel);
    return {
      name: vessel,
      'High Risk': vData.filter(d => d.category === RiskLevel.High).length,
      'Medium Risk': vData.filter(d => d.category === RiskLevel.Medium).length,
      'Low Risk': vData.filter(d => d.category === RiskLevel.Low).length,
      total: vData.length
    };
  });
  // Sort descending by total number of risks
  return result.sort((a, b) => b.total - a.total);
};

export const getHeatmapData = (data: SafetyObservation[]): any[] => {
    const consequences = Array.from(new Set(data.map(d => d.consequences || 'Unspecified')));
    return consequences.map(c => {
        const cData = data.filter(d => (d.consequences || 'Unspecified') === c);
        return {
            consequence: c,
            'High Risk': cData.filter(d => d.category === RiskLevel.High).length,
            'Medium Risk': cData.filter(d => d.category === RiskLevel.Medium).length,
            'Low Risk': cData.filter(d => d.category === RiskLevel.Low).length,
        };
    }).sort((a,b) => (b['High Risk'] + b['Medium Risk'] + b['Low Risk']) - (a['High Risk'] + a['Medium Risk'] + a['Low Risk'])).slice(0, 10);
};

export const getVesselList = (data: SafetyObservation[]): string[] => {
    return Array.from(new Set(data.map(d => d.vessel).filter(Boolean))).sort();
};

export const getAreaOfWorkStats = (data: SafetyObservation[]): ChartDataPoint[] => {
    const counts: Record<string, number> = {};
    data.forEach(d => {
        if(d.areaOfWork) counts[d.areaOfWork] = (counts[d.areaOfWork] || 0) + 1;
    });
    return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 7); // Return top 7 only
};