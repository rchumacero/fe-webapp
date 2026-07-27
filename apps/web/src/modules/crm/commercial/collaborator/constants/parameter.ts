import { DomainParameter } from "@kplian/core";

export const P_STATUS = 'GEN/MAIN/STA';
export const P_CURRENCY = 'FIN/CUR/CUR';
export const P_UNIT_MEASURE = 'GEN/MAIN/TMEA';

export const COLLABORATOR_DOMAIN_PARAMETERS: DomainParameter[] = [
  {
    fullCode: P_STATUS,
    vendorCode: ''
  },
  {
    fullCode: P_CURRENCY,
    vendorCode: ''
  },
  {
    fullCode: P_UNIT_MEASURE,
    vendorCode: ''
  }
];
