import { COLLABORATOR_CONSTANTS } from "../constants/collaborator-constants";

export const COLLABORATOR_ROUTES = {
  LIST: (commercialProductId: string | number) => `${COLLABORATOR_CONSTANTS.ROUTES.COLLABORATOR}?commercialProductId=${commercialProductId}` as const,
  CREATE: (commercialProductId: string | number) => `${COLLABORATOR_CONSTANTS.ROUTES.COLLABORATOR_NEW}?commercialProductId=${commercialProductId}` as const,
  EDIT: (id: string | number, commercialProductId: string | number) => `${COLLABORATOR_CONSTANTS.ROUTES.COLLABORATOR}/edit/${id}?commercialProductId=${commercialProductId}` as const,
};

export const COLLABORATOR_API_ROUTES = {
  COLLABORATOR: '/v1/collaborators',
  COLLABORATOR_BY_COMMERCIAL_PRODUCT_ID: (id: string | number) => `/v1/commercial-products/${id}/collaborators`,
  COLLABORATOR_UPDATE: (id: string | number) => `/v1/collaborators/${id}`,
  COLLABORATOR_DELETE: (id: string | number) => `/v1/collaborators/${id}`,
  COLLABORATOR_BY_ID: (id: string | number) => `/v1/collaborators/${id}`,
};
