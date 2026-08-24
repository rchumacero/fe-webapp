import { DomainParameter } from "@kplian/core";

export const P_STATUS = 'CRM/GEN/STA';
export const P_CURRENCY = 'FIN/CUR/CUR';
export const P_CATEGORY = 'CRM/GEN/CAT';

export const CAMPAIGN_DOMAIN_PARAMETERS: DomainParameter[] = [
  {
    fullCode: P_STATUS,
    vendorCode: ''
  },
  {
    fullCode: P_CURRENCY,
    vendorCode: ''
  },
  {
    fullCode: P_CATEGORY,
    vendorCode: ''
  }
];