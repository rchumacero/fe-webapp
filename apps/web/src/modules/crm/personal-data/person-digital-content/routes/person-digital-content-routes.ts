import { PERSON_DIGITAL_CONTENT_CONSTANTS } from "../constants/person-digital-content-constants";

export const PERSON_DIGITAL_CONTENT_ROUTES = {
  LIST: PERSON_DIGITAL_CONTENT_CONSTANTS.ROUTES.PERSON_DIGITAL_CONTENT,
  CREATE: (personId: string | number) => `${PERSON_DIGITAL_CONTENT_CONSTANTS.ROUTES.PERSON_DIGITAL_CONTENT_NEW}?personId=${personId}` as const,
  EDIT: (id: string | number, personId: string | number) => `${PERSON_DIGITAL_CONTENT_CONSTANTS.ROUTES.PERSON_DIGITAL_CONTENT}/edit/${id}?personId=${personId}` as const,
};

// Backend Endpoints
export const PERSON_DIGITAL_CONTENT_API_ROUTES = {
  PERSON_DIGITAL_CONTENT: '/v1/person-digital-contents',
  PERSON_DIGITAL_CONTENT_UPDATE: (id: string | number) => `/v1/person-digital-contents/${id}`,
  PERSON_DIGITAL_CONTENT_DELETE: (id: string | number) => `/v1/person-digital-contents/${id}`,
  PERSON_DIGITAL_CONTENT_BY_ID: (id: string | number) => `/v1/person-digital-contents/${id}`,
  PERSON_DIGITAL_CONTENT_BY_PERSON_ID: (personId: string | number) => `/v1/persons/${personId}/digital-contents`,
};
