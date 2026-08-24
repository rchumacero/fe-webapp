import { PERSON_SKILL_CONSTANTS } from "../constants/person-skill-constants";

export const PERSON_SKILL_ROUTES = {
  LIST: PERSON_SKILL_CONSTANTS.ROUTES.PERSON_SKILL,
  CREATE: (personId: string | number) => `${PERSON_SKILL_CONSTANTS.ROUTES.PERSON_SKILL_NEW}?personId=${personId}` as const,
  EDIT: (id: string | number, personId: string | number) => `${PERSON_SKILL_CONSTANTS.ROUTES.PERSON_SKILL}/edit/${id}?personId=${personId}` as const,
};

// Backend Endpoints
export const PERSON_SKILL_API_ROUTES = {
    PERSON_SKILL: '/v1/person-skills',
    PERSON_SKILL_UPDATE: (id: string | number) => `/v1/person-skills/${id}`,
    PERSON_SKILL_DELETE: (id: string | number) => `/v1/person-skills/${id}`,
    PERSON_SKILL_BY_ID: (id: string | number) => `/v1/person-skills/${id}`,
    PERSON_SKILL_BY_PERSON_ID: (personId: string | number) => `/v1/persons/${personId}/skills`,
};
