import { CAMPAIGN_PRODUCT_CONSTANTS } from "../constants/campaign-product-constants";

export const CAMPAIGN_PRODUCT_ROUTES = {
  LIST: CAMPAIGN_PRODUCT_CONSTANTS.ROUTES.CAMPAIGN_PRODUCT,
  CREATE: (personId: string | number) => `${CAMPAIGN_PRODUCT_CONSTANTS.ROUTES.CAMPAIGN_PRODUCT}?personId=${personId}` as const,
  EDIT: (id: string | number, personId: string | number) => `${CAMPAIGN_PRODUCT_CONSTANTS.ROUTES.CAMPAIGN_PRODUCT}/edit/${id}?personId=${personId}` as const,
};

// Backend Endpoints
export const CAMPAIGN_PRODUCT_API_ROUTES = {
  CAMPAIGN_PRODUCT: '/v1/campaign-products',
  CAMPAIGN_PRODUCT_UPDATE: (id: string | number) => `/v1/campaign-products/${id}`,
  CAMPAIGN_PRODUCT_DELETE: (id: string | number) => `/v1/campaign-products/${id}`,
  CAMPAIGN_PRODUCT_BY_ID: (id: string | number) => `/v1/campaign-products/${id}`,
};
