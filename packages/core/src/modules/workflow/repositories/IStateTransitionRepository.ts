import { StateTransition, CreateStateTransitionDto, UpdateStateTransitionDto } from "../entities/StateTransition";

export interface IStateTransitionRepository {
  getAll(): Promise<StateTransition[]>;
  getById(id: string): Promise<StateTransition>;
  create(data: CreateStateTransitionDto): Promise<StateTransition>;
  update(data: UpdateStateTransitionDto): Promise<StateTransition>;
  delete(id: string): Promise<void>;
}
