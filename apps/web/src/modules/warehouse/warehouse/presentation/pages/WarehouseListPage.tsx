"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from '@kplian/i18n';
import { WAREHOUSE_CONSTANTS } from '../../constants/warehouse-constants';
import { WAREHOUSE_ROUTES } from '../../routes/warehouse-routes';
import { Warehouse } from '../../domain/Warehouse';
import { WarehouseRepositoryImpl } from '../../infrastructure/WarehouseRepositoryImpl';
import { formatDateTime, DEFAULT_PAGE_SIZE } from '@kplian/core';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RefreshCw, Plus, Search, Edit2, Trash2, MapPin, Loader2, Database, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useVendor } from '@/hooks/use-vendor';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from 'lucide-react';

const warehouseRepository = new WarehouseRepositoryImpl();

export default function WarehouseListPage() {
  const { t } = useTranslation();
  const { vendorCode } = useVendor();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
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

  const fetchWarehouses = useCallback(async (pageNum: number, isNewSearch: boolean = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setIsLoading(true);

    try {
      const params = {
        vendorCode: vendorCode || undefined,
        page: pageNum,
        size: DEFAULT_PAGE_SIZE,
        code: search || undefined,
        name: search || undefined
      };
 
      const newData = await warehouseRepository.search(params);
      const dataArray = Array.isArray(newData) ? newData : (newData?.content || []);
 
      setWarehouses(prev => isNewSearch ? dataArray : [...prev, ...dataArray]);
      setHasMore(dataArray.length === DEFAULT_PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, [search, vendorCode]);

  useEffect(() => {
    fetchWarehouses(page, page === 1);
  }, [page, fetchWarehouses]);

  const handleRefresh = () => {
    setWarehouses([]);
    if (page === 1) {
      fetchWarehouses(1, true);
    } else {
      setPage(1);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t(WAREHOUSE_CONSTANTS.CONFIRM_DELETE) || "Are you sure you want to delete this warehouse?")) {
      try {
        await warehouseRepository.delete(id);
        handleRefresh();
      } catch (error) {
        console.error("Error deleting warehouse:", error);
      }
    }
  };

  const filteredWarehouses = warehouses.filter(w => {
    if (!search) return true;
    const term = search.toLowerCase();
    const name = (w.name || '').toLowerCase();
    const code = (w.code || '').toLowerCase();
    return name.includes(term) || code.includes(term);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10 mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t(WAREHOUSE_CONSTANTS.LIST_TITLE) || 'Warehouses'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleRefresh} className="rounded-full hover:bg-accent hover:rotate-180 transition-all duration-500">
            <RefreshCw className={isLoading ? "animate-spin size-5" : "size-5"} />
          </Button>
          <Link href={WAREHOUSE_ROUTES.CREATE()}>
            <Button size="icon" className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-md group">
              <Plus className="size-5 group-hover:scale-110 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t(WAREHOUSE_CONSTANTS.SEARCH_PLACEHOLDER) || 'Filter warehouses...'}
          className="pl-9 h-11 bg-card/50 border-border/40 focus:ring-primary/20 transition-all shadow-sm text-foreground"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWarehouses.map((warehouse, index) => (
          <Card
            key={`${warehouse.id}-${index}`}
            ref={index === warehouses.length - 1 ? lastElementRef : null}
            className="group border-border/40 bg-card hover:bg-accent/5 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-primary/5"
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1 overflow-hidden flex-1 mr-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{warehouse.code}</p>
                <CardTitle title={warehouse.name} className="text-lg font-bold group-hover:text-primary transition-colors truncate max-w-full block text-foreground">
                  {warehouse.name}
                </CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent transition-all outline-none">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 bg-card border-border/40">
                  <DropdownMenuItem className="cursor-pointer text-foreground">
                    <Link href={WAREHOUSE_ROUTES.EDIT(warehouse.id)} className="flex items-center w-full">
                      <Edit2 className="mr-2 h-4 w-4" /> {t(WAREHOUSE_CONSTANTS.EDIT_RECORD) || 'Edit'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-foreground">
                    <Link href={WAREHOUSE_ROUTES.MOVEMENT_REPORT(warehouse.id)} className="flex items-center w-full">
                      <RefreshCw className="mr-2 h-4 w-4" /> Movimientos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive cursor-pointer focus:bg-destructive/10" onClick={() => handleDelete(warehouse.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> {t(WAREHOUSE_CONSTANTS.CONFIRM_DELETE) || 'Delete'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 pb-4 flex justify-between items-start gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex flex-col gap-y-2 text-sm">
                  {warehouse.address && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin size={14} className="text-primary/60 shrink-0" />
                      <span className="truncate">{warehouse.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Database size={14} className="text-primary/60 shrink-0" />
                    <span className="truncate">Type: {warehouse.type || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign size={14} className="text-primary/60 shrink-0" />
                    <span className="truncate">Cost Method: {warehouse.costMethodCode || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Badge variant={warehouse.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-[10px] py-0 h-4 mr-1">
                      {warehouse.status || 'ACTIVE'}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] py-0 h-4">
                      {warehouse.locationCode || 'GEO'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="py-2 border-t border-border/5 flex flex-col items-start gap-2 h-auto mt-0">
              <div className="w-full flex justify-between items-center text-[9px] text-muted-foreground/40 uppercase tracking-widest font-medium">
                <span className="flex items-center gap-1">
                  Created: {formatDateTime(warehouse.createdAt)}
                </span>
                <span className="truncate max-w-[100px]">By: {warehouse.createdBy || 'System'}</span>
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

      {!hasMore && warehouses.length > 0 && (
        <p className="text-center text-muted-foreground text-sm py-8 border-t border-border/5">
          {t(WAREHOUSE_CONSTANTS.END_OF_RECORDS) || 'End of records'}
        </p>
      )}
    </div>
  );
}
