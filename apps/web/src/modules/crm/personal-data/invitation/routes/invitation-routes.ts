import { INVITATION_CONSTANTS } from "../constants/invitation-constants";

export const INVITATION_ROUTES = {
  LIST: INVITATION_CONSTANTS.ROUTES.INVITATION,
  CREATE: (personId: string | number) => `${INVITATION_CONSTANTS.ROUTES.INVITATION_NEW}?personId=${personId}` as const,
  EDIT: (id: string | number, personId: string | number) => `${INVITATION_CONSTANTS.ROUTES.INVITATION}/edit/${id}?personId=${personId}` as const,
  DETAIL: (id: string | number, personId: string | number) => `${INVITATION_CONSTANTS.ROUTES.INVITATION}/detail/${id}?personId=${personId}` as const,
};

// Backend Endpoints
export const INVITATION_API_ROUTES = {
  INVITATION: '/v1/invitations',
  INVITATION_UPDATE: (id: string | number) => `/v1/invitations/${id}`,
  INVITATION_DELETE: (id: string | number) => `/v1/invitations/${id}`,
  INVITATION_BY_ID: (id: string | number) => `/v1/invitations/${id}`,
  INVITATION_BY_PERSON_ID: (personId: string | number) => `/v1/persons/${personId}/invitations`,
};
