import { DIGITAL_CONTENT_CONSTANTS } from "../constants/digital-content-constants";
import { TASK_DIGITAL_CONTENT_API_ROUTES } from "@kplian/infrastructure";

export const DIGITAL_CONTENT_ROUTES = {
  LIST: () => `${DIGITAL_CONTENT_CONSTANTS.ROUTES.DIGITAL_CONTENT}` as const,
  CREATE: () => `${DIGITAL_CONTENT_CONSTANTS.ROUTES.DIGITAL_CONTENT_NEW}` as const,
  EDIT: (id: string | number) => `${DIGITAL_CONTENT_CONSTANTS.ROUTES.DIGITAL_CONTENT}/edit/${id}` as const,
};

export { TASK_DIGITAL_CONTENT_API_ROUTES };
