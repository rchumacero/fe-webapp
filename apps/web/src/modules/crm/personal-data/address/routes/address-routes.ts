export const ADDRESS_ROUTES = {
  LIST: (personId: string | number) => `/crm/person/detail/${personId}`,
  CREATE: (personId: string | number) => `/crm/address/new?personId=${personId}` as const,
  EDIT: (id: string | number, personId: string | number) => `/crm/address/edit/${id}?personId=${personId}` as const,
};
