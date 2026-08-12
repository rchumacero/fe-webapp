export interface MovementReportFilterDto {
  startDate?: string;
  endDate?: string;
  warehouseId?: string;
  itemCode?: string;
}

export interface MovementReportItem {
  warehouseCode: string;
  warehouseName: string;
  costMethodCode: string;
  itemCode: string;
  movementDate: string;
  movementCode: string;
  inbound: number;
  outbound: number;
  available: number;
  balance: number;
  unitCost: number;
  inboundValue: number;
  outboundValue: number;
  balanceCost: number;
}
