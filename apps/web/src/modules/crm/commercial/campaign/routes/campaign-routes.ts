import { CAMPAIGN_CONSTANTS } from "../constants/campaign-constants";

export const CAMPAIGN_ROUTES = {
  LIST: CAMPAIGN_CONSTANTS.ROUTES.CAMPAIGN,
  CREATE: CAMPAIGN_CONSTANTS.ROUTES.CAMPAIGN_NEW,
  EDIT: (id: string | number) => `${CAMPAIGN_CONSTANTS.ROUTES.CAMPAIGN}/edit/${id}` as const,
  DETAIL: (id: string | number) => `${CAMPAIGN_CONSTANTS.ROUTES.CAMPAIGN}/detail/${id}` as const,
};
