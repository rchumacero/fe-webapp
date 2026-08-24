import { CASE_CONSTANTS } from "../constants/case-constants";
import { CASE_API_ROUTES } from "@kplian/infrastructure";

export const CASE_ROUTES = {
  LIST: () => `${CASE_CONSTANTS.ROUTES.CASE}` as const,
  CREATE: () => `${CASE_CONSTANTS.ROUTES.CASE_NEW}` as const,
  EDIT: (id: string | number) => `${CASE_CONSTANTS.ROUTES.CASE}/edit/${id}` as const,
};

export { CASE_API_ROUTES };
