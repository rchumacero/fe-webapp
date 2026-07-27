export interface OperationOrder {
  id: string;
  vendorCode: string;
  customerCode: string;
  orderDate: string;
  deliveryDate?: string;
  status: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface CreateOperationOrderDto {
  vendorCode: string;
  customerCode: string;
  orderDate: string;
  deliveryDate?: string;
  status?: string;
}

export interface UpdateOperationOrderDto extends Partial<CreateOperationOrderDto> {
  id: string;
}
