import { CAMPAIGN_PRODUCT_CONSTANTS } from "../constants/campaign-product-constants";

export const CAMPAIGN_PRODUCT_ROUTES = {
  LIST: (commercialProductId: string) => `${CAMPAIGN_PRODUCT_CONSTANTS.ROUTES.CAMPAIGN_PRODUCT}/${commercialProductId}` as const,
  CREATE: (commercialProductId: string) => `${CAMPAIGN_PRODUCT_CONSTANTS.ROUTES.CAMPAIGN_PRODUCT}/${commercialProductId}/new` as const,
  EDIT: (commercialProductId: string, id: string) => `${CAMPAIGN_PRODUCT_CONSTANTS.ROUTES.CAMPAIGN_PRODUCT}/${commercialProductId}/edit/${id}` as const,
};

// Backend Endpoints
export const CAMPAIGN_PRODUCT_API_ROUTES = {
  CAMPAIGN_PRODUCT: '/v1/campaign-products',
  CAMPAIGN_PRODUCT_BY_COMMERCIAL_PRODUCT_ID: (commercialProductId: string | number) => `/v1/commercial-products/${commercialProductId}/campaign-products/`,
  CAMPAIGN_PRODUCT_UPDATE: (id: string | number) => `/v1/campaign-products/${id}`,
  CAMPAIGN_PRODUCT_DELETE: (id: string | number) => `/v1/campaign-products/${id}`,
  CAMPAIGN_PRODUCT_BY_ID: (id: string | number) => `/v1/campaign-products/${id}`,
};
