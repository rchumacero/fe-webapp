import { COMMUNICATION_CHANNEL_CONSTANTS } from "../constants/communication-channel-constants";

export const COMMUNICATION_CHANNEL_ROUTES = {
  LIST: COMMUNICATION_CHANNEL_CONSTANTS.ROUTES.COMMUNICATION_CHANNEL,
  CREATE: (personId: string | number) => `${COMMUNICATION_CHANNEL_CONSTANTS.ROUTES.COMMUNICATION_CHANNEL_NEW}?personId=${personId}` as const,
  EDIT: (id: string | number, personId: string | number) => `${COMMUNICATION_CHANNEL_CONSTANTS.ROUTES.COMMUNICATION_CHANNEL}/edit/${id}?personId=${personId}` as const,
};

// Backend Endpoints
export const COMMUNICATION_CHANNEL_API_ROUTES = {
    COMMUNICATION_CHANNEL: '/v1/communication-channels',
    COMMUNICATION_CHANNEL_UPDATE: (id: string | number) => `/v1/communication-channels/${id}`,
    COMMUNICATION_CHANNEL_DELETE: (id: string | number) => `/v1/communication-channels/${id}`,
    COMMUNICATION_CHANNEL_BY_ID: (id: string | number) => `/v1/communication-channels/${id}`,
    COMMUNICATION_CHANNEL_BY_PERSON_ID: (personId: string | number) => `/v1/persons/${personId}/communication-channels`,
};
