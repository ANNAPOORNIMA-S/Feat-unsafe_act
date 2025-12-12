
import { SafetyObservation } from '../types';

export const parseCSV = (csvText: string): SafetyObservation[] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  
  // Normalize line endings
  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Handle escaped quotes ("") inside a quoted field
          currentField += '"';
          i++; // Skip the next quote
        } else {
          // Closing quote
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        // Opening quote
        inQuotes = true;
      } else if (char === ',') {
        // End of field
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n') {
        // End of row
        currentRow.push(currentField.trim());
        if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  // Handle the last row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  // Dynamic Header Mapping with Fuzzy Matching
  const header = rows[0];
  const dataRows = rows.slice(1);
  
  // Normalize header key: lowercase + remove all non-alphanumeric characters
  const normalizeKey = (k: string) => k.toLowerCase().replace(/[^a-z0-9]/g, '');

  const colMap: Record<string, number> = {};
  header.forEach((col, idx) => {
    colMap[normalizeKey(col)] = idx;
  });

  // Helper to safely get value by checking multiple potential header names
  const getVal = (row: string[], ...keys: string[]): string => {
    for (const key of keys) {
      const idx = colMap[normalizeKey(key)];
      if (idx !== undefined && row[idx] !== undefined) {
        return row[idx];
      }
    }
    return ''; // Return empty string if not found
  };

  return dataRows.map((values, index) => {
    // Basic validation: skip empty rows
    if (values.length < 2) return null;

    // Extract fields using dynamic mapping
    const id = getVal(values, 'Report ID', 'ReportID', 'SI #', 'SI') || `ROW-${index}`;
    const dateReported = getVal(values, 'Date Reported', 'Date');
    const timeReported = getVal(values, 'Time Reported', 'Time');
    const vessel = getVal(values, 'Vessel', 'Vessel Name');
    const observerName = getVal(values, 'Observer Name', 'Observer');
    const observerRank = getVal(values, 'Observer Rank', 'Rank');
    const type = getVal(values, 'Type', 'Observation Type');
    const description = getVal(values, 'Description of Observation', 'Description');
    const outcome = getVal(values, 'Outcome', 'Action Taken');
    const category = getVal(values, 'Category Of Observation', 'Category');
    const areaOfWork = getVal(values, 'Area of Work', 'Area');
    const interventionStr = getVal(values, 'Intervention');
    const intervention = interventionStr.toLowerCase().includes('intervened') || false;
    
    // Robust extraction for Mapped Issue with fallback for plurals/variations
    let mappedIssue = getVal(values, 'Mapped Issue', 'MappedIssue', 'Mapped_Issue', 'Issue', 'Mapped Issues');
    if (!mappedIssue) mappedIssue = 'Unspecified';
    
    // Extraction for Observation Related to (Max. 2 selections) - 1
    let observationRelatedTo1 = getVal(values, 'Observation Related to (Max. 2 selections) - 1', 'ObservationRelatedTo1', 'Related Observation 1', 'Observation Related to');
    if (!observationRelatedTo1) observationRelatedTo1 = 'Unspecified';

    const consequences = getVal(values, 'Potential Consequences', 'Consequences') || 'Not specified';

    return {
      id,
      dateReported,
      timeReported,
      vessel,
      observerName,
      observerRank,
      type,
      description,
      outcome,
      category,
      areaOfWork,
      intervention,
      mappedIssue,
      consequences,
      observationRelatedTo1
    };
  }).filter((item): item is SafetyObservation => item !== null);
};
