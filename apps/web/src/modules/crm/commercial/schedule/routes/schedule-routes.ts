import { SCHEDULE_CONSTANTS } from "../constants/schedule";

export const SCHEDULE_ROUTES = {
  LIST: SCHEDULE_CONSTANTS.ROUTES.SCHEDULE,
  CREATE: (personId: string | number) => `${SCHEDULE_CONSTANTS.ROUTES.SCHEDULE_NEW}?personId=${personId}` as const,
  EDIT: (id: string | number, personId: string | number) => `${SCHEDULE_CONSTANTS.ROUTES.SCHEDULE}/edit/${id}?personId=${personId}` as const,
};

export const SCHEDULE_API_ROUTES = {
  SCHEDULE: '/v1/commercial/schedules',
  SCHEDULE_UPDATE: (id: string | number) => `/v1/commercial/schedules/${id}`,
  SCHEDULE_DELETE: (id: string | number) => `/v1/commercial/schedules/${id}`,
  SCHEDULE_BY_ID: (id: string | number) => `/v1/commercial/schedules/${id}`,
};
