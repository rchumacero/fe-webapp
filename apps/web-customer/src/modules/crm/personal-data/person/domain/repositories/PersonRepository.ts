import { Person, CreatePersonDto, UpdatePersonDto } from "../entities/Person";

export interface PersonRepository {
  getByCreator(username: string, params?: { 
    page: number; 
    pageSize: number; 
    filter?: string;
  }): Promise<Person[]>;
  getByVendorId(vendorId: string, params?: { 
    page: number; 
    pageSize: number; 
    filter?: string;
  }): Promise<Person[]>;
  getById(id: string): Promise<Person>;
  create(person: CreatePersonDto): Promise<Person>;
  update(person: UpdatePersonDto): Promise<Person>;
  delete(id: string): Promise<void>;
}
