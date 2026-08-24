import { COMMERCIAL_PRODUCT_PRICE_CONSTANTS } from "../constants/commercial-product-price-constants";

export const COMMERCIAL_PRODUCT_PRICE_ROUTES = {
  LIST: (campaignId: string) => `${COMMERCIAL_PRODUCT_PRICE_CONSTANTS.ROUTES.COMMERCIAL_PRODUCT_PRICE}/${campaignId}` as const,
};
