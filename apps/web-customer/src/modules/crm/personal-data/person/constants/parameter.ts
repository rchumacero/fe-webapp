/**
 * Configuration of required parameters for the person domain
 * Each element defines the fullCode of the parameter and the vendorCode if necessary
 */

import { DomainParameter } from "@kplian/core";

export const P_TYPE = 'CRM/GEN/TYP';
export const P_LOCATION = 'GEO/LOC/LOC';
export const P_GENDER = 'TM/POS/GEN';

// Lista tipada
export const PERSON_DOMAIN_PARAMETERS: DomainParameter[] = [
  {
    fullCode: P_TYPE,
    vendorCode: ''
  },
  {
    fullCode: P_LOCATION,
    vendorCode: ''
  },
  {
    fullCode: P_GENDER,
    vendorCode: ''
  }
];