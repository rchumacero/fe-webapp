import { Form, CreateFormDto, UpdateFormDto } from "../entities/Form";

export interface IFormRepository {
  getAll(): Promise<Form[]>;
  getById(id: string): Promise<Form>;
  create(data: CreateFormDto): Promise<Form>;
  update(data: UpdateFormDto): Promise<Form>;
  delete(id: string): Promise<void>;
}
