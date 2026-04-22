export const CAMPAIGN_ROUTES = {
  LIST: "/admin/crm/commercial/campaign",
  CREATE: "/admin/crm/commercial/campaign/create",
  EDIT: (id: string | number) => `/admin/crm/commercial/campaign/edit/${id}` as const,
  DETAIL: (id: string | number) => `/admin/crm/commercial/campaign/${id}` as const,
};
