"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from '@kplian/i18n';
import { COMMERCIAL_PRODUCT_CONSTANTS } from '../../constants/commercial-product-constants';
import { COMMERCIAL_PRODUCT_ROUTES } from '../../routes/commercial-product-routes';
import { CommercialProduct } from '../../domain/CommercialProduct';
import { CommercialProductRepositoryImpl } from '../../infrastructure/CommercialProductRepositoryImpl';
import { formatDateTime, DEFAULT_PAGE_SIZE } from '@kplian/core';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RefreshCw, Plus, Search, Edit2, Trash2, MoreHorizontal, Loader2, Package, DollarSign, Tag, Calendar } from 'lucide-react';
import Link from 'next/link';
import { SCHEDULE_ROUTES } from '../../../schedule/routes/schedule-routes';
import { SCHEDULE_CONSTANTS } from '../../../schedule/constants/schedule-constants';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';

const commercialProductRepository = new CommercialProductRepositoryImpl();

interface CommercialProductListPageProps {
  campaignId: string;
}

export default function CommercialProductListPage({ campaignId }: CommercialProductListPageProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [products, setProducts] = useState<CommercialProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

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

  useEffect(() => {
    if (campaignId) {
      fetchProducts();
    }
  }, [campaignId, fetchProducts]);

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
      <div className="flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10 mb-2">
        <div>
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
                    <Link href={SCHEDULE_ROUTES.LIST(product.id)} className="flex items-center w-full">
                      <Calendar className="mr-2 h-4 w-4 text-primary" />{t(SCHEDULE_CONSTANTS.VIEW_SCHEDULE) || 'Schedule'}
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
                    <span>{product.priceType}: {product.totalCost}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-[10px] py-0 h-4 mr-1">
                      {product.status}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] py-0 h-4">
                      {product.channelCode}
                    </Badge>
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
