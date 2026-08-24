export interface SummaryByType {
  type: string;
  label: string;
  count: number;
  color?: string;
}

export interface AgeDistribution {
  range: string;
  label: string;
  count: number;
}

export interface SeniorityDistribution {
  range: string;
  label: string;
  count: number;
}
