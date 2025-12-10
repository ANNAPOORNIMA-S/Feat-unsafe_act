import { SafetyObservation } from '../types';

// Helper to parse dates
const parseDate = (dateStr: string) => {
  if (!dateStr || typeof dateStr !== 'string') return new Date(NaN);
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date(NaN);
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
};

export const processQuery = (query: string, data: SafetyObservation[]): string => {
  if (!query) return "Please ask a question.";
  
  const lowerQuery = query.toLowerCase().trim();
  
  // 1. Identify Context (Vessel)
  // Get list of potential vessels from data to match against query
  const uniqueVessels = Array.from(new Set(data.map(d => d.vessel).filter(v => typeof v === 'string' && v.length > 0)));
  
  // Sort by length desc to match longest name first (e.g. "Nautica 1" vs "Nautica")
  uniqueVessels.sort((a, b) => b.length - a.length);
  
  const matchedVessel = uniqueVessels.find(v => lowerQuery.includes(v.toLowerCase()));
  
  // 2. Identify Context (Risk)
  const riskLevels = ['high risk', 'medium risk', 'low risk'];
  const matchedRisk = riskLevels.find(r => lowerQuery.includes(r));

  // 3. Filter Data
  let filtered = data;
  let contextDescription = "the entire fleet";

  if (matchedVessel) {
    filtered = filtered.filter(d => d.vessel && d.vessel.toLowerCase() === matchedVessel.toLowerCase());
    contextDescription = matchedVessel;
  }

  if (matchedRisk) {
    filtered = filtered.filter(d => d.category && d.category.toLowerCase() === matchedRisk);
    contextDescription += ` (${matchedRisk})`;
  }

  // 4. Intent Recognition

  // Intent: Count / How many
  if (lowerQuery.includes('how many') || lowerQuery.includes('count') || lowerQuery.includes('total')) {
    const total = filtered.length;
    if (lowerQuery.includes('unsafe act')) {
      const acts = filtered.filter(d => d.type === 'UNSAFE_ACT').length;
      return `There are **${acts}** unsafe acts reported for ${contextDescription}.`;
    }
    if (lowerQuery.includes('unsafe condition')) {
      const conds = filtered.filter(d => d.type === 'UNSAFE_CONDITION').length;
      return `There are **${conds}** unsafe conditions reported for ${contextDescription}.`;
    }
    return `I found **${total}** total observations for ${contextDescription}.`;
  }

  // Intent: Worst / Most / Highest
  if (lowerQuery.includes('most') || lowerQuery.includes('highest') || lowerQuery.includes('worst') || lowerQuery.includes('top')) {
    if (lowerQuery.includes('vessel') || lowerQuery.includes('ship')) {
      // Aggregate by vessel
      const counts: Record<string, number> = {};
      filtered.forEach(d => {
        if(d.vessel) counts[d.vessel] = (counts[d.vessel] || 0) + 1;
      });
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        return `**${sorted[0][0]}** has the highest number of observations (${sorted[0][1]}).`;
      }
      return "No vessel data found.";
    }
    
    // Default to Issues if not vessel
    // Aggregate by Mapped Issue
    const counts: Record<string, number> = {};
    filtered.forEach(d => {
        if(d.mappedIssue && d.mappedIssue !== 'Unspecified' && d.mappedIssue !== 'null') {
            counts[d.mappedIssue] = (counts[d.mappedIssue] || 0) + 1;
        }
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
        return `The most common issue for ${contextDescription} is **${sorted[0][0]}** with ${sorted[0][1]} occurrences.`;
    }
    return "No specific issue patterns found.";
  }

  // Intent: Summary / Overview
  if (lowerQuery.includes('summary') || lowerQuery.includes('overview') || lowerQuery.includes('tell me about')) {
    const total = filtered.length;
    const high = filtered.filter(d => d.category === 'High Risk').length;
    const open = filtered.filter(d => d.outcome !== 'Corrected').length;
    return `**Summary for ${contextDescription}:**\n- Total Observations: ${total}\n- High Risk: ${high}\n- Open/Pending Actions: ${open}`;
  }

  // Intent: Recent / Latest
  if (lowerQuery.includes('recent') || lowerQuery.includes('latest') || lowerQuery.includes('last')) {
    const sorted = [...filtered].sort((a, b) => {
        const da = parseDate(a.dateReported);
        const db = parseDate(b.dateReported);
        if (isNaN(da.getTime())) return 1;
        if (isNaN(db.getTime())) return -1;
        return db.getTime() - da.getTime(); // Descending
    });
    
    const latest = sorted[0];
    if (latest) {
      return `The most recent observation for ${contextDescription} was on **${latest.dateReported}**:\n"${latest.description}" (${latest.category})`;
    }
    return "No recent observations found.";
  }

  // Default Fallback
  return `I can help you analyze safety data for ${contextDescription}. Try asking: "How many high risk incidents?", "What is the most common issue?", or "Give me a summary".`;
};