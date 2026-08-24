"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@kplian/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Loader2, AlertTriangle, Calendar, MapPin, Tag, ChevronDown, ChevronUp, ArrowDownRight, ArrowUpRight, TrendingUp } from 'lucide-react';
import { MovementRepositoryImpl, WarehouseRepositoryImpl } from '@kplian/infrastructure';
import { loadDomainParameters, getBatchParameters, MovementReportItem, Warehouse, formatDateTime } from '@kplian/core';
import { toast } from '@/hooks/use-toast';

const movementRepo = new MovementRepositoryImpl();
const warehouseRepo = new WarehouseRepositoryImpl();

interface ReportsPageProps {
  type: 'rep_daily' | 'rep_kardex' | 'rep_stock';
}

export default function ReportsPage({ type }: ReportsPageProps) {
  const { t } = useTranslation();
  
  // Filter States
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [warehouseId, setWarehouseId] = useState('');
  const [itemCode, setItemCode] = useState('');

  // Dropdown Options
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [items, setItems] = useState<{ CODE: string; name: string }[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(true);

  // Results State
  const [results, setResults] = useState<MovementReportItem[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  useEffect(() => {
    loadFiltersData();
    setResults([]);
    setExpandedItemId(null);
  }, [type]);

  const loadFiltersData = async () => {
    setLoadingFilters(true);
    try {
      const whList = await warehouseRepo.getAll();
      setWarehouses(whList);
      if (whList.length > 0) {
        setWarehouseId(whList[0].code);
      }

      const mapped = await loadDomainParameters(getBatchParameters, [{ fullCode: 'WAR/MAIN/ITEM' }]);
      if (mapped['WAR/MAIN/ITEM']) {
        const list = mapped['WAR/MAIN/ITEM'].map((x: any) => ({
          CODE: x.CODE || x.code,
          name: x.NAME || x.name || x.description || x.CODE || x.code
        }));
        setItems(list);
        if (list.length > 0) {
          setItemCode(list[0].CODE);
        }
      }
    } catch (err) {
      console.error('Failed to load filter parameters', err);
    } finally {
      setLoadingFilters(false);
    }
  };

  const getReportTitle = () => {
    switch (type) {
      case 'rep_daily': return 'Daily Report';
      case 'rep_kardex': return 'Kardex Report';
      case 'rep_stock': return 'Stock Report';
      default: return 'Movement Report';
    }
  };

  const isWarehouseRequired = type === 'rep_daily' || type === 'rep_stock';
  const isItemRequired = type === 'rep_kardex';
  const showItemFilter = type === 'rep_kardex' || type === 'rep_stock';
  const showMoneyValues = type !== 'rep_stock';

  const handleRunReport = async () => {
    if (!startDate || !endDate) {
      toast.error('Date range is required');
      return;
    }
    if (isWarehouseRequired && !warehouseId) {
      toast.error('Warehouse selection is required');
      return;
    }
    if (isItemRequired && !itemCode) {
      toast.error('Item selection is required');
      return;
    }

    setLoadingResults(true);
    try {
      const params: any = {
        startDate,
        endDate,
        warehouseCode: warehouseId || undefined,
        itemCode: itemCode || undefined
      };
      const data = await movementRepo.getMovementsReport(params);
      setResults(data);
    } catch (err: any) {
      console.error('Failed to run warehouse report:', err);
      toast.error(err.message || 'Error executing report queries');
    } finally {
      setLoadingResults(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10 mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {getReportTitle()}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Generate and analyze structured warehouse audits</p>
        </div>
      </div>

      {loadingFilters ? (
        <div className="flex justify-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Warehouse {isWarehouseRequired && <span className="text-destructive">*</span>}
                </label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="flex h-11 w-full rounded-md border border-border/50 bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer"
                >
                  <option value="">Select Warehouse...</option>
                  {warehouses.map(w => (
                    <option key={w.code} value={w.code}>{w.name} ({w.code})</option>
                  ))}
                </select>
              </div>

              {showItemFilter && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Item {isItemRequired && <span className="text-destructive">*</span>}
                  </label>
                  <select
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-border/50 bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer"
                  >
                    <option value="">Select Item...</option>
                    {items.map(it => (
                      <option key={it.CODE} value={it.CODE}>{it.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Start Date <span className="text-destructive">*</span></label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">End Date <span className="text-destructive">*</span></label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <Button 
              onClick={handleRunReport} 
              className="w-full h-11 font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <TrendingUp size={18} />
              Generate
            </Button>
          </CardContent>
        </Card>
      )}

      {loadingResults ? (
        <div className="flex justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl bg-card/10 flex flex-col items-center justify-center gap-2">
          <AlertTriangle className="size-8 text-amber-500/80" />
          <p className="text-muted-foreground">No movements found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">
            Results ({results.length})
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {results.map((res, index) => {
              const isOutbound = (res.outbound || 0) > 0;
              const isInbound = (res.inbound || 0) > 0;
              const isExpanded = expandedItemId === `${res.movementCode}-${index}`;
              const qtyText = isOutbound ? `-${res.outbound}` : (isInbound ? `+${res.inbound}` : '0');
              const typeColorClass = isOutbound ? "text-destructive" : (isInbound ? "text-emerald-500" : "text-primary");

              return (
                <Card
                  key={index}
                  onClick={() => setExpandedItemId(isExpanded ? null : `${res.movementCode}-${index}`)}
                  className="border-border/40 bg-card hover:bg-accent/5 hover:border-primary/20 transition-all duration-300 shadow-md cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-card rounded-full">
                          {isOutbound ? (
                            <ArrowDownRight className="size-6 text-destructive" />
                          ) : isInbound ? (
                            <ArrowUpRight className="size-6 text-emerald-500" />
                          ) : (
                            <RefreshCw className="size-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{res.itemCode}</p>
                          <p className="text-xs text-muted-foreground">
                            {res.movementDate ? formatDateTime(res.movementDate).split(' ')[0] : 'N/A'} • {res.movementCode || 'INITIAL BALANCE'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${typeColorClass}`}>{qtyText}</p>
                        <p className="text-xs text-muted-foreground">Bal: {res.balance}</p>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-border/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs animate-in slide-in-from-top-1 duration-200">
                        <div>
                          <p className="text-muted-foreground uppercase font-bold text-[10px]">Warehouse</p>
                          <p className="font-semibold text-foreground">
                            {res.warehouseName ? `${res.warehouseName} (${res.warehouseCode})` : res.warehouseCode}
                          </p>
                        </div>
                        {showMoneyValues && (
                          <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                            <div>
                              <p className="text-muted-foreground uppercase font-bold text-[10px]">Unit Cost</p>
                              <p className="font-semibold text-foreground">${Number(res.unitCost || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground uppercase font-bold text-[10px]">Inbound Value</p>
                              <p className="font-semibold text-emerald-500">${Number(res.inboundValue || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground uppercase font-bold text-[10px]">Outbound Value</p>
                              <p className="font-semibold text-destructive">${Number(res.outboundValue || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground uppercase font-bold text-[10px]">Balance Cost</p>
                              <p className="font-bold text-primary">${Number(res.balanceCost || 0).toFixed(2)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
