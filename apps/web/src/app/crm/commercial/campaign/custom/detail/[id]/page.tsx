"use client";


import React, { useEffect, useState } from 'react';
import { CampaignRepositoryImpl } from '@/modules/crm/commercial/campaign/infrastructure/repositories/CampaignRepositoryImpl';
import { Campaign } from '@/modules/crm/commercial/campaign/domain/entities/Campaign';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CAMPAIGN_ROUTES } from '@/modules/crm/commercial/campaign/routes/campaign-routes';

const repository = new CampaignRepositoryImpl();

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    repository.getById(params.id)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (!data) return <div className="p-8 text-center text-muted-foreground">Not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <Button variant="ghost" onClick={() => router.push(CAMPAIGN_ROUTES.LIST)}>
          <ArrowLeft className="mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Campaign Detail: {data.code}</h1>
      </div>
      <div className="bg-card border rounded-xl p-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase">Name</p>
          <p className="font-semibold">{data.name}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase">Status</p>
          <p className="font-semibold">{data.status}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase">Dates</p>
          <p className="font-semibold">{new Date(data.fromDate).toLocaleDateString()} - {new Date(data.toDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase">Priority</p>
          <p className="font-semibold">{data.priority}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase">Currency Code</p>
          <p className="font-semibold">{data.currencyCode}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase">Default Spread Percent</p>
          <p className="font-semibold">{data.defaultSpreadPercent}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase">Person ID</p>
          <p className="font-semibold">{data.personId}</p>
        </div>
      </div>
    </div>
  );
}
