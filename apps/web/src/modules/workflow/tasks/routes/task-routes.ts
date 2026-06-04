import { TASK_CONSTANTS } from "../constants/task-constants";
import { TASK_API_ROUTES } from "@kplian/infrastructure";

export const TASK_ROUTES = {
  LIST: () => `${TASK_CONSTANTS.ROUTES.TASK}` as const,
  CREATE: () => `${TASK_CONSTANTS.ROUTES.TASK_NEW}` as const,
  EDIT: (id: string | number) => `${TASK_CONSTANTS.ROUTES.TASK}/edit/${id}` as const,
};

export { TASK_API_ROUTES };
