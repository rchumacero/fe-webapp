import { DomainParameter } from "@kplian/core";

export const P_STATUS = 'GEN/MAIN/STA';
export const P_UNIT_MEASURE = 'GEN/MAIN/MEA';
export const P_ITEM_CODE = 'WAR/MAIN/ITEM';

export const CAMPAIGN_PRODUCT_DOMAIN_PARAMETERS: DomainParameter[] = [
  {
    fullCode: P_STATUS,
    vendorCode: ''
  },
  {
    fullCode: P_UNIT_MEASURE,
    vendorCode: ''
  },
  {
    fullCode: P_ITEM_CODE,
    vendorCode: ''
  }
];