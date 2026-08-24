import { FORM_CONSTANTS } from "../constants/form-constants";
import { FORM_API_ROUTES } from "@kplian/infrastructure";

export const FORM_ROUTES = {
  LIST: (processId: string) => `${FORM_CONSTANTS.ROUTES.FORM}/${processId}` as const,
  CREATE: (processId: string) => `${FORM_CONSTANTS.ROUTES.FORM}/${processId}/new` as const,
  EDIT: (processId: string, id: string | number) => `${FORM_CONSTANTS.ROUTES.FORM}/${processId}/edit/${id}` as const,
};

export { FORM_API_ROUTES };
