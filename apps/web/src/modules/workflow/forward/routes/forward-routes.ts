import { FORWARD_CONSTANTS } from "../constants/forward-constants";
import { FORWARD_API_ROUTES } from "@kplian/infrastructure";

export const FORWARD_ROUTES = {
  LIST: () => `${FORWARD_CONSTANTS.ROUTES.FORWARD}` as const,
  CREATE: () => `${FORWARD_CONSTANTS.ROUTES.FORWARD_NEW}` as const,
  EDIT: (id: string | number) => `${FORWARD_CONSTANTS.ROUTES.FORWARD}/edit/${id}` as const,
};

export { FORWARD_API_ROUTES };
