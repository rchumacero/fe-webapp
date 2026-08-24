"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from '@kplian/i18n';
import { CAMPAIGN_CONSTANTS } from '../../constants/campaign-constants';
import { CAMPAIGN_ROUTES } from '../../routes/campaign-routes';
import { Campaign } from '../../domain/entities/Campaign';
import { CampaignRepositoryImpl } from '../../infrastructure/repositories/CampaignRepositoryImpl';
import { formatDate, formatDateTime, DEFAULT_PAGE_SIZE } from '@kplian/core';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RefreshCw, Plus, Search, Edit2, Trash2, Calendar, MoreHorizontal, Loader2, Flag, User } from 'lucide-react';
import Link from 'next/link';
import { useVendor } from '@/hooks/use-vendor';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { CAMPAIGN_DOMAIN_PARAMETERS, P_STATUS, P_CURRENCY } from '../../constants/parameter';
import { COMMERCIAL_PRODUCT_ROUTES } from '../../../commercial-product/routes/commercial-product-routes';

const campaignRepository = new CampaignRepositoryImpl();

interface CampaignListPageProps {
  mode?: 'general' | 'custom';
}

export default function CampaignListPage({ mode = 'custom' }: CampaignListPageProps) {
  const { t } = useTranslation();
  const { vendor } = useVendor();

  const { data: parametersData } = useDomainParameters({
    parameters: CAMPAIGN_DOMAIN_PARAMETERS
  });

  const getParameterLabel = useCallback((domainCode: string, value: string) => {
    const list = parametersData[domainCode] || [];
    const item = list.find((i: any) => {
      const itemVal = i.CODE ?? i.KEY ?? i.VALUE ?? i.ID ?? i.code ?? i.value ?? i.id ?? i.valueStr ?? i.fullCode ?? i;
      return itemVal === value;
    });
    return item?.NAME || item?.name || item?.label || value;
  }, [parametersData]);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const isFetching = useRef(false);

  const fetchCampaigns = useCallback(async (pageNum: number, isNewSearch: boolean = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setIsLoading(true);

    if (!vendor) {
      setIsLoading(false);
      isFetching.current = false;
      return;
    }

    try {
      let newData;
      const params = {
        page: pageNum,
        pageSize: DEFAULT_PAGE_SIZE,
        filter: search,
      };

      if (mode === 'general') {
        newData = await campaignRepository.getGeneral(params);
      } else if (mode === 'custom') {
        newData = await campaignRepository.getCustom(params);
      } else {
        newData = await campaignRepository.getByVendorId(vendor, params);
      }

      const dataArray = Array.isArray(newData) ? newData : [];

      setCampaigns(prev => isNewSearch ? dataArray : [...prev, ...dataArray]);
      setHasMore(dataArray.length === DEFAULT_PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, [search, vendor, mode]);

  useEffect(() => {
    if (vendor) {
      fetchCampaigns(page, page === 1);
    }
  }, [page, fetchCampaigns, vendor]);

  const handleSearch = () => {
    if (page === 1) {
      fetchCampaigns(1, true);
    } else {
      setPage(1);
    }
  };

  const handleRefresh = () => {
    setCampaigns([]);
    if (page === 1) {
      fetchCampaigns(1, true);
    } else {
      setPage(1);
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    if (!search) return true;
    const term = search.toLowerCase();
    const name = (c.name || '').toLowerCase();
    const code = (c.code || '').toLowerCase();

    return name.includes(term) || code.includes(term);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10 mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === 'general' ? t(CAMPAIGN_CONSTANTS.GENERAL_CAMPAIGNS) : mode === 'custom' ? t(CAMPAIGN_CONSTANTS.CUSTOM_CAMPAIGNS) : t(CAMPAIGN_CONSTANTS.LIST_TITLE)}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleRefresh} className="rounded-full hover:bg-accent hover:rotate-180 transition-all duration-500">
            <RefreshCw className={isLoading ? "animate-spin size-5" : "size-5"} />
          </Button>
          <Link href={mode === 'general' ? '/crm/commercial/campaign/general/new' : '/crm/commercial/campaign/custom/new'}>
            <Button size="icon" className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-md group">
              <Plus className="size-5 group-hover:scale-110 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t(CAMPAIGN_CONSTANTS.SEARCH_PLACEHOLDER) || 'Filter campaigns...'}
          className="pl-9 h-11 bg-card/50 border-border/40 focus:ring-primary/20 transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign, index) => (
          <Card
            key={`${campaign.id}-${index}`}
            ref={index === campaigns.length - 1 ? lastElementRef : null}
            className="group border-border/40 bg-card hover:bg-accent/5 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-primary/5"
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1 overflow-hidden flex-1 mr-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{campaign.code}</p>
                <CardTitle title={campaign.name} className="text-lg font-bold group-hover:text-primary transition-colors truncate max-w-full block">
                  {campaign.name}
                </CardTitle>
                {campaign.personName && (
                  <div className="flex items-center gap-1.5 text-xs text-primary/70 font-medium truncate mt-0.5">
                    <User size={12} className="shrink-0" />
                    <span className="truncate">{campaign.personName}</span>
                  </div>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent transition-all outline-none group-data-[state=open]:bg-accent">
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href={mode === 'general' ? `/crm/commercial/campaign/general/edit/${campaign.id}` : `/crm/commercial/campaign/custom/edit/${campaign.id}`} className="flex items-center w-full">
                      <Edit2 className="mr-2 h-4 w-4" /> {t(CAMPAIGN_CONSTANTS.EDIT_RECORD) || 'Edit'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href={COMMERCIAL_PRODUCT_ROUTES.LIST(campaign.id)} className="flex items-center w-full">
                      <Search className="mr-2 h-4 w-4" /> {t(CAMPAIGN_CONSTANTS.VIEW_PRODUCTS) || 'View Products'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive cursor-pointer focus:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" /> {t(CAMPAIGN_CONSTANTS.CONFIRM_DELETE) || 'Delete'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 pb-4 flex justify-between items-start gap-3">
              <div className="flex-1">
                <div className="flex flex-col gap-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar size={14} className="text-primary/60" />
                    <span>{formatDate(campaign.fromDate)} - {formatDate(campaign.toDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Flag size={14} className="text-primary/60" />
                    <span className="truncate">Priority: {campaign.priority}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-[10px] py-0 h-4 mr-1">
                      {getParameterLabel(P_STATUS, campaign.status)}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] py-0 h-4">
                      {getParameterLabel(P_CURRENCY, campaign.currencyCode)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="py-2 border-t border-border/5 flex flex-col items-start gap-2 h-auto mt-0">
              <div className="w-full flex justify-between items-center text-[9px] text-muted-foreground/40 uppercase tracking-widest font-medium">
                <span className="flex items-center gap-1">
                  Created: {formatDateTime(campaign.createdAt)}
                </span>
                <span className="truncate max-w-[100px]">By: {campaign.createdBy || 'System'}</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!hasMore && campaigns.length > 0 && (
        <p className="text-center text-muted-foreground text-sm py-8 border-t border-border/5">
          {t(CAMPAIGN_CONSTANTS.END_OF_RECORDS) || 'End of records'}
        </p>
      )}
    </div>
  );
}
