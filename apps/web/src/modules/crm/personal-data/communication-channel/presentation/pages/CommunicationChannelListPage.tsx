"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from '@kplian/i18n';
import { COMMUNICATION_CHANNEL_CONSTANTS } from '../../constants/communication-channel-constants';
import { COMMUNICATION_CHANNEL_ROUTES } from '../../routes/communication-channel-routes';
import { CommunicationChannelRepositoryImpl } from '../../infrastructure/repositories/CommunicationChannelRepositoryImpl';
import { CommunicationChannel } from '../../domain/entities/CommunicationChannel';
import { COMMUNICATION_CHANNEL_DOMAIN_PARAMETERS, P_COMM_CHANNNEL, P_COMM_CHANNNEL_KIND } from '../../constants/parameter';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { 
  RefreshCw, 
  Plus, 
  Edit2, 
  Trash2, 
  MessageSquare, 
  Loader2,
  Mail,
  Phone,
  Search
} from 'lucide-react';
import Link from 'next/link';

const communicationChannelRepository = new CommunicationChannelRepositoryImpl();

interface CommunicationChannelListPageProps {
  personId: string;
}

export const CommunicationChannelListPage = ({ personId }: CommunicationChannelListPageProps) => {
  const { t } = useTranslation();
  const [channels, setChannels] = useState<CommunicationChannel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  const { data: parametersData } = useDomainParameters({
    parameters: COMMUNICATION_CHANNEL_DOMAIN_PARAMETERS
  });

  const getParameterLabel = useCallback((domainCode: string, value: string) => {
    const list = parametersData[domainCode] || [];
    const item = list.find((i: any) => {
      const itemVal = i.KEY ?? i.CODE ?? i.VALUE ?? i.ID ?? i.code ?? i.value ?? i.id ?? i.valueStr ?? i.fullCode ?? i;
      return itemVal === value;
    });
    return item?.NAME || item?.name || item?.label || value;
  }, [parametersData]);

  const filteredChannels = useMemo(() => {
    return channels.filter(channel => 
      channel.contactData.toLowerCase().includes(search.toLowerCase()) ||
      getParameterLabel(P_COMM_CHANNNEL, channel.type).toLowerCase().includes(search.toLowerCase()) ||
      getParameterLabel(P_COMM_CHANNNEL_KIND, channel.kind).toLowerCase().includes(search.toLowerCase())
    );
  }, [channels, search, getParameterLabel]);

  const fetchChannels = useCallback(async () => {
    if (!personId) return;
    setIsLoading(true);
    try {
      const data = await communicationChannelRepository.getAllByPersonId(personId);
      setChannels(data);
    } catch (error) {
      console.error("Error fetching channels:", error);
    } finally {
      setIsLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirmDelete') || "Are you sure?")) return;
    try {
      await communicationChannelRepository.delete(id);
      fetchChannels();
    } catch (error) {
      console.error("Error deleting channel:", error);
    }
  };

  const getIcon = (type: string) => {
    const tLower = type.toLowerCase();
    if (tLower.includes('mail')) return <Mail size={18} />;
    if (tLower.includes('cel') || tLower.includes('tel') || tLower.includes('phone')) return <Phone size={18} />;
    return <MessageSquare size={18} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <MessageSquare size={24} />
          </div>
          <h2 className="text-xl font-bold tracking-tight">{t(COMMUNICATION_CHANNEL_CONSTANTS.LIST_TITLE)}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchChannels} disabled={isLoading} className="rounded-full">
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </Button>
          <Link href={COMMUNICATION_CHANNEL_ROUTES.CREATE(personId)}>
            <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10">
              <Plus size={20} />
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t(COMMUNICATION_CHANNEL_CONSTANTS.SEARCH_PLACEHOLDER)}
          className="pl-9 bg-card/50 border-border/40 h-10 ring-offset-background focus-visible:ring-primary/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && channels.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse border-border/40 bg-card/60">
              <div className="h-24" />
            </Card>
          ))
        ) : (
          filteredChannels.map((channel) => (
            <Card key={channel.id} className="p-4 border-border/40 bg-card/60 backdrop-blur-sm flex justify-between items-center group hover:border-primary/30 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-accent/50 rounded-lg text-primary/70">
                  {getIcon(channel.type)}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] uppercase tracking-widest font-black text-primary/60">
                      {getParameterLabel(P_COMM_CHANNNEL_KIND, channel.kind)}
                    </p>
                    {channel.priority && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-primary/10 text-primary font-bold">P{channel.priority}</span>
                    )}
                  </div>
                  <CardTitle className="text-base font-black text-foreground/90 truncate max-w-[150px]">
                    {channel.contactData}
                  </CardTitle>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                    {getParameterLabel(P_COMM_CHANNNEL, channel.type)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={COMMUNICATION_CHANNEL_ROUTES.EDIT(channel.id, personId)} className="p-2 hover:bg-accent rounded-md transition-colors">
                  <Edit2 size={16} />
                </Link>
                <button
                  onClick={() => handleDelete(channel.id)}
                  className="p-2 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))
        )}
        {!isLoading && filteredChannels.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border/40 rounded-xl bg-accent/5">
            <MessageSquare size={40} className="mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground font-medium">{t('common.noDataAvailable')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
