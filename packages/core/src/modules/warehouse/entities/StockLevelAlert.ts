export interface StockLevelAlert {
  id: string;
  stockLevelId: string;
  minQuantity?: number;
  maxQuantity?: number;
  type?: string;
  notificationCode?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  status?: string;
}

export interface CreateStockLevelAlertDto {
  stockLevelId: string;
  minQuantity?: number;
  maxQuantity?: number;
  type?: string;
  notificationCode?: string;
}

export interface UpdateStockLevelAlertDto extends Partial<CreateStockLevelAlertDto> {
  id: string;
}
