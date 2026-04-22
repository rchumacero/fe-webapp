"use client";

import React from 'react';
import { useTranslation } from '@kplian/i18n';
import { SALE_CONSTANTS } from '../../constants/sale-constants';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function SaleFormPage({ id }: { id?: string }) {
  const { t } = useTranslation();
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">{id ? t(SALE_CONSTANTS.EDIT_TITLE) : t(SALE_CONSTANTS.CREATE_TITLE)}</h1>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Input placeholder={t(SALE_CONSTANTS.FORM.CUSTOMER)} />
          <Input placeholder={t(SALE_CONSTANTS.FORM.AMOUNT)} type="number" />
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="ghost">Cancel</Button>
          <Button>{t(SALE_CONSTANTS.FORM.SUBMIT)}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
