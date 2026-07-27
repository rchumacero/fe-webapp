import { WAREHOUSE_CONSTANTS } from "../constants/warehouse-constants";

export const WAREHOUSE_ROUTES = {
  LIST: WAREHOUSE_CONSTANTS.ROUTES.WAREHOUSE,
  CREATE: () => `${WAREHOUSE_CONSTANTS.ROUTES.WAREHOUSE_NEW}` as const,
  EDIT: (id: string | number) => `${WAREHOUSE_CONSTANTS.ROUTES.WAREHOUSE}/edit/${id}` as const,
};
