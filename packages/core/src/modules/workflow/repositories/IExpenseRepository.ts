import { Expense, CreateExpenseDto, UpdateExpenseDto } from "../entities/Expense";

export interface IExpenseRepository {
  getAll(): Promise<Expense[]>;
  getById(id: string): Promise<Expense>;
  getByCaseId(caseId: string): Promise<Expense[]>;
  create(data: CreateExpenseDto): Promise<Expense>;
  update(data: UpdateExpenseDto): Promise<Expense>;
  delete(id: string): Promise<void>;
}
