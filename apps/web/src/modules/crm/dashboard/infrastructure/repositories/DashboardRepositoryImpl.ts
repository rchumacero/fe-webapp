import { createApiClient } from "@kplian/infrastructure";
import { DashboardRepository } from "../../domain/repositories/DashboardRepository";
import { SummaryByType, AgeDistribution, SeniorityDistribution } from "../../domain/entities/Dashboard";

const apiClient = createApiClient('crm');

const BACKEND_ROUTES = {
  SUMMARY_BY_TYPE: '/v1/dashboard/summary-by-type',
  AGE_DISTRIBUTION: '/v1/dashboard/age-distribution-natural',
  SENIORITY_DISTRIBUTION: '/v1/dashboard/seniority-distribution-legal',
};

export class DashboardRepositoryImpl implements DashboardRepository {
  async getSummaryByType(): Promise<SummaryByType[]> {
    try {
      const response = await apiClient.get<SummaryByType[]>(BACKEND_ROUTES.SUMMARY_BY_TYPE);
      return response.data || [];
    } catch (error) {
      console.error("DashboardRepository.getSummaryByType failed:", error);
      return [];
    }
  }

  async getAgeDistributionNatural(): Promise<AgeDistribution[]> {
    try {
      const response = await apiClient.get<AgeDistribution[]>(BACKEND_ROUTES.AGE_DISTRIBUTION);
      return response.data || [];
    } catch (error) {
      console.error("DashboardRepository.getAgeDistributionNatural failed:", error);
      return [];
    }
  }

  async getSeniorityDistributionLegal(): Promise<SeniorityDistribution[]> {
    try {
      const response = await apiClient.get<SeniorityDistribution[]>(BACKEND_ROUTES.SENIORITY_DISTRIBUTION);
      return response.data || [];
    } catch (error) {
      console.error("DashboardRepository.getSeniorityDistributionLegal failed:", error);
      return [];
    }
  }
}
