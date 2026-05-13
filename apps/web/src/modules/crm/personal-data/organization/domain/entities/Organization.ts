export interface Organization {
  id: string;
  personId: string; // links to person of type 'company'
  code: string;
  name: string;
  address: string | null; // JSON: avenue, street, number, position coordinates
  organizationId: string | null; // self-referencing for hierarchical structures
  maxAttentionSchedule: number | null; //1 para citas medicas por ejemplo, y n para cajas
  ticketMethodCode: string | null; //FIFO, SCH schedule, ...
  ticketCounter: number | null; //Contador de tickets, deberia ser reiniciado cada dia
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;


}

export interface CreateOrganizationDto {
  personId: string; // links to person of type 'company'
  code: string;
  name: string;
  address: string | null; // JSON: avenue, street, number, position coordinates
  organizationId: string | null; // self-referencing for hierarchical structures
  maxAttentionSchedule: number | null; //1 para citas medicas por ejemplo, y n para cajas
  ticketMethodCode: string | null; //FIFO, SCH schedule, ...
  ticketCounter: number | null; //Contador de tickets, deberia ser reiniciado cada dia
}

export interface UpdateOrganizationDto extends CreateOrganizationDto {
  id: string;
}
