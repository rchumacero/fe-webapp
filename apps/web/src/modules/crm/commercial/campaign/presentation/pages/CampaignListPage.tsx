"use client";

import React from 'react';
import { useTranslation } from '@kplian/i18n';
import { CAMPAIGN_CONSTANTS } from '../../constants/campaign-constants';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export default function CampaignListPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t(CAMPAIGN_CONSTANTS.LIST_TITLE)}</h1>
        <Button><Plus className="mr-2 h-4 w-4" /> {t(CAMPAIGN_CONSTANTS.CREATE_TITLE)}</Button>
      </div>
      <Card>
        <CardHeader>Campaigns</CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-10">No campaigns found.</p>
        </CardContent>
      </Card>
    </div>
  );
}
