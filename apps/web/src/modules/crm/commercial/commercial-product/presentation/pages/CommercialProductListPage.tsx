"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from '@kplian/i18n';
import { COMMERCIAL_PRODUCT_CONSTANTS } from '../../constants/commercial-product-constants';
import { COMMERCIAL_PRODUCT_ROUTES } from '../../routes/commercial-product-routes';
import { CAMPAIGN_PRODUCT_ROUTES } from '../../../campaign-product/routes/campaign-product-routes';
import { CAMPAIGN_PRODUCT_CONSTANTS } from '../../../campaign-product/constants/campaign-product-constants';
import { CommercialProduct } from '@kplian/core';
import { CommercialProductRepositoryImpl } from '@kplian/infrastructure';
import { formatDateTime, DEFAULT_PAGE_SIZE } from '@kplian/core';
import { CampaignRepositoryImpl } from '../../../campaign/infrastructure/repositories/CampaignRepositoryImpl';
import { Campaign } from '../../../campaign/domain/entities/Campaign';
import { CAMPAIGN_ROUTES } from '../../../campaign/routes/campaign-routes';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RefreshCw, Plus, Search, Edit2, Trash2, MoreHorizontal, Loader2, Package, DollarSign, Tag, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SCHEDULE_ROUTES } from '../../../schedule/routes/schedule-routes';
import { SCHEDULE_CONSTANTS } from '../../../schedule/constants/schedule-constants';
import { COLLABORATOR_ROUTES } from '../../../collaborator/routes/collaborator-routes';
import { COLLABORATOR_CONSTANTS } from '../../../collaborator/constants/collaborator-constants';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { COMMERCIAL_PRODUCT_DOMAIN_PARAMETERS, P_STATUS, P_PRICE_TYPE, P_CHANNEL, P_SCHEDULE_TYPE, P_TIME_BASED, P_REQUIRE_CONFIRMATION } from '../../constants/parameter';

const commercialProductRepository = new CommercialProductRepositoryImpl();
const campaignRepository = new CampaignRepositoryImpl();

interface CommercialProductListPageProps {
  campaignId: string;
}

