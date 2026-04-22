"use client";

import React from 'react';
import { useTranslation } from '@kplian/i18n';
import { CAMPAIGN_CONSTANTS } from '../../constants/campaign-constants';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function CampaignFormPage({ id }: { id?: string }) {
  const { t } = useTranslation();
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">{id ? t(CAMPAIGN_CONSTANTS.EDIT_TITLE) : t(CAMPAIGN_CONSTANTS.CREATE_TITLE)}</h1>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Input placeholder={t(CAMPAIGN_CONSTANTS.FORM.NAME)} />
          <Input placeholder={t(CAMPAIGN_CONSTANTS.FORM.DESCRIPTION)} />
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="ghost">Cancel</Button>
          <Button>{t(CAMPAIGN_CONSTANTS.FORM.SUBMIT)}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
