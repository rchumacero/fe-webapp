"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from '@kplian/i18n';
import { ECONOMIC_ACTIVITY_CONSTANTS } from '../../constants/economic-activity-constants';
import { ECONOMIC_ACTIVITY_ROUTES } from '../../routes/economic-activity-routes';
import { EconomicActivityRepositoryImpl } from '../../infrastructure/repositories/EconomicActivityRepositoryImpl';
import { EconomicActivity } from '../../domain/entities/EconomicActivity';
import { ECONOMIC_ACTIVITY_DOMAIN_PARAMETERS, P_ECONOMIC_ACTIVITY } from '../../constants/parameter';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { 
  RefreshCw, 
  Plus, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  Loader2,
  Search
} from 'lucide-react';
import Link from 'next/link';

const economicActivityRepository = new EconomicActivityRepositoryImpl();

interface EconomicActivityListPageProps {
  personId: string;
}

export const EconomicActivityListPage = ({ personId }: EconomicActivityListPageProps) => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<EconomicActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  const { data: parametersData } = useDomainParameters({
    parameters: ECONOMIC_ACTIVITY_DOMAIN_PARAMETERS
  });

  const getParameterLabel = useCallback((domainCode: string, value: string) => {
    const list = parametersData[domainCode] || [];
    const item = list.find((i: any) => {
      const itemVal = i.KEY ?? i.CODE ?? i.VALUE ?? i.ID ?? i.code ?? i.value ?? i.id ?? i.valueStr ?? i.fullCode ?? i;
      return itemVal === value;
    });
    return item?.NAME || item?.name || item?.label || value;
  }, [parametersData]);

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => 
      getParameterLabel(P_ECONOMIC_ACTIVITY, activity.paramEconomicActCode).toLowerCase().includes(search.toLowerCase()) ||
      activity.type?.toLowerCase().includes(search.toLowerCase())
    );
  }, [activities, search, getParameterLabel]);

  const fetchActivities = useCallback(async () => {
    if (!personId) return;
    setIsLoading(true);
    try {
      const data = await economicActivityRepository.getAllByPersonId(personId);
      setActivities(data);
    } catch (error) {
      console.error("Error fetching economic activities:", error);
    } finally {
      setIsLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirmDelete') || "Are you sure?")) return;
    try {
      await economicActivityRepository.delete(id);
      fetchActivities();
    } catch (error) {
      console.error("Error deleting economic activity:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <TrendingUp size={24} />
          </div>
          <h2 className="text-xl font-bold tracking-tight">{t(ECONOMIC_ACTIVITY_CONSTANTS.LIST_TITLE)}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchActivities} disabled={isLoading} className="rounded-full">
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </Button>
          <Link href={ECONOMIC_ACTIVITY_ROUTES.CREATE(personId)}>
            <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10">
              <Plus size={20} />
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t(ECONOMIC_ACTIVITY_CONSTANTS.SEARCH_PLACEHOLDER)}
          className="pl-9 bg-card/50 border-border/40 h-10 ring-offset-background focus-visible:ring-primary/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && activities.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse border-border/40 bg-card/60">
              <div className="h-24" />
            </Card>
          ))
        ) : (
          filteredActivities.map((activity) => (
            <Card key={activity.id} className="p-4 border-border/40 bg-card/60 backdrop-blur-sm flex justify-between items-center group hover:border-primary/30 transition-all duration-300">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">
                    {activity.type}
                  </p>
                  {activity.priority && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] bg-primary/10 text-primary font-bold">P{activity.priority}</span>
                  )}
                </div>
                <CardTitle className="text-lg font-black text-foreground/90 uppercase truncate max-w-[150px]">
                  {getParameterLabel(P_ECONOMIC_ACTIVITY, activity.paramEconomicActCode)}
                </CardTitle>
                <p className="text-[10px] font-mono text-muted-foreground/80">{activity.paramEconomicActCode}</p>
              </div>
              <div className="flex gap-2">
                <Link href={ECONOMIC_ACTIVITY_ROUTES.EDIT(activity.id, personId)} className="p-2 hover:bg-accent rounded-md transition-colors">
                  <Edit2 size={16} />
                </Link>
                <button
                  onClick={() => handleDelete(activity.id)}
                  className="p-2 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))
        )}
        {!isLoading && filteredActivities.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border/40 rounded-xl bg-accent/5">
            <TrendingUp size={40} className="mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground font-medium">{t('common.noDataAvailable')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
