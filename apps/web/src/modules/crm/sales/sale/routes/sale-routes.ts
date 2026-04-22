export const SALE_ROUTES = {
  LIST: "/admin/crm/sales/sale",
  CREATE: "/admin/crm/sales/sale/create",
  EDIT: (id: string | number) => `/admin/crm/sales/sale/edit/${id}` as const,
  DETAIL: (id: string | number) => `/admin/crm/sales/sale/${id}` as const,
};
