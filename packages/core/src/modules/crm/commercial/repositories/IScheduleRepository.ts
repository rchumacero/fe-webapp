import { 
  Schedule, 
  CreateScheduleDto, 
  UpdateScheduleDto 
} from "../entities/Schedule";

export interface IScheduleRepository {
  getAll(): Promise<Schedule[]>;
  getByCommercialProductId(commercialProductId: string): Promise<Schedule[]>;
  getByCollaboratorId(collaboratorId: string): Promise<Schedule[]>;
  getById(id: string): Promise<Schedule>;
  create(data: CreateScheduleDto): Promise<Schedule>;
  update(data: UpdateScheduleDto): Promise<Schedule>;
  delete(id: string): Promise<void>;
  transitionNext(scheduleId: string): Promise<any>;
}
