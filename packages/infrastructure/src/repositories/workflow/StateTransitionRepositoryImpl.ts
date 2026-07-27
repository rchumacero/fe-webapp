import { createApiClient } from "../../api/client";
import { StateTransition, CreateStateTransitionDto, UpdateStateTransitionDto, IStateTransitionRepository } from "@kplian/core";

export const STATE_TRANSITION_API_ROUTES = {
  STATE_TRANSITIONS: '/v1/state-transitions',
  STATE_TRANSITION_BY_ID: (id: string) => `/v1/state-transitions/${id}`,
  STATE_TRANSITION_UPDATE: (id: string) => `/v1/state-transitions/${id}`,
  STATE_TRANSITION_DELETE: (id: string) => `/v1/state-transitions/${id}`,
};

export class StateTransitionRepositoryImpl implements IStateTransitionRepository {
  private api = createApiClient('workflow');

  async getAll(): Promise<StateTransition[]> {
    const response = await this.api.get<StateTransition[]>(STATE_TRANSITION_API_ROUTES.STATE_TRANSITIONS);
    return response.data || [];
  }

  async getById(id: string): Promise<StateTransition> {
    const response = await this.api.get<StateTransition>(STATE_TRANSITION_API_ROUTES.STATE_TRANSITION_BY_ID(id));
    return response.data;
  }

  async create(data: CreateStateTransitionDto): Promise<StateTransition> {
    const response = await this.api.post<StateTransition>(STATE_TRANSITION_API_ROUTES.STATE_TRANSITIONS, data);
    return response.data;
  }

  async update(data: UpdateStateTransitionDto): Promise<StateTransition> {
    const response = await this.api.put<StateTransition>(STATE_TRANSITION_API_ROUTES.STATE_TRANSITION_UPDATE(data.id), data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(STATE_TRANSITION_API_ROUTES.STATE_TRANSITION_DELETE(id));
  }
}