export default function CommercialProductListPage({ campaignId }: CommercialProductListPageProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [products, setProducts] = useState<CommercialProduct[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  const { data: parametersData } = useDomainParameters({
    parameters: COMMERCIAL_PRODUCT_DOMAIN_PARAMETERS
  });

  const getParameterLabel = useCallback((domainCode: string, value: string) => {
    const list = parametersData[domainCode] || [];
    const item = list.find((i: any) => {
      const itemVal = i.KEY ?? i.CODE ?? i.VALUE ?? i.ID ?? i.code ?? i.value ?? i.id ?? i.valueStr ?? i.fullCode ?? i;
      return String(itemVal).toLowerCase() === String(value).toLowerCase();
    });
    return item?.NAME || item?.name || item?.label || value;
  }, [parametersData]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await commercialProductRepository.getByCampaignId(campaignId);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching commercial products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  const fetchCampaign = useCallback(async () => {
    try {
      const data = await campaignRepository.getById(campaignId);
      setCampaign(data);
    } catch (error) {
      console.error("Error fetching campaign:", error);
    }
  }, [campaignId]);

  useEffect(() => {
    if (campaignId) {
      fetchProducts();
      fetchCampaign();
    }
  }, [campaignId, fetchProducts, fetchCampaign]);

  const handleRefresh = () => {
    fetchProducts();
  };

  const filteredProducts = products.filter(p => {
    if (!search) return true;
    const term = search.toLowerCase();
    const name = (p.name || '').toLowerCase();
    const code = (p.code || '').toLowerCase();

    return name.includes(term) || code.includes(term);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <Breadcrumb 
        items={[
          { label: t('campaigns') || 'Campaigns', href: campaign ? CAMPAIGN_ROUTES.DETAIL(campaign) : CAMPAIGN_ROUTES.LIST },
          { label: campaign?.name || '...', href: campaign ? CAMPAIGN_ROUTES.DETAIL(campaign) : undefined },
          { label: t(COMMERCIAL_PRODUCT_CONSTANTS.LIST_TITLE) }
        ]} 
      />
      <div className="flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10 mb-2">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="rounded-full hover:bg-accent"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {t(COMMERCIAL_PRODUCT_CONSTANTS.LIST_TITLE)}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleRefresh} className="rounded-full hover:bg-accent hover:rotate-180 transition-all duration-500">
            <RefreshCw className={isLoading ? "animate-spin size-5" : "size-5"} />
          </Button>
          <Link href={COMMERCIAL_PRODUCT_ROUTES.CREATE(campaignId)}>
            <Button size="icon" className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-md group">
              <Plus className="size-5 group-hover:scale-110 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t(COMMERCIAL_PRODUCT_CONSTANTS.SEARCH_PLACEHOLDER) || 'Filter products...'}
          className="pl-9 h-11 bg-card/50 border-border/40 focus:ring-primary/20 transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product, index) => (
          <Card
            key={`${product.id}-${index}`}
            className="group border-border/40 bg-card hover:bg-accent/5 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-primary/5"
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1 overflow-hidden flex-1 mr-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{product.code}</p>
                <CardTitle title={product.name} className="text-lg font-bold group-hover:text-primary transition-colors truncate max-w-full block">
                  {product.name}
                </CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent transition-all outline-none group-data-[state=open]:bg-accent">
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href={COMMERCIAL_PRODUCT_ROUTES.EDIT(campaignId, product.id)} className="flex items-center w-full">
                      <Edit2 className="mr-2 h-4 w-4" /> {t(COMMERCIAL_PRODUCT_CONSTANTS.EDIT_RECORD) || 'Edit'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href={CAMPAIGN_PRODUCT_ROUTES.LIST(product.id)} className="flex items-center w-full">
                      <Package className="mr-2 h-4 w-4 text-orange-500" /> {t(COMMERCIAL_PRODUCT_CONSTANTS.VIEW_SUB_PRODUCTS) || 'View Sub Products'}
                    </Link>
                  </DropdownMenuItem>
                  {(product.planScheduleCode === 'YES' || product.planScheduleCode === 'Y') && product.scheduleTypeCode?.toLowerCase() === 'open' && (
                    <DropdownMenuItem className="cursor-pointer">
                      <Link href={SCHEDULE_ROUTES.LIST(product.id)} className="flex items-center w-full">
                        <Calendar className="mr-2 h-4 w-4 text-primary" />{t(SCHEDULE_CONSTANTS.VIEW_SCHEDULE) || 'Schedule'}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href={COLLABORATOR_ROUTES.LIST(product.id)} className="flex items-center w-full">
                      <Tag className="mr-2 h-4 w-4 text-emerald-500" /> {t(COLLABORATOR_CONSTANTS.VIEW_COLLABORATORS) || 'Collaborators'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive cursor-pointer focus:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" /> {t(COMMERCIAL_PRODUCT_CONSTANTS.CONFIRM_DELETE) || 'Delete'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 pb-4 flex justify-between items-start gap-3">
              <div className="flex-1">
                <div className="flex flex-col gap-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Tag size={14} className="text-primary/60" />
                    <span className="truncate">{product.description || 'No description'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <DollarSign size={14} className="text-primary/60" />
                    <span>{getParameterLabel(P_PRICE_TYPE, product.priceType || '')}: {product.totalCost}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Badge variant={String(product.status).toLowerCase() === 'active' || String(product.status).toLowerCase() === 'ac' ? 'default' : 'secondary'} className="text-[10px] py-0 h-4 mr-1">
                      {getParameterLabel(P_STATUS, product.status || '')}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] py-0 h-4">
                      {getParameterLabel(P_CHANNEL, product.channelCode || '')}
                    </Badge>
                    {(product.planScheduleCode === 'YES' || product.planScheduleCode === 'Y') && product.scheduleTypeCode && (
                      <Badge variant="secondary" className="text-[10px] py-0 h-4 bg-primary/5 text-primary border-primary/20">
                        {getParameterLabel(P_SCHEDULE_TYPE, product.scheduleTypeCode)}
                      </Badge>
                    )}
                    {product.timeBasedCode && (
                      <Badge variant="outline" className="text-[10px] py-0 h-4 bg-amber-500/5 text-amber-600 border-amber-500/20">
                        TB: {getParameterLabel(P_TIME_BASED, product.timeBasedCode)}
                      </Badge>
                    )}
                    {product.requireConfirmationCode && (
                      <Badge variant="outline" className="text-[10px] py-0 h-4 bg-blue-500/5 text-blue-600 border-blue-500/20">
                        RC: {getParameterLabel(P_REQUIRE_CONFIRMATION, product.requireConfirmationCode)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="py-2 border-t border-border/5 flex flex-col items-start gap-2 h-auto mt-0">
              <div className="w-full flex justify-between items-center text-[9px] text-muted-foreground/40 uppercase tracking-widest font-medium">
                <span className="flex items-center gap-1">
                  Created: {formatDateTime(product.createdAt)}
                </span>
                <span className="truncate max-w-[100px]">By: {product.createdBy || 'System'}</span>
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

      {!isLoading && filteredProducts.length === 0 && (
        <div className="col-span-full py-12 text-center border-2 border-dashed border-border/40 rounded-xl bg-accent/5">
          <Package size={40} className="mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground font-medium">{t(COMMERCIAL_PRODUCT_CONSTANTS.RECORD_NOT_FOUND)}</p>
        </div>
      )}
    </div>
  );
}
