import { CONTACT_CONSTANTS } from "../constants/contact-constants";

export const CONTACT_ROUTES = {
  LIST: CONTACT_CONSTANTS.ROUTES.CONTACT,
  CREATE: (personId: string | number) => `${CONTACT_CONSTANTS.ROUTES.CONTACT_NEW}?personId=${personId}` as const,
  EDIT: (id: string | number, personId: string | number) => `${CONTACT_CONSTANTS.ROUTES.CONTACT}/edit/${id}?personId=${personId}` as const,
};

// Backend Endpoints
export const CONTACT_API_ROUTES = {
    CONTACT: '/v1/contacts',
    CONTACT_UPDATE: (id: string | number) => `/v1/contacts/${id}`,
    CONTACT_DELETE: (id: string | number) => `/v1/contacts/${id}`,
    CONTACT_BY_ID: (id: string | number) => `/v1/contacts/${id}`,
    CONTACT_BY_PERSON_ID: (personId: string | number) => `/v1/persons/${personId}/contacts`,
};
