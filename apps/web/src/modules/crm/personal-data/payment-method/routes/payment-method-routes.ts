import { PAYMENT_METHOD_CONSTANTS } from "../constants/payment-method-constants";

export const PAYMENT_METHOD_ROUTES = {
  LIST: PAYMENT_METHOD_CONSTANTS.ROUTES.PAYMENT_METHOD,
  CREATE: (personId: string | number) => `${PAYMENT_METHOD_CONSTANTS.ROUTES.PAYMENT_METHOD_NEW}?personId=${personId}` as const,
  EDIT: (id: string | number, personId: string | number) => `${PAYMENT_METHOD_CONSTANTS.ROUTES.PAYMENT_METHOD}/edit/${id}?personId=${personId}` as const,
};

// Backend Endpoints
export const PAYMENT_METHOD_API_ROUTES = {
    PAYMENT_METHOD: '/v1/payment-methods',
    PAYMENT_METHOD_UPDATE: (id: string | number) => `/v1/payment-methods/${id}`,
    PAYMENT_METHOD_DELETE: (id: string | number) => `/v1/payment-methods/${id}`,
    PAYMENT_METHOD_BY_ID: (id: string | number) => `/v1/payment-methods/${id}`,
    PAYMENT_METHOD_BY_PERSON_ID: (personId: string | number) => `/v1/persons/${personId}/payment-methods`,
};
