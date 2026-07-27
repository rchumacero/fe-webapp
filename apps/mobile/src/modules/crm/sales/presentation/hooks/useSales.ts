import { useState, useCallback, useMemo } from 'react';
import { 
  Sale, 
  CreateSaleDto, 
  SaleDetail, 
  ExtraCharge, 
  Payment,
  CreateSaleDetailDto,
  CreateExtraChargeDto,
  CreatePaymentDto
} from '@kplian/core';
import { 
  SaleRepositoryImpl, 
  SaleDetailRepositoryImpl, 
  ExtraChargeRepositoryImpl, 
  PaymentRepositoryImpl 
} from '@kplian/infrastructure';
import { useVendor } from '../../../../../shared/auth/AuthContext';

const saleRepo = new SaleRepositoryImpl();
const detailRepo = new SaleDetailRepositoryImpl();
const extraChargeRepo = new ExtraChargeRepositoryImpl();
const paymentRepo = new PaymentRepositoryImpl();

export interface SaleDraft {
  customerId: string;
  customerName: string;
  customerDocumentNumber: string;
  saleDate: string;
  status: string;
  paymentMethodCode: string;
  currencyCode: string;
}

export function useSales() {
  const { vendor } = useVendor();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Sale for detail screen
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<SaleDetail[]>([]);
  const [selectedCharges, setSelectedCharges] = useState<ExtraCharge[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<Payment[]>([]);

  const loadSaleRelations = useCallback(async (saleId: string) => {
    setLoading(true);
    try {
      const [detailsData, chargesData, paymentsData] = await Promise.all([
        detailRepo.getBySaleId(saleId),
        extraChargeRepo.getBySaleId(saleId),
        paymentRepo.getBySaleId(saleId),
      ]);
      setSelectedDetails(detailsData);
      setSelectedCharges(chargesData);
      setSelectedPayments(paymentsData);
    } catch (err) {
      console.error('Failed to load sale relations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Unified editor states
  const [saleDraft, setSaleDraft] = useState<SaleDraft>({
    customerId: '',
    customerName: '',
    customerDocumentNumber: '',
    saleDate: new Date().toISOString().split('T')[0],
    status: 'COMPLETED',
    paymentMethodCode: 'CASH',
    currencyCode: 'USD',
  });

  const [details, setDetails] = useState<Omit<CreateSaleDetailDto, 'saleId'>[]>([]);
  const [extraCharges, setExtraCharges] = useState<Omit<CreateExtraChargeDto, 'saleId'>[]>([]);
  const [payments, setPayments] = useState<Omit<CreatePaymentDto, 'saleId'>[]>([]);

  const fetchSales = useCallback(async () => {
    if (!vendor) return;
    setLoading(true);
    setError(null);
    try {
      const data = await saleRepo.getAll({ vendorId: vendor });
      const enriched = await Promise.all(data.map(async (sale) => {
        try {
          const [detailsData, chargesData, paymentsData] = await Promise.all([
            detailRepo.getBySaleId(sale.id),
            extraChargeRepo.getBySaleId(sale.id),
            paymentRepo.getBySaleId(sale.id),
          ]);
          return {
            ...sale,
            details: detailsData,
            extraCharges: chargesData,
            payments: paymentsData
          };
        } catch (err) {
          console.error(`Failed to load relations for sale ${sale.id}:`, err);
          return sale;
        }
      }));
      setSales(enriched);
    } catch (err: any) {
      console.error('Failed to fetch sales:', err);
      setError(err.message || 'Error loading sales');
    } finally {
      setLoading(false);
    }
  }, [vendor]);

  // Calculations
  const subtotal = useMemo(() => {
    return details.reduce((sum, item) => sum + (item.priceAmount * item.quantity), 0);
  }, [details]);

  const totalDiscount = useMemo(() => {
    return details.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
  }, [details]);

  const totalExtraCharges = useMemo(() => {
    return extraCharges.reduce((sum, item) => sum + item.chargeAmount, 0);
  }, [extraCharges]);

  const grandTotal = useMemo(() => {
    return subtotal + totalExtraCharges - totalDiscount;
  }, [subtotal, totalExtraCharges, totalDiscount]);

  const totalPayments = useMemo(() => {
    return payments.reduce((sum, item) => sum + item.priceAmount + (item.interestAmount || 0), 0);
  }, [payments]);

  const paymentDifference = useMemo(() => {
    return grandTotal - totalPayments;
  }, [grandTotal, totalPayments]);

  // Draft operations
  const resetForm = useCallback(() => {
    setSaleDraft({
      customerId: '',
      customerName: '',
      customerDocumentNumber: '',
      saleDate: new Date().toISOString().split('T')[0],
      status: 'COMPLETED',
      paymentMethodCode: 'CASH',
      currencyCode: 'USD',
    });
    setDetails([]);
    setExtraCharges([]);
    setPayments([]);
  }, []);

  const addDetail = useCallback((item: Omit<CreateSaleDetailDto, 'saleId'>) => {
    setDetails(prev => [...prev, item]);
  }, []);

  const removeDetail = useCallback((index: number) => {
    setDetails(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addExtraCharge = useCallback((charge: Omit<CreateExtraChargeDto, 'saleId'>) => {
    setExtraCharges(prev => [...prev, charge]);
  }, []);

  const removeExtraCharge = useCallback((index: number) => {
    setExtraCharges(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addPayment = useCallback((payment: Omit<CreatePaymentDto, 'saleId'>) => {
    setPayments(prev => [...prev, payment]);
  }, []);

  const removePayment = useCallback((index: number) => {
    setPayments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const saveSale = useCallback(async () => {
    if (!vendor) throw new Error('Vendor context is missing.');
    if (!saleDraft.customerId || !saleDraft.customerName || !saleDraft.customerDocumentNumber) {
      throw new Error('Customer information is incomplete.');
    }
    if (details.length === 0) {
      throw new Error('At least one sale item is required.');
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const finalCustomerId = uuidRegex.test(saleDraft.customerId)
      ? saleDraft.customerId
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });

    setLoading(true);
    const payload = {
      vendorId: vendor,
      customerId: finalCustomerId,
      customerName: saleDraft.customerName,
      customerDocumentNumber: saleDraft.customerDocumentNumber,
      saleDate: new Date(saleDraft.saleDate).toISOString(),
      status: saleDraft.status,
      paymentMethodCode: saleDraft.paymentMethodCode,
      currencyCode: saleDraft.currencyCode,
      saleDetails: details.map(d => ({
        shoppingCartDetailId: d.shoppingCartDetailId || null,
        expenseIncomeCode: d.expenseIncomeCode,
        notes: d.notes,
        quantity: d.quantity,
        unitMeasureCode: d.unitMeasureCode,
        costAmount: d.costAmount || 0,
        revenueAmount: d.revenueAmount || (d.quantity * d.priceAmount),
        discountAmount: d.discountAmount || 0,
        priceAmount: d.priceAmount,
        status: d.status || 'ACTIVE'
      })),
      extraCharges: extraCharges.map(ec => ({
        description: ec.description,
        chargeAmount: ec.chargeAmount,
        expenseIncomeCode: ec.expenseIncomeCode
      })),
      payments: payments.map(p => ({
        paymentDate: new Date(p.paymentDate).toISOString(),
        order: p.order,
        priceAmount: p.priceAmount,
        interestAmount: p.interestAmount || 0,
        status: p.status || 'PENDING'
      }))
    };

    console.log('[useSales Debug] Saving Sale Payload:', JSON.stringify(payload, null, 2));

    try {
      // Create the nested Sale payload
      const createdSale = await saleRepo.create(payload as any);

      await fetchSales();
      resetForm();
      return createdSale;
    } catch (err: any) {
      console.error('[useSales Debug] Error saving sale transaction:', err);
      if (err.response) {
        console.error('[useSales Debug] Server Response Error Status:', err.response.status);
        console.error('[useSales Debug] Server Response Error Data:', JSON.stringify(err.response.data, null, 2));
      } else if (err.request) {
        console.error('[useSales Debug] Request was made but no response received:', err.request);
      } else {
        console.error('[useSales Debug] Error Message:', err.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [vendor, saleDraft, details, extraCharges, payments, fetchSales, resetForm]);

  // Filter sales
  const filteredSales = useMemo(() => {
    if (!searchQuery.trim()) return sales;
    const query = searchQuery.toLowerCase();
    return sales.filter(s => 
      s.customerName.toLowerCase().includes(query) || 
      s.customerDocumentNumber.toLowerCase().includes(query)
    );
  }, [sales, searchQuery]);

  return {
    sales: filteredSales,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedSale,
    setSelectedSale,
    selectedDetails,
    selectedCharges,
    selectedPayments,
    loadSaleRelations,
    saleDraft,
    setSaleDraft,
    details,
    extraCharges,
    payments,
    subtotal,
    totalDiscount,
    totalExtraCharges,
    grandTotal,
    totalPayments,
    paymentDifference,
    fetchSales,
    resetForm,
    addDetail,
    removeDetail,
    addExtraCharge,
    removeExtraCharge,
    addPayment,
    removePayment,
    saveSale
  };
}
