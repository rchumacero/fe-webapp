import { PROFILE_CONSTANTS } from "../constants/profile-constants";

export const PROFILE_ROUTES = {
  LIST: PROFILE_CONSTANTS.ROUTES.IDENTIFICATION,
  CREATE: (personId: string | number) => `${PROFILE_CONSTANTS.ROUTES.IDENTIFICATION_NEW}?personId=${personId}` as const,
  EDIT: (id: string | number, personId: string | number) => `${PROFILE_CONSTANTS.ROUTES.IDENTIFICATION}/edit/${id}?personId=${personId}` as const,
};

// Backend Endpoints
export const PROFILE_API_ROUTES = {
    PROFILE: '/v1/profiles',
    PROFILE_UPDATE: (id: string | number) => `/v1/profiles/${id}`,
    PROFILE_DELETE: (id: string | number) => `/v1/profiles/${id}`,
    PROFILE_BY_ID: (id: string | number) => `/v1/profiles/${id}`,
};
