import { VALUE_CONSTANTS } from "../constants/value-constants";
import { VALUE_API_ROUTES } from "@kplian/infrastructure";

export const VALUE_ROUTES = {
  LIST: () => `${VALUE_CONSTANTS.ROUTES.VALUE}` as const,
  CREATE: () => `${VALUE_CONSTANTS.ROUTES.VALUE_NEW}` as const,
  EDIT: (id: string | number) => `${VALUE_CONSTANTS.ROUTES.VALUE}/edit/${id}` as const,
};

export { VALUE_API_ROUTES };
