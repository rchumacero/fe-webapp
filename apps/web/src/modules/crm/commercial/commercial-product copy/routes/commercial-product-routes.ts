import { COMMERCIAL_PRODUCT_CONSTANTS } from "../constants/commercial-product-constants";

export const COMMERCIAL_PRODUCT_ROUTES = {
  LIST: COMMERCIAL_PRODUCT_CONSTANTS.ROUTES.COMMERCIAL_PRODUCT,
  CREATE: (personId: string | number) => `${COMMERCIAL_PRODUCT_CONSTANTS.ROUTES.COMMERCIAL_PRODUCT_NEW}?personId=${personId}` as const,
  EDIT: (id: string | number, personId: string | number) => `${COMMERCIAL_PRODUCT_CONSTANTS.ROUTES.COMMERCIAL_PRODUCT}/edit/${id}?personId=${personId}` as const,
};

// Backend Endpoints
export const COMMERCIAL_PRODUCT_API_ROUTES = {
  COMMERCIAL_PRODUCT: '/v1/commercial-products',
  COMMERCIAL_PRODUCT_UPDATE: (id: string | number) => `/v1/commercial-products/${id}`,
  COMMERCIAL_PRODUCT_DELETE: (id: string | number) => `/v1/commercial-products/${id}`,
  COMMERCIAL_PRODUCT_BY_ID: (id: string | number) => `/v1/commercial-products/${id}`,
};
