import { PROCESS_CONSTANTS } from "../constants/process-constants";
import { PROCESS_API_ROUTES } from "@kplian/infrastructure";

export const PROCESS_ROUTES = {
  LIST: () => `${PROCESS_CONSTANTS.ROUTES.FORM}` as const,
  CREATE: () => `${PROCESS_CONSTANTS.ROUTES.FORM_NEW}` as const,
  EDIT: (id: string | number) => `${PROCESS_CONSTANTS.ROUTES.FORM}/edit/${id}` as const,
};

export { PROCESS_API_ROUTES };
