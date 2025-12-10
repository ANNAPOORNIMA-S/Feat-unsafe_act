export enum RiskLevel {
  High = 'High Risk',
  Medium = 'Medium Risk',
  Low = 'Low Risk'
}

export enum Outcome {
  Corrected = 'Corrected',
  PartlyCorrected = 'Partly corrected',
  NotCorrected = 'Not corrected'
}

export enum ObservationType {
  UnsafeAct = 'UNSAFE_ACT',
  UnsafeCondition = 'UNSAFE_CONDITION'
}

export interface SafetyObservation {
  id: string; // Report ID
  dateReported: string; // Date Reported
  vessel: string; // Vessel
  type: string; // Type
  description: string; // Description
  outcome: string; // Outcome
  category: string; // Category Of Observation
  areaOfWork: string; // Area of Work
  intervention: boolean; // Was intervention taken?
  mappedIssue: string; // Mapped Issue for grouping
  consequences: string; // Potential Consequences
}

export interface KPI {
  totalObservations: number;
  correctedCount: number;
  percentCorrected: number;
  interventionCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  secondaryValue?: number; // e.g. Rolling Average or Prediction
  color?: string;
  isPrediction?: boolean;
}

export interface FilterState {
  vessel: string | 'All';
  riskLevel: string | 'All';
  dateRange: string | 'All';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}
