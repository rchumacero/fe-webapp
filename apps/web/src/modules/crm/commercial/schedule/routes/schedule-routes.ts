import { SCHEDULE_CONSTANTS } from "../constants/schedule-constants";

export const SCHEDULE_ROUTES = {
  LIST: (commercialProductId: string | number) => `${SCHEDULE_CONSTANTS.ROUTES.SCHEDULE}?commercialProductId=${commercialProductId}` as const,
  CREATE: (commercialProductId: string | number) => `${SCHEDULE_CONSTANTS.ROUTES.SCHEDULE_NEW}?commercialProductId=${commercialProductId}` as const,
  EDIT: (id: string | number, commercialProductId: string | number) => `${SCHEDULE_CONSTANTS.ROUTES.SCHEDULE}/edit/${id}?commercialProductId=${commercialProductId}` as const,
};

export const SCHEDULE_API_ROUTES = {
  SCHEDULE: '/v1/schedules',
  SCHEDULE_BY_COMMERCIAL_PRODUCT_ID: (commercialProductId: string | number) => `/v1/commercial-products/${commercialProductId}/schedules/`,
  SCHEDULE_UPDATE: (id: string | number) => `/v1/schedules/${id}`,
  SCHEDULE_DELETE: (id: string | number) => `/v1/schedules/${id}`,
  SCHEDULE_BY_ID: (id: string | number) => `/v1/schedules/${id}`,
};
