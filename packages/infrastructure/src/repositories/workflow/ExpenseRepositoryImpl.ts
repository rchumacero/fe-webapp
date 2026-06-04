import { createApiClient } from "../../api/client";
import { Expense, CreateExpenseDto, UpdateExpenseDto, IExpenseRepository } from "@kplian/core";

export const EXPENSE_API_ROUTES = {
  EXPENSES: '/v1/expenses',
  EXPENSE_BY_ID: (id: string) => `/v1/expenses/${id}`,
  EXPENSE_UPDATE: (id: string) => `/v1/expenses/${id}`,
  EXPENSE_DELETE: (id: string) => `/v1/expenses/${id}`,
  EXPENSES_BY_CASE_ID: (caseId: string) => `/v1/cases/${caseId}/expenses`,
};

export class ExpenseRepositoryImpl implements IExpenseRepository {
  private api = createApiClient('workflow');

  async getAll(): Promise<Expense[]> {
    const response = await this.api.get<Expense[]>(EXPENSE_API_ROUTES.EXPENSES);
    return response.data || [];
  }

  async getById(id: string): Promise<Expense> {
    const response = await this.api.get<Expense>(EXPENSE_API_ROUTES.EXPENSE_BY_ID(id));
    return response.data;
  }

  async getByCaseId(caseId: string): Promise<Expense[]> {
    const response = await this.api.get<Expense[]>(EXPENSE_API_ROUTES.EXPENSES_BY_CASE_ID(caseId));
    return response.data || [];
  }

  async create(data: CreateExpenseDto): Promise<Expense> {
    const response = await this.api.post<Expense>(EXPENSE_API_ROUTES.EXPENSES, data);
    return response.data;
  }

  async update(data: UpdateExpenseDto): Promise<Expense> {
    const response = await this.api.put<Expense>(EXPENSE_API_ROUTES.EXPENSE_UPDATE(data.id), data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(EXPENSE_API_ROUTES.EXPENSE_DELETE(id));
  }
}
