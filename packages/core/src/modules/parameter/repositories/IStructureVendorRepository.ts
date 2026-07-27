import { StructureVendor, CreateStructureVendorDto, UpdateStructureVendorDto } from "../entities/StructureVendor";

export interface IStructureVendorRepository {
  getAll(): Promise<StructureVendor[]>;
  getById(id: number): Promise<StructureVendor>;
  getByStructureId(structureId: number | string): Promise<StructureVendor[]>;
  create(data: CreateStructureVendorDto): Promise<StructureVendor[]>;
  update(data: UpdateStructureVendorDto): Promise<StructureVendor>;
  delete(id: number | string): Promise<void>;
}
