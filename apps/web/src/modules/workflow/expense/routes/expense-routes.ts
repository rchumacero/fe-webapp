import { EXPENSE_CONSTANTS } from "../constants/expense-constants";
import { EXPENSE_API_ROUTES } from "@kplian/infrastructure";

export const EXPENSE_ROUTES = {
  LIST: () => `${EXPENSE_CONSTANTS.ROUTES.EXPENSE}` as const,
  CREATE: () => `${EXPENSE_CONSTANTS.ROUTES.EXPENSE_NEW}` as const,
  EDIT: (id: string | number) => `${EXPENSE_CONSTANTS.ROUTES.EXPENSE}/edit/${id}` as const,
};

export { EXPENSE_API_ROUTES };
