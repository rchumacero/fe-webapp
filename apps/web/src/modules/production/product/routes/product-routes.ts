import { PRODUCT_CONSTANTS } from "../constants/product-constants";

export const PRODUCT_ROUTES = {
  LIST: PRODUCT_CONSTANTS.ROUTES.PRODUCT,
  CREATE: (personId: string | number) => `${PRODUCT_CONSTANTS.ROUTES.PRODUCT_NEW}?personId=${personId}` as const,
  EDIT: (id: string | number, personId: string | number) => `${PRODUCT_CONSTANTS.ROUTES.PRODUCT}/edit/${id}?personId=${personId}` as const,
};

// Backend Endpoints
export const PRODUCT_API_ROUTES = {
  PRODUCT: '/v1/product',
  PRODUCT_UPDATE: (id: string | number) => `/v1/product/${id}`,
  PRODUCT_DELETE: (id: string | number) => `/v1/product/${id}`,
  PRODUCT_BY_ID: (id: string | number) => `/v1/product/${id}`,
};
