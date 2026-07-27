import { Payment, CreatePaymentDto, UpdatePaymentDto } from "../entities/Payment";

export interface IPaymentRepository {
  getAll(): Promise<Payment[]>;
  getBySaleId(saleId: string): Promise<Payment[]>;
  getById(id: string): Promise<Payment>;
  create(data: CreatePaymentDto): Promise<Payment>;
  update(data: UpdatePaymentDto): Promise<Payment>;
  delete(id: string): Promise<void>;
}
