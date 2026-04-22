import { WORK_EXPERIENCE_CONSTANTS } from "../constants/work-experience-constants";

export const WORK_EXPERIENCE_ROUTES = {
  LIST: WORK_EXPERIENCE_CONSTANTS.ROUTES.WORK_EXPERIENCE,
  CREATE: (personId: string | number) => `${WORK_EXPERIENCE_CONSTANTS.ROUTES.WORK_EXPERIENCE_NEW}?personId=${personId}` as const,
  EDIT: (id: string | number, personId: string | number) => `${WORK_EXPERIENCE_CONSTANTS.ROUTES.WORK_EXPERIENCE}/edit/${id}?personId=${personId}` as const,
};

// Backend Endpoints
export const WORK_EXPERIENCE_API_ROUTES = {
    WORK_EXPERIENCE: '/v1/work-experiences',
    WORK_EXPERIENCE_UPDATE: (id: string | number) => `/v1/work-experiences/${id}`,
    WORK_EXPERIENCE_DELETE: (id: string | number) => `/v1/work-experiences/${id}`,
    WORK_EXPERIENCE_BY_ID: (id: string | number) => `/v1/work-experiences/${id}`,
    WORK_EXPERIENCE_BY_PERSON_ID: (personId: string | number) => `/v1/persons/${personId}/work-experiences`,
};
