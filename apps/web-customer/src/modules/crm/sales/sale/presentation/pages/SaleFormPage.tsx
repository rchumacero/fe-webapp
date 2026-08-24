"use client";

import React from 'react';
import { useTranslation } from '@kplian/i18n';
import { SALE_CONSTANTS } from '../../constants/sale-constants';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { SALE_DOMAIN_PARAMETERS, P_PAYMENT_TYPE } from '../../constants/parameter';

export default function SaleFormPage({ id }: { id?: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  
  const { data: parametersData } = useDomainParameters({
    parameters: SALE_DOMAIN_PARAMETERS
  });
  
  const paymentTypeOptions = parametersData[P_PAYMENT_TYPE] || [];
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">{id ? t(SALE_CONSTANTS.EDIT_TITLE) : t(SALE_CONSTANTS.CREATE_TITLE)}</h1>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Input placeholder={t(SALE_CONSTANTS.FORM.CUSTOMER)} />
          <Input placeholder={t(SALE_CONSTANTS.FORM.AMOUNT)} type="number" />
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Payment Type</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select Payment Type</option>
              {paymentTypeOptions.map((opt: any, idx: number) => {
                const val = opt.KEY ?? opt.CODE ?? opt.VALUE ?? opt.ID ?? opt.code ?? opt.value ?? opt.id ?? opt.fullCode ?? opt;
                const label = opt.NAME || opt.name || opt.label || opt.description || val || `Option ${idx}`;
                return (
                  <option key={`${val}-${idx}`} value={val}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button>{t(SALE_CONSTANTS.FORM.SUBMIT)}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
