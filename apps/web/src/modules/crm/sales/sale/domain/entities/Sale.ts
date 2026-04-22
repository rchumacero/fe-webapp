export interface Sale {
  id: string;
  personId: string;
  campaignId?: string;
  amount: number;
  date: string;
  status: 'pending' | 'paid' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'transfer';
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaleDto {
  personId: string;
  campaignId?: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
}

export interface UpdateSaleDto extends Partial<CreateSaleDto> {
  id: string;
}
