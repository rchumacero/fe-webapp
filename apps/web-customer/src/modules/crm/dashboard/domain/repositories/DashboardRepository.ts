import { SummaryByType, AgeDistribution, SeniorityDistribution } from "../entities/Dashboard";

export interface DashboardRepository {
  getSummaryByType(): Promise<SummaryByType[]>;
  getAgeDistributionNatural(): Promise<AgeDistribution[]>;
  getSeniorityDistributionLegal(): Promise<SeniorityDistribution[]>;
}
