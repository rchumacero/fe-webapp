import { PERSON_CONSTANTS } from "../constants/person-constants";

export const PERSON_ROUTES = {
  LIST: PERSON_CONSTANTS.ROUTES.PERSON,
  CREATE: PERSON_CONSTANTS.ROUTES.PERSON_NEW,
  EDIT: (id: string | number) => `${PERSON_CONSTANTS.ROUTES.PERSON}/edit/${id}` as const,
  DETAIL: (id: string | number) => `${PERSON_CONSTANTS.ROUTES.PERSON}/detail/${id}` as const,
};
