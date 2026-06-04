import { Field, CreateFieldDto, UpdateFieldDto } from "../entities/Field";

export interface IFieldRepository {
  getAll(): Promise<Field[]>;
  getById(id: string): Promise<Field>;
  getByFormId(formId: string): Promise<Field[]>;
  create(data: CreateFieldDto): Promise<Field>;
  update(data: UpdateFieldDto): Promise<Field>;
  delete(id: string): Promise<void>;
}
