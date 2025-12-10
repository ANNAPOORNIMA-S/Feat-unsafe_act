import { SafetyObservation } from '../types';

// Simple CSV parser that handles quoted fields containing commas
export const parseCSV = (csvText: string): SafetyObservation[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(','); // Assuming standard headers for now
  
  const data: SafetyObservation[] = [];

  // Regex to split by comma, ignoring commas inside quotes
  const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const values = line.split(regex).map(val => val.replace(/^"|"$/g, '').trim());

    // Mapping based on the provided CSV structure (SI #, Report ID, Date, Time, Vessel...)
    // Indices: 1=ID, 2=Date, 4=Vessel, 7=Type, 8=Desc, 10=Intervention, 11=Area, 14=Category, 15=Outcome, 26=MappedIssue, 24=Consequence
    // Note: Adjust indices based on actual CSV column count.
    
    if (values.length > 15) {
      data.push({
        id: values[1] || `ROW-${i}`,
        dateReported: values[2],
        vessel: values[4],
        type: values[7],
        description: values[8],
        outcome: values[15],
        category: values[14], // Category of Observation
        areaOfWork: values[11],
        intervention: values[10]?.toLowerCase().includes('intervened') || false,
        mappedIssue: values[26] || 'Unspecified',
        consequences: values[24] || 'Not specified'
      });
    }
  }

  return data;
};