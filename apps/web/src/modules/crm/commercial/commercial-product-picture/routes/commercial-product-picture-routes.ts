import { COMMERCIAL_PRODUCT_PICTURE_CONSTANTS } from "../constants/commercial-product-picture-constants";

export const COMMERCIAL_PRODUCT_PICTURE_ROUTES = {
  LIST: (commercialProductId: string) => `${COMMERCIAL_PRODUCT_PICTURE_CONSTANTS.ROUTES.COMMERCIAL_PRODUCT_PICTURE}/${commercialProductId}` as const,
};
