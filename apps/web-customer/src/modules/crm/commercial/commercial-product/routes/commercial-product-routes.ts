import { COMMERCIAL_PRODUCT_CONSTANTS } from "../constants/commercial-product-constants";

export const COMMERCIAL_PRODUCT_ROUTES = {
  LIST: (campaignId: string) => `${COMMERCIAL_PRODUCT_CONSTANTS.ROUTES.COMMERCIAL_PRODUCT}/${campaignId}` as const,
  CREATE: (campaignId: string) => `${COMMERCIAL_PRODUCT_CONSTANTS.ROUTES.COMMERCIAL_PRODUCT}/${campaignId}/new` as const,
  EDIT: (campaignId: string, id: string) => `${COMMERCIAL_PRODUCT_CONSTANTS.ROUTES.COMMERCIAL_PRODUCT}/${campaignId}/edit/${id}` as const,
};

// Backend Endpoints
export const COMMERCIAL_PRODUCT_API_ROUTES = {
  COMMERCIAL_PRODUCT: '/v1/commercial-products',
  COMMERCIAL_PRODUCT_BY_CAMPAIGN: (campaignId: string | number) => `/v1/campaigns/${campaignId}/commercial-products`,
  COMMERCIAL_PRODUCT_UPDATE: (id: string | number) => `/v1/commercial-products/${id}`,
  COMMERCIAL_PRODUCT_DELETE: (id: string | number) => `/v1/commercial-products/${id}`,
  COMMERCIAL_PRODUCT_BY_ID: (id: string | number) => `/v1/commercial-products/${id}`,
};
