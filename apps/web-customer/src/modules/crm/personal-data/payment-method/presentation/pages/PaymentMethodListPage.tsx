"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useTranslation } from '@kplian/i18n';
import { PAYMENT_METHOD_CONSTANTS } from '../../constants/payment-method-constants';
import { PAYMENT_METHOD_ROUTES } from '../../routes/payment-method-routes';
import { PaymentMethodRepositoryImpl } from '../../infrastructure/repositories/PaymentMethodRepositoryImpl';
import { PaymentMethod } from '../../domain/entities/PaymentMethod';
import { PAYMENT_METHOD_DOMAIN_PARAMETERS, P_PAYMENT_TYPE } from '../../constants/parameter';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { 
  RefreshCw, 
  Plus, 
  Edit2, 
  Trash2, 
  CreditCard, 
  Loader2,
  Search
} from 'lucide-react';
import Link from 'next/link';

const paymentMethodRepository = new PaymentMethodRepositoryImpl();

interface PaymentMethodListPageProps {
  personId: string;
}

export const PaymentMethodListPage = ({ personId }: PaymentMethodListPageProps) => {
  const { t } = useTranslation();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { data: parametersData } = useDomainParameters({
    parameters: PAYMENT_METHOD_DOMAIN_PARAMETERS
  });

  const getParameterLabel = useCallback((domainCode: string, value: string) => {
    const list = parametersData[domainCode] || [];
    const item = list.find((i: any) => {
      const itemVal = i.KEY ?? i.CODE ?? i.VALUE ?? i.ID ?? i.code ?? i.value ?? i.id ?? i.valueStr ?? i.fullCode ?? i;
      return itemVal === value;
    });
    return item?.NAME || item?.name || item?.label || value;
  }, [parametersData]);

  const filteredMethods = useMemo(() => {
    return methods.filter(method => 
      method.name.toLowerCase().includes(search.toLowerCase()) ||
      method.paymentData.toLowerCase().includes(search.toLowerCase()) ||
      getParameterLabel(P_PAYMENT_TYPE, method.type).toLowerCase().includes(search.toLowerCase())
    );
  }, [methods, search, getParameterLabel]);

  const fetchMethods = useCallback(async () => {
    if (!personId) return;
    setIsLoading(true);
    try {
      const data = await paymentMethodRepository.getAllByPersonId(personId);
      setMethods(data);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    } finally {
      setIsLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setShowConfirmDelete(false);
    try {
      await paymentMethodRepository.delete(deleteTargetId);
      fetchMethods();
    } catch (error) {
      console.error("Error deleting payment method:", error);
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <CreditCard size={24} />
          </div>
          <h2 className="text-xl font-bold tracking-tight">{t(PAYMENT_METHOD_CONSTANTS.LIST_TITLE)}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchMethods} disabled={isLoading} className="rounded-full">
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </Button>
          <Link href={PAYMENT_METHOD_ROUTES.CREATE(personId)}>
            <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10">
              <Plus size={20} />
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t(PAYMENT_METHOD_CONSTANTS.SEARCH_PLACEHOLDER)}
          className="pl-9 bg-card/50 border-border/40 h-10 ring-offset-background focus-visible:ring-primary/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && methods.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse border-border/40 bg-card/60">
              <div className="h-24" />
            </Card>
          ))
        ) : (
          filteredMethods.map((method) => (
            <Card key={method.id} className="p-4 border-border/40 bg-card/60 backdrop-blur-sm flex justify-between items-center group hover:border-primary/30 transition-all duration-300">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                   <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">
                    {getParameterLabel(P_PAYMENT_TYPE, method.type)}
                  </p>
                  {method.priority && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] bg-primary/10 text-primary font-bold">P{method.priority}</span>
                  )}
                </div>
                <CardTitle className="text-lg font-black text-foreground/90 uppercase truncate max-w-[150px]">
                  {method.name}
                </CardTitle>
                <p className="text-xs font-mono text-muted-foreground/80">{method.paymentData}</p>
              </div>
              <div className="flex gap-2">
                <Link href={PAYMENT_METHOD_ROUTES.EDIT(method.id, personId)} className="p-2 hover:bg-accent rounded-md transition-colors">
                  <Edit2 size={16} />
                </Link>
                <button
                  onClick={() => handleDelete(method.id)}
                  className="p-2 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))
        )}
        {!isLoading && filteredMethods.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border/40 rounded-xl bg-accent/5">
            <CreditCard size={40} className="mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground font-medium">{t(PAYMENT_METHOD_CONSTANTS.RECORD_NOT_FOUND)}</p>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={showConfirmDelete}
        onOpenChange={setShowConfirmDelete}
        title={t(PAYMENT_METHOD_CONSTANTS.CONFIRM_DELETE)}
        description={t(PAYMENT_METHOD_CONSTANTS.FORM.DIRTY_WARNING) || "This action cannot be undone."}
        confirmText={t(PAYMENT_METHOD_CONSTANTS.FORM.SUBMIT)}
        cancelText={t(PAYMENT_METHOD_CONSTANTS.FORM.CANCEL)}
        onConfirm={confirmDelete}
        type="danger"
      />
    </div>
  );
};
