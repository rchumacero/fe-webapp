import { ECONOMIC_ACTIVITY_CONSTANTS } from "../constants/economic-activity-constants";

export const ECONOMIC_ACTIVITY_ROUTES = {
  LIST: ECONOMIC_ACTIVITY_CONSTANTS.ROUTES.ECONOMIC_ACTIVITY,
  CREATE: (personId: string | number) => `${ECONOMIC_ACTIVITY_CONSTANTS.ROUTES.ECONOMIC_ACTIVITY_NEW}?personId=${personId}` as const,
  EDIT: (id: string | number, personId: string | number) => `${ECONOMIC_ACTIVITY_CONSTANTS.ROUTES.ECONOMIC_ACTIVITY}/edit/${id}?personId=${personId}` as const,
};

// Backend Endpoints
export const ECONOMIC_ACTIVITY_API_ROUTES = {
    ECONOMIC_ACTIVITY: '/v1/economic-activities',
    ECONOMIC_ACTIVITY_UPDATE: (id: string | number) => `/v1/economic-activities/${id}`,
    ECONOMIC_ACTIVITY_DELETE: (id: string | number) => `/v1/economic-activities/${id}`,
    ECONOMIC_ACTIVITY_BY_ID: (id: string | number) => `/v1/economic-activities/${id}`,
    ECONOMIC_ACTIVITY_BY_PERSON_ID: (personId: string | number) => `/v1/persons/${personId}/economic-activities`,
};
