"use client";

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@kplian/i18n';
import { useInventory } from '../hooks/useInventory';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RefreshCw, Plus, Search, Eye, Loader2, Trash2, Calendar, MapPin, Database, MoreHorizontal, Edit2, Save, FileText } from 'lucide-react';
import { formatDateTime } from '@kplian/core';
import { InventoryRepositoryImpl, InventoryDetailRepositoryImpl, createApiClient } from '@kplian/infrastructure';
import { toast } from '@/hooks/use-toast';

const inventoryRepo = new InventoryRepositoryImpl();
const detailRepo = new InventoryDetailRepositoryImpl();

export default function InventoryPage() {
  const { t } = useTranslation();
  const {
    inventories,
    warehouses,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedInventory,
    setSelectedInventory,
    selectedDetails,
    loadInventoryRelations,
    inventoryDraft,
    setInventoryDraft,
    details,
    setDetails,
    editingInventoryId,
    startEdit,
    addDetail,
    removeDetail,
    saveInventory,
    fetchInventories,
    fetchWarehouses,
    resetForm,
  } = useInventory();

  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  // Detail item inline state
  const [newItemCode, setNewItemCode] = useState('');
  const [newItemInvQty, setNewItemInvQty] = useState(0);
  const [newItemRealQty, setNewItemRealQty] = useState(0);
  const [newItemCost, setNewItemCost] = useState(0);

  // Detail item edit state (for existing DB details)
  const [editingDetailItem, setEditingDetailItem] = useState<any | null>(null);
  
  // Local item detail edit state (for newly added unsaved details)
  const [editingLocalIndex, setEditingLocalIndex] = useState<number | null>(null);

  // Shared detail modal edit inputs
  const [editDetailInvQty, setEditDetailInvQty] = useState(0);
  const [editDetailRealQty, setEditDetailRealQty] = useState(0);
  const [editDetailCost, setEditDetailCost] = useState(0);

  useEffect(() => {
    fetchInventories();
    fetchWarehouses();
  }, [fetchInventories, fetchWarehouses]);

  const handleOpenDetail = async (inventory: any) => {
    setSelectedInventory(inventory);
    setDetailOpen(true);
    await loadInventoryRelations(inventory.id);
  };

  const handleOpenCreate = () => {
    resetForm();
    setCreateOpen(true);
  };

  const handleOpenEdit = async (inventory: any) => {
    const detailsList = await loadInventoryRelations(inventory.id);
    startEdit(inventory, detailsList);
    setCreateOpen(true);
  };

  const handleAddDetail = () => {
    if (!newItemCode) {
      toast.error('Item code is required');
      return;
    }
    addDetail({
      itemCode: newItemCode,
      inventoryQuantity: newItemInvQty,
      realQuantity: newItemRealQty,
      unitCost: newItemCost,
    });
    setNewItemCode('');
    setNewItemInvQty(0);
    setNewItemRealQty(0);
    setNewItemCost(0);
  };

  const handleSave = async () => {
    try {
      await saveInventory();
      setCreateOpen(false);
      toast.success(editingInventoryId ? 'Inventory updated successfully' : 'Inventory sheet recorded successfully');
    } catch (err: any) {
      toast.error(err.message || 'Error saving inventory');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this inventory record?')) {
      try {
        await inventoryRepo.delete(id);
        toast.success('Inventory sheet deleted successfully');
        fetchInventories();
      } catch (err: any) {
        console.error(err);
        toast.error('Failed to delete inventory record');
      }
    }
  };

  const handleExportPDF = async (inventory: any) => {
    try {
      toast.success('Generando PDF...');
      const detailsList = await detailRepo.getByInventory(inventory.id);
      const whName = warehouses.find(w => w.id === inventory.warehouseId)?.name || inventory.warehouseId;

      const columns = [
        { header: 'Producto', dataKey: 'itemCode' },
        { header: 'C. Sistema', dataKey: 'inventoryQuantity' },
        { header: 'C. Física', dataKey: 'realQuantity' },
        { header: 'Dif. Cant.', dataKey: 'diffQuantity' },
        { header: 'C. Unitario', dataKey: 'unitCost' },
        { header: 'V. Sistema', dataKey: 'systemValue' },
        { header: 'V. Físico', dataKey: 'realValue' },
        { header: 'V. Diferencia', dataKey: 'diffValue' }
      ];

      const { generatePDFReport, formatCurrency } = await import('@/lib/pdf-helper');

      let totalSystemVal = 0;
      let totalRealVal = 0;
      let totalDiffVal = 0;

      const rows = (detailsList || []).map((detail: any) => {
        const sysQty = detail.inventoryQuantity ?? 0;
        const realQty = detail.realQuantity ?? 0;
        const diffQty = realQty - sysQty;
        const cost = detail.unitCost ?? 0;

        const sysVal = sysQty * cost;
        const realVal = realQty * cost;
        const diffVal = diffQty * cost;

        totalSystemVal += sysVal;
        totalRealVal += realVal;
        totalDiffVal += diffVal;

        return {
          itemCode: detail.itemCode,
          inventoryQuantity: String(sysQty),
          realQuantity: String(realQty),
          diffQuantity: diffQty > 0 ? `+${diffQty}` : String(diffQty),
          unitCost: formatCurrency(cost),
          systemValue: formatCurrency(sysVal),
          realValue: formatCurrency(realVal),
          diffValue: formatCurrency(diffVal)
        };
      });

      const footerRows = [
        [
          { content: 'Total:', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
          { content: formatCurrency(totalSystemVal), styles: { halign: 'right', fontStyle: 'bold' } },
          { content: formatCurrency(totalRealVal), styles: { halign: 'right', fontStyle: 'bold' } },
          { content: formatCurrency(totalDiffVal), styles: { halign: 'right', fontStyle: 'bold' } }
        ]
      ];

      const dateLabel = inventory.inventoryDate ? formatDateTime(inventory.inventoryDate).split(' ')[0] : 'N/A';

      generatePDFReport({
        title: `Inventario Físico - Hoja de Auditoría`,
        subtitle: `Almacén: ${whName} | Fecha: ${dateLabel} | Estado: ${inventory.status || 'ACTIVE'}`,
        filename: `Inventario_${whName.replace(/\s+/g, '_')}_${dateLabel}.pdf`,
        columns,
        rows,
        themeColor: [36, 150, 237], // Docker blue
        footerRows
      });

      toast.success('PDF generado con éxito');
    } catch (err) {
      console.error(err);
      toast.error('Error al generar PDF');
    }
  };

  const handleOpenEditDetail = (det: any) => {
    setEditingDetailItem(det);
    setEditDetailInvQty(det.inventoryQuantity);
    setEditDetailRealQty(det.realQuantity);
    setEditDetailCost(det.unitCost);
  };

  const handleSaveEditDetail = async () => {
    if (!editingDetailItem) return;
    try {
      await detailRepo.update({
        ...editingDetailItem,
        inventoryQuantity: Number(editDetailInvQty),
        realQuantity: Number(editDetailRealQty),
        unitCost: Number(editDetailCost)
      });
      toast.success('Inventory detail updated successfully');
      setEditingDetailItem(null);
      if (selectedInventory) {
        await loadInventoryRelations(selectedInventory.id);
      }
    } catch (err: any) {
      toast.error('Failed to update inventory detail');
    }
  };

  const handleDeleteDetail = async (id: string) => {
    if (confirm('Are you sure you want to delete this detail item?')) {
      try {
        await detailRepo.delete(id);
        toast.success('Detail item deleted successfully');
        if (selectedInventory) {
          await loadInventoryRelations(selectedInventory.id);
        }
      } catch (err: any) {
        toast.error('Failed to delete detail item');
      }
    }
  };

  const handleOpenEditLocalDetail = (index: number) => {
    setEditingLocalIndex(index);
    const item = details[index];
    setEditDetailInvQty(item.inventoryQuantity || 0);
    setEditDetailRealQty(item.realQuantity || 0);
    setEditDetailCost(item.unitCost || 0);
  };

  const handleSaveLocalDetail = () => {
    if (editingLocalIndex === null) return;
    setDetails(prev => prev.map((d, idx) => {
      if (idx === editingLocalIndex) {
        return {
          ...d,
          inventoryQuantity: Number(editDetailInvQty),
          realQuantity: Number(editDetailRealQty),
          unitCost: Number(editDetailCost)
        };
      }
      return d;
    }));
    setEditingLocalIndex(null);
  };

  // Next and Cancel transitions
  const handleNextTransition = async (inventory: any) => {
    if (!confirm('Are you sure you want to move this inventory to the next step?')) return;
    try {
      const workflowApi = createApiClient('workflow');
      await workflowApi.post('/v1/state-machine/transition', {
        entity: 'inventory',
        processName: 'inventory',
        id: inventory.id,
        action: 'forward'
      });
      toast.success('Successfully moved to next step.');
      fetchInventories();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to move to next step.');
    }
  };

  const handleCancelTransition = async (inventory: any) => {
    if (!confirm('Are you sure you want to cancel the action for this inventory?')) return;
    try {
      const workflowApi = createApiClient('workflow');
      await workflowApi.post('/v1/state-machine/transition', {
        entity: 'inventory',
        processName: 'inventory',
        id: inventory.id,
        action: 'annul'
      });
      toast.success('Successfully cancelled.');
      fetchInventories();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to cancel action.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10 mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Physical Inventory Sheets
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Audit and update stock levels</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchInventories} className="rounded-full hover:bg-accent hover:rotate-180 transition-all duration-500">
            <RefreshCw className={loading ? "animate-spin size-5" : "size-5"} />
          </Button>
          <Button size="icon" onClick={handleOpenCreate} className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-md group">
            <Plus className="size-5 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by warehouse or date..."
          className="pl-9 h-11 bg-card/50 border-border/40 focus:ring-primary/20 transition-all shadow-sm text-foreground"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : inventories.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl bg-card/10">
          <p className="text-muted-foreground">No physical inventory sheets found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventories.map((inv, index) => (
            <Card
              key={`${inv.id}-${index}`}
              className="group border-border/40 bg-card hover:bg-accent/5 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-primary/5 flex flex-col justify-between"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1 overflow-hidden flex-1 mr-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Inventory Audit</p>
                  <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors truncate max-w-full block text-foreground">
                    {warehouses.find(w => w.id === inv.warehouseId)?.name || inv.warehouseId}
                  </CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent transition-all outline-none">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 bg-card border-border/40">
                    <DropdownMenuItem onClick={() => handleOpenDetail(inv)} className="cursor-pointer text-foreground">
                      <Eye className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportPDF(inv)} className="cursor-pointer text-foreground">
                      <FileText className="mr-2 h-4 w-4 text-emerald-500" /> Export PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenEdit(inv)} className="cursor-pointer text-foreground">
                      <Edit2 className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(inv.id)} className="text-destructive cursor-pointer focus:bg-destructive/10">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-3 pt-0 pb-4 flex-1">
                <div className="flex flex-col gap-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar size={14} className="text-primary/60 shrink-0" />
                    <span>{formatDateTime(inv.inventoryDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Database size={14} className="text-primary/60 shrink-0" />
                    <span>Items Audited: {inv.inventoryDetails?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Badge variant={inv.status === 'draft' ? 'secondary' : 'default'} className="text-[10px] py-0 h-4 uppercase">
                      {inv.status || 'ACTIVE'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="py-3 border-t border-border/5 flex flex-col gap-2 h-auto mt-0">
                {/* Cancel and Next transition buttons */}
                {inv.status !== 'finished' && inv.status !== 'cancel' && inv.status !== 'cancelled' && inv.status !== 'canceled' && (
                  <div className="w-full flex gap-1.5 mt-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancelTransition(inv)}
                      className="flex-1 h-7 text-[10px] font-bold bg-destructive/10 text-destructive hover:bg-destructive/20 border-none shadow-none rounded-lg"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleNextTransition(inv)}
                      className="flex-1 h-7 text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-none rounded-lg"
                    >
                      Next
                    </Button>
                  </div>
                )}
                <div className="w-full flex justify-between items-center text-[9px] text-muted-foreground/40 uppercase tracking-widest font-medium pt-1">
                  <span>Created: {formatDateTime(inv.createdAt)}</span>
                  <span className="truncate max-w-[100px]">By: {inv.createdBy || 'System'}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl bg-card border-border/40 text-foreground overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Physical Inventory Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm border-b border-border/10 pb-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Warehouse</p>
                <p className="font-medium">
                  {warehouses.find(w => w.id === selectedInventory?.warehouseId)?.name || selectedInventory?.warehouseId}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Date</p>
                <p className="font-medium">{selectedInventory?.inventoryDate ? formatDateTime(selectedInventory.inventoryDate) : ''}</p>
              </div>
            </div>

            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Audit Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedDetails.map((det: any, idx: number) => {
                const diff = (det.realQuantity || 0) - (det.inventoryQuantity || 0);
                return (
                  <Card key={idx} className="border-border/40 bg-card hover:border-primary/20 transition-all shadow-md flex flex-col justify-between">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-bold text-foreground truncate max-w-full block">
                        {det.itemCode}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-accent transition-all outline-none">
                          <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32 bg-card border-border/40">
                          <DropdownMenuItem onClick={() => handleOpenEditDetail(det)} className="cursor-pointer text-foreground text-xs">
                            <Edit2 className="mr-1.5 h-3 w-3" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteDetail(det.id)} className="text-destructive cursor-pointer focus:bg-destructive/10 text-xs">
                            <Trash2 className="mr-1.5 h-3 w-3" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent className="space-y-1 pb-4 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">System Qty:</span>
                        <span className="font-medium text-foreground">{det.inventoryQuantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Physical Qty:</span>
                        <span className="font-medium text-foreground">{det.realQuantity}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span className="text-muted-foreground">Difference:</span>
                        <span className={diff < 0 ? 'text-destructive' : diff > 0 ? 'text-emerald-500' : 'text-muted-foreground'}>
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-border/5 pt-1 mt-1">
                        <span className="text-muted-foreground">Unit Cost:</span>
                        <span className="font-medium text-foreground">${Number(det.unitCost || 0).toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Existing DB Item Detail Edit Dialog */}
      <Dialog open={!!editingDetailItem} onOpenChange={(open) => !open && setEditingDetailItem(null)}>
        <DialogContent className="max-w-md bg-card border-border/40 text-foreground">
          <DialogHeader>
            <DialogTitle>Edit Item Audit - {editingDetailItem?.itemCode}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">System Qty</label>
              <Input type="number" value={editDetailInvQty} onChange={(e) => setEditDetailInvQty(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Physical Qty</label>
              <Input type="number" value={editDetailRealQty} onChange={(e) => setEditDetailRealQty(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unit Cost</label>
              <Input type="number" step="0.01" value={editDetailCost} onChange={(e) => setEditDetailCost(Number(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDetailItem(null)}>Cancel</Button>
            <Button onClick={handleSaveEditDetail}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Local Unsaved Item Detail Edit Dialog */}
      <Dialog open={editingLocalIndex !== null} onOpenChange={(open) => !open && setEditingLocalIndex(null)}>
        <DialogContent className="max-w-md bg-card border-border/40 text-foreground">
          <DialogHeader>
            <DialogTitle>Edit Added Item Audit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">System Qty</label>
              <Input type="number" value={editDetailInvQty} onChange={(e) => setEditDetailInvQty(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Physical Qty</label>
              <Input type="number" value={editDetailRealQty} onChange={(e) => setEditDetailRealQty(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unit Cost</label>
              <Input type="number" step="0.01" value={editDetailCost} onChange={(e) => setEditDetailCost(Number(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLocalIndex(null)}>Cancel</Button>
            <Button onClick={handleSaveLocalDetail}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl bg-card border-border/40 text-foreground overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{editingInventoryId ? 'Edit Inventory Audit' : 'Record Physical Inventory'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Warehouse</label>
                <select
                  value={inventoryDraft.warehouseId}
                  onChange={(e) => setInventoryDraft(prev => ({ ...prev, warehouseId: e.target.value }))}
                  className="flex h-11 w-full rounded-md border border-border/50 bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Audit Date</label>
                <Input
                  type="date"
                  value={inventoryDraft.inventoryDate}
                  onChange={(e) => setInventoryDraft(prev => ({ ...prev, inventoryDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="border-t border-border/10 pt-4 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Audit Items</h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Item Code</label>
                  <Input value={newItemCode} placeholder="ITEM001" onChange={(e) => setNewItemCode(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">System Qty</label>
                  <Input type="number" value={newItemInvQty} onChange={(e) => setNewItemInvQty(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Physical Qty</label>
                  <Input type="number" value={newItemRealQty} onChange={(e) => setNewItemRealQty(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unit Cost</label>
                  <Input type="number" step="0.01" value={newItemCost} onChange={(e) => setNewItemCost(Number(e.target.value))} />
                </div>
                <Button type="button" variant="outline" onClick={handleAddDetail} className="h-11 sm:col-span-5">
                  Add Item Audit
                </Button>
              </div>

              {details.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 border-t border-border/5 pt-4">
                  {details.map((det, index) => (
                    <Card key={index} className="border-border/40 bg-card/50 flex flex-col justify-between p-4 shadow-sm relative group">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold text-foreground">{det.itemCode}</p>
                          <p className="text-xs text-muted-foreground mt-1">System Qty: {det.inventoryQuantity}</p>
                          <p className="text-xs text-muted-foreground">Physical Qty: {det.realQuantity}</p>
                          <p className="text-xs text-muted-foreground">Unit Cost: ${Number(det.unitCost).toFixed(2)}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-accent transition-all outline-none">
                            <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32 bg-card border-border/40">
                            <DropdownMenuItem onClick={() => handleOpenEditLocalDetail(index)} className="cursor-pointer text-foreground text-xs">
                              <Edit2 className="mr-1.5 h-3 w-3" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => removeDetail(index)} className="text-destructive cursor-pointer focus:bg-destructive/10 text-xs">
                              <Trash2 className="mr-1.5 h-3 w-3" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between border-t border-border/5 pt-4">
            <Button variant="outline" className="rounded-xl px-6" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={details.length === 0} className="rounded-xl px-6 bg-foreground text-background hover:bg-foreground/90 transition-all font-bold gap-2">
              <Save className="size-4" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
