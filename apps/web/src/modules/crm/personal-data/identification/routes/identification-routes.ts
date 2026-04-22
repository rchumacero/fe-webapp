import { IDENTIFICATION_CONSTANTS } from "../constants/identification-constants";

export const IDENTIFICATION_ROUTES = {
  LIST: IDENTIFICATION_CONSTANTS.ROUTES.IDENTIFICATION,
  CREATE: (personId: string | number) => `${IDENTIFICATION_CONSTANTS.ROUTES.IDENTIFICATION_NEW}?personId=${personId}` as const,
  EDIT: (id: string | number, personId: string | number) => `${IDENTIFICATION_CONSTANTS.ROUTES.IDENTIFICATION}/edit/${id}?personId=${personId}` as const,
};

// Backend Endpoints
export const IDENTIFICATION_API_ROUTES = {
    IDENTIFICATION: '/v1/identifications',
    IDENTIFICATION_UPDATE: (id: string | number) => `/v1/identifications/${id}`,
    IDENTIFICATION_DELETE: (id: string | number) => `/v1/identifications/${id}`,
    IDENTIFICATION_BY_ID: (id: string | number) => `/v1/identifications/${id}`,
    IDENTIFICATION_BY_PERSON_ID: (personId: string | number) => `/v1/persons/${personId}/identifications`,
};
