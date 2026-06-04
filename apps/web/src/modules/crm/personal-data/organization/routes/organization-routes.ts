import { ORGANIZATION_CONSTANTS } from "../constants/organization-constants";

export const ORGANIZATION_ROUTES = {
  LIST: (personId: string | number) => `${ORGANIZATION_CONSTANTS.ROUTES.ORGANIZATION}?personId=${personId}` as const,
  CREATE: (personId: string | number) => `${ORGANIZATION_CONSTANTS.ROUTES.ORGANIZATION}/new?personId=${personId}` as const,
  EDIT: (id: string | number, personId: string | number) => `${ORGANIZATION_CONSTANTS.ROUTES.ORGANIZATION}/edit/${id}?personId=${personId}` as const,
  TREE: (personId: string | number) => `${ORGANIZATION_CONSTANTS.ROUTES.ORGANIZATION}/tree?personId=${personId}` as const,
};

// Backend Endpoints
export const ORGANIZATION_API_ROUTES = {
  ORGANIZATION: '/v1/organizations',
  ORGANIZATION_UPDATE: (id: string | number) => `/v1/organizations/${id}`,
  ORGANIZATION_DELETE: (id: string | number) => `/v1/organizations/${id}`,
  ORGANIZATION_BY_ID: (id: string | number) => `/v1/organizations/${id}`,
  ORGANIZATION_BY_PERSON_ID: (personId: string | number) => `/v1/persons/${personId}/organizations`,
};
