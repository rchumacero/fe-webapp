"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@kplian/i18n';
import { WarehouseRepositoryImpl } from '@/modules/warehouse/warehouse/infrastructure/WarehouseRepositoryImpl';
import { Warehouse } from '@/modules/warehouse/warehouse/domain/Warehouse';
import { generatePDFReport } from '@/lib/pdf-helper';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  FileDown,
  RefreshCw,
  Loader2,
  ArrowDownRight,
  ArrowUpRight,
  Info,
  Calendar,
  User,
  Activity
} from 'lucide-react';
import { formatDateTime } from '@kplian/core';

const warehouseRepo = new WarehouseRepositoryImpl();

interface WarehouseMovementReportPageProps {
  id: string;
}

export default function WarehouseMovementReportPage({ id }: WarehouseMovementReportPageProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch warehouse details
      const wh = await warehouseRepo.getById(id);
      setWarehouse(wh);

      // 2. Fetch warehouse movements using custom endpoint
      const movs = await warehouseRepo.getWarehouseMovements(id);
      
      // Sort movements by date descending
      const sortedMovs = [...(movs || [])].sort((a, b) => {
        return new Date(b.movementDate || b.createdAt || 0).getTime() - new Date(a.movementDate || a.createdAt || 0).getTime();
      });
      setMovements(sortedMovs);
    } catch (error) {
      console.error('Failed to load warehouse movement data:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportPDF = () => {
    if (!warehouse) return;

    const columns = [
      { header: 'Fecha', dataKey: 'formattedDate' },
      { header: 'Código', dataKey: 'code' },
      { header: 'Tipo', dataKey: 'displayType' },
      { header: 'Subtipo', dataKey: 'subtype' },
      { header: 'Descripción', dataKey: 'description' },
      { header: 'Creado por', dataKey: 'createdBy' },
      { header: 'Estado', dataKey: 'status' }
    ];

    const rows = movements.map(m => ({
      ...m,
      formattedDate: m.movementDate ? formatDateTime(m.movementDate).split(' ')[0] : 'N/A',
      displayType: m.type === 'in' ? 'Entrada' : (m.type === 'out' ? 'Salida' : m.type),
      subtype: m.subtype || '-',
      description: m.description || '-',
      createdBy: m.createdBy || 'Sistema',
      status: m.status || 'ACTIVE'
    }));

    generatePDFReport({
      title: `Reporte de Movimientos`,
      subtitle: `Almacén: ${warehouse.name} (${warehouse.code}) | ID: ${warehouse.id}`,
      filename: `Reporte_Movimientos_${warehouse.code}.pdf`,
      columns,
      rows,
      themeColor: [16, 185, 129] // Emerald Green theme
    });
  };

  const handleExportSingleMovementPDF = async (mov: any) => {
    if (!warehouse) return;

    const columns = [
      { header: 'Item Code', dataKey: 'itemCode' },
      { header: 'Cantidad', dataKey: 'quantity' },
      { header: 'Moneda', dataKey: 'measureUnitCode' },
      { header: 'Costo Unitario', dataKey: 'costAmount' },
      { header: 'Costo Adicional', dataKey: 'extraCost' },
      { header: 'Costo Total', dataKey: 'totalCost' }
    ];
    const { formatCurrency } = await import('@/lib/pdf-helper');

    const rows = (mov.movementDetails || []).map((detail: any) => ({
      itemCode: detail.itemCode,
      quantity: detail.quantity ?? 0,
      measureUnitCode: detail.measureUnitCode || '-',
      costAmount: formatCurrency(detail.costAmount),
      extraCost: formatCurrency(detail.extraCost),
      totalCost: formatCurrency(detail.totalCost)
    }));

    const totalAmount = (mov.movementDetails || []).reduce((sum: number, detail: any) => {
      const detailTotal = detail.totalCost !== undefined 
        ? Number(detail.totalCost) 
        : (Number(detail.quantity || 0) * Number(detail.costAmount || 0));
      return sum + detailTotal;
    }, 0);

    const footerRows = [
      [
        { content: 'Total:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatCurrency(totalAmount), styles: { halign: 'right', fontStyle: 'bold' } }
      ]
    ];

    const typeLabel = mov.type === 'in' ? 'Entrada' : (mov.type === 'out' ? 'Salida' : mov.type);
    const dateLabel = mov.movementDate ? formatDateTime(mov.movementDate).split(' ')[0] : 'N/A';

    generatePDFReport({
      title: `Detalle de Movimiento: ${mov.code}`,
      subtitle: `Almacén: ${warehouse.name} (${warehouse.code}) | Tipo: ${typeLabel} | Fecha: ${dateLabel}`,
      filename: `Movimiento_${mov.code}.pdf`,
      columns,
      rows,
      themeColor: [36, 150, 237], // Docker blue
      footerRows
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 px-4 md:px-8">
      {/* Top Header Navigation */}
      <div className="flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full h-10 w-10">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Kardex de Movimientos</h1>
            {warehouse && (
              <p className="text-sm text-muted-foreground mt-0.5">
                Almacén: <span className="font-semibold text-foreground">{warehouse.name} ({warehouse.code})</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={loadData}
            className="rounded-full hover:bg-accent hover:rotate-180 transition-all duration-500"
            disabled={loading}
          >
            <RefreshCw className={loading ? 'animate-spin size-5' : 'size-5'} />
          </Button>
          <Button
            onClick={handleExportPDF}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg flex items-center gap-2"
            disabled={loading || movements.length === 0}
          >
            <FileDown size={18} />
            Exportar PDF
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin h-10 w-10 text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Summary Card */}
          {warehouse && (
            <Card className="border-border/40 bg-card/30 backdrop-blur-sm shadow-md">
              <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Dirección</span>
                  <span className="font-semibold text-foreground">{warehouse.address || '-'}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Método de Costeo</span>
                  <span className="font-semibold text-foreground uppercase">{warehouse.costMethodCode || '-'}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Tipo de Almacén</span>
                  <span className="font-semibold text-foreground uppercase">{warehouse.type || '-'}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Ubicación Geo</span>
                  <span className="font-semibold text-foreground uppercase">{warehouse.locationCode || 'GEO'}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Movements Listing */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">
              Lista de Movimientos ({movements.length})
            </h3>

            {movements.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/10 flex flex-col items-center justify-center gap-3">
                <Activity className="h-10 w-10 text-muted-foreground/60" />
                <h4 className="font-semibold">Sin movimientos registrados</h4>
                <p className="text-xs text-muted-foreground max-w-xs">No se han registrado transacciones de entrada ni salida para este almacén.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {movements.map((mov, index) => {
                  const isInbound = mov.type === 'in';
                  const isOutbound = mov.type === 'out';
                  const typeColor = isInbound ? "text-emerald-500" : (isOutbound ? "text-destructive" : "text-primary");

                  return (
                    <Card
                      key={`${mov.id}-${index}`}
                      className="border-border/40 bg-card hover:border-primary/20 transition-all duration-200 shadow-md"
                    >
                      <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-card border border-border/40 rounded-full shrink-0 mt-0.5">
                            {isInbound ? (
                              <ArrowUpRight className="size-6 text-emerald-500" />
                            ) : isOutbound ? (
                              <ArrowDownRight className="size-6 text-destructive" />
                            ) : (
                              <Activity className="size-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-foreground">{mov.code}</span>
                              <Badge variant={mov.status === 'ACTIVE' || mov.status === 'PROCESSED' ? 'default' : 'secondary'} className="text-[10px] py-0 px-1.5 h-4 uppercase">
                                {mov.status || 'ACTIVE'}
                              </Badge>
                              {mov.subtype && (
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 uppercase font-mono">
                                  {mov.subtype}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-4 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} className="text-primary/60" />
                                {mov.movementDate ? formatDateTime(mov.movementDate).split(' ')[0] : 'N/A'}
                              </span>
                              <span className="flex items-center gap-1">
                                <User size={12} className="text-primary/60" />
                                {mov.createdBy || 'Sistema'}
                              </span>
                            </p>
                            {mov.description && (
                              <p className="text-xs text-foreground/80 mt-2 flex items-start gap-1">
                                <Info size={12} className="text-muted-foreground shrink-0 mt-0.5" />
                                <span>{mov.description}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0 self-end sm:self-auto min-w-[120px]">
                          <div className="text-right">
                            <p className={`text-base font-bold uppercase tracking-wider ${typeColor}`}>
                              {isInbound ? 'Entrada' : (isOutbound ? 'Salida' : mov.type)}
                            </p>
                            <span className="text-[10px] text-muted-foreground font-mono block">
                              Detalles: {mov.movementDetails?.length || 0} items
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-xs flex items-center gap-1 hover:bg-primary/5 hover:text-primary transition-all border-border/60"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportSingleMovementPDF(mov);
                            }}
                          >
                            <FileDown size={14} />
                            PDF
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
