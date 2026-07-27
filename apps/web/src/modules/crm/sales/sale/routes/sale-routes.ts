export const SALE_ROUTES = {
  LIST: "/crm/sales",
  CREATE: "/crm/sales/new",
  EDIT: (id: string | number) => `/crm/sales/edit/${id}` as const,
  DETAIL: (id: string | number) => `/crm/sales/${id}` as const,
};
