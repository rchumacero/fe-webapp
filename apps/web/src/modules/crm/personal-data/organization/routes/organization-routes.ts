import { ORGANIZATION_CONSTANTS } from "../constants/organization-constants";

export const ORGANIZATION_ROUTES = {
  LIST: ORGANIZATION_CONSTANTS.ROUTES.ORGANIZATION,
  CREATE: (personId: string | number) => `${ORGANIZATION_CONSTANTS.ROUTES.ORGANIZATION_NEW}?personId=${personId}` as const,
  EDIT: (id: string | number, personId: string | number) => `${ORGANIZATION_CONSTANTS.ROUTES.ORGANIZATION}/edit/${id}?personId=${personId}` as const,
};

// Backend Endpoints
export const ORGANIZATION_API_ROUTES = {
  ORGANIZATION: '/v1/organizations',
  ORGANIZATION_UPDATE: (id: string | number) => `/v1/organizations/${id}`,
  ORGANIZATION_DELETE: (id: string | number) => `/v1/organizations/${id}`,
  ORGANIZATION_BY_ID: (id: string | number) => `/v1/organizations/${id}`,
  ORGANIZATION_BY_PERSON_ID: (personId: string | number) => `/v1/persons/${personId}/organizations`,
};
