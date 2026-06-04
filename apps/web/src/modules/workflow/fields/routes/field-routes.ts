import { FIELD_CONSTANTS } from "../constants/field-constants";
import { FIELD_API_ROUTES } from "@kplian/infrastructure";

export const FIELD_ROUTES = {
  LIST: () => `${FIELD_CONSTANTS.ROUTES.FIELD}` as const,
  CREATE: () => `${FIELD_CONSTANTS.ROUTES.FIELD_NEW}` as const,
  EDIT: (id: string | number) => `${FIELD_CONSTANTS.ROUTES.FIELD}/edit/${id}` as const,
};

export { FIELD_API_ROUTES };
