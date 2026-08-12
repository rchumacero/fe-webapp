"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@kplian/i18n';
import { useMovements } from '../hooks/useMovements';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RefreshCw, Plus, Search, Eye, Loader2, Trash2, Calendar, FileText, MapPin, DollarSign, MoreHorizontal, Edit2, Save, Coins } from 'lucide-react';
import { formatDateTime, loadDomainParameters, getBatchParameters, MovementExtraCost } from '@kplian/core';
import { MovementRepositoryImpl, MovementDetailRepositoryImpl, MovementExtraCostRepositoryImpl, createApiClient } from '@kplian/infrastructure';
import { toast } from '@/hooks/use-toast';

const movementRepo = new MovementRepositoryImpl();
const detailRepo = new MovementDetailRepositoryImpl();
const extraCostRepo = new MovementExtraCostRepositoryImpl();

interface MovementListPageProps {
  type: 'in' | 'out';
}

export default function MovementListPage({ type }: MovementListPageProps) {
  const { t } = useTranslation();
  const {
    movements,
    statusFilter,
    setStatusFilter,
    warehouses,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedMovement,
    setSelectedMovement,
    selectedDetails,
    loadMovementRelations,
    movementDraft,
    setMovementDraft,
    details,
    setDetails,
    editingMovementId,
    startEdit,
    addDetail,
    removeDetail,
    saveMovement,
    fetchMovements,
    fetchWarehouses,
    resetForm,
  } = useMovements(type);

  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  // New item detail form state
  const [newItemCode, setNewItemCode] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemCost, setNewItemCost] = useState(0);
  const [newItemMU, setNewItemMU] = useState('BOB');
  
  const [itemOptions, setItemOptions] = useState<{ CODE: string; name: string }[]>([]);

  // Item detail edit state (for existing DB details)
  const [editingDetailItem, setEditingDetailItem] = useState<any | null>(null);
  
  // Local item detail edit state (for newly added unsaved details)
  const [editingLocalIndex, setEditingLocalIndex] = useState<number | null>(null);

  // Shared detail modal edit inputs
  const [editDetailQty, setEditDetailQty] = useState(0);
  const [editDetailCost, setEditDetailCost] = useState(0);

  // DB Extra Cost states
  const [extraCostOpen, setExtraCostOpen] = useState(false);
  const [extraCosts, setExtraCosts] = useState<MovementExtraCost[]>([]);
  const [extraCostsLoading, setExtraCostsLoading] = useState(false);
  const [extraCostTarget, setExtraCostTarget] = useState<{
    type: 'parent' | 'detail';
    movementId?: string;
    movementDetailId?: string;
    label: string;
  } | null>(null);

  // DB Extra Cost Form state
  const [ecFormCode, setEcFormCode] = useState('FLETE');
  const [ecFormAmount, setEcFormAmount] = useState(0);
  const [ecFormMU, setEcFormMU] = useState('BOB');
  const [ecFormNotes, setEcFormNotes] = useState('');
  const [editingExtraCostId, setEditingExtraCostId] = useState<string | null>(null);

  // Local Extra Cost states
  const [localExtraCostOpen, setLocalExtraCostOpen] = useState(false);
  const [localExtraCostTargetIndex, setLocalExtraCostTargetIndex] = useState<number | null>(null);
  const [localEcCode, setLocalEcCode] = useState('FLETE');
  const [localEcAmount, setLocalEcAmount] = useState(0);
  const [localEcMU, setLocalEcMU] = useState('BOB');
  const [localEcNotes, setLocalEcNotes] = useState('');
  const [editingLocalEcIndex, setEditingLocalEcIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchMovements();
    fetchWarehouses();
  }, [fetchMovements, fetchWarehouses, statusFilter]);

  useEffect(() => {
    const fetchItemParams = async () => {
      try {
        const mapped = await loadDomainParameters(getBatchParameters, [{ fullCode: 'WAR/MAIN/ITEM' }]);
        if (mapped['WAR/MAIN/ITEM']) {
          const list = mapped['WAR/MAIN/ITEM'].map((x: any) => ({
            CODE: x.CODE || x.code,
            name: x.NAME || x.name || x.description || x.CODE || x.code
          }));
          setItemOptions(list);
          if (list.length > 0) {
            setNewItemCode(list[0].CODE);
          }
        }
      } catch (err) {
        console.error('Failed to load item parameters', err);
      }
    };
    fetchItemParams();
  }, []);

  const handleOpenDetail = async (movement: any) => {
    setSelectedMovement(movement);
    setDetailOpen(true);
    await loadMovementRelations(movement.id);
  };

  const handleOpenCreate = () => {
    resetForm();
    if (itemOptions.length > 0) {
      setNewItemCode(itemOptions[0].CODE);
    }
    setCreateOpen(true);
  };

  const handleOpenEdit = async (movement: any) => {
    const detailsList = await loadMovementRelations(movement.id);
    
    // Load extra costs for all detail items in parallel
    const detailsWithCosts = await Promise.all(detailsList.map(async (d) => {
      try {
        const extraCostsList = await extraCostRepo.getByMovementDetail(d.id);
        return {
          ...d,
          extraCosts: extraCostsList || []
        };
      } catch (err) {
        console.error(`Failed to load extra costs for detail ${d.id}:`, err);
        return { ...d, extraCosts: [] };
      }
    }));

    startEdit(movement, detailsWithCosts);
    setCreateOpen(true);
  };

  const handleAddDetail = () => {
    if (!newItemCode) {
      toast.error('Item code is required');
      return;
    }
    addDetail(newItemCode, newItemQty, newItemCost, newItemMU);
    setNewItemQty(1);
    setNewItemCost(0);
    if (itemOptions.length > 0) {
      setNewItemCode(itemOptions[0].CODE);
    }
  };

  const handleSave = async () => {
    try {
      await saveMovement();
      setCreateOpen(false);
      toast.success(editingMovementId ? 'Movement updated successfully' : 'Movement recorded successfully');
    } catch (err: any) {
      toast.error(err.message || 'Error saving movement');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this movement record?')) {
      try {
        await movementRepo.delete(id);
        toast.success('Movement deleted successfully');
        fetchMovements();
      } catch (err: any) {
        console.error(err);
        toast.error('Failed to delete movement record');
      }
    }
  };

  const handleOpenEditDetail = (det: any) => {
    setEditingDetailItem(det);
    setEditDetailQty(det.quantity);
    setEditDetailCost(det.costAmount);
  };

  const handleSaveEditDetail = async () => {
    if (!editingDetailItem) return;
    try {
      await detailRepo.update({
        ...editingDetailItem,
        quantity: Number(editDetailQty),
        costAmount: Number(editDetailCost)
      });
      toast.success('Item detail updated successfully');
      setEditingDetailItem(null);
      if (selectedMovement) {
        await loadMovementRelations(selectedMovement.id);
      }
    } catch (err: any) {
      toast.error('Failed to update item detail');
    }
  };

  const handleDeleteDetail = async (id: string) => {
    if (confirm('Are you sure you want to delete this detail item?')) {
      try {
        await detailRepo.delete(id);
        toast.success('Detail item deleted successfully');
        if (selectedMovement) {
          await loadMovementRelations(selectedMovement.id);
        }
      } catch (err: any) {
        toast.error('Failed to delete detail item');
      }
    }
  };

  const handleOpenEditLocalDetail = (index: number) => {
    setEditingLocalIndex(index);
    const item = details[index];
    setEditDetailQty(item.quantity);
    setEditDetailCost(item.costAmount || 0);
  };

  const handleSaveLocalDetail = () => {
    if (editingLocalIndex === null) return;
    setDetails(prev => prev.map((d, idx) => {
      if (idx === editingLocalIndex) {
        return {
          ...d,
          quantity: Number(editDetailQty),
          costAmount: Number(editDetailCost)
        };
      }
      return d;
    }));
    setEditingLocalIndex(null);
  };

  // DB Extra Cost Logic
  const fetchExtraCostsList = useCallback(async (target: typeof extraCostTarget) => {
    if (!target) return;
    setExtraCostsLoading(true);
    try {
      let data: MovementExtraCost[] = [];
      if (target.type === 'parent' && target.movementId) {
        data = await extraCostRepo.getByMovement(target.movementId);
      } else if (target.type === 'detail' && target.movementDetailId) {
        data = await extraCostRepo.getByMovementDetail(target.movementDetailId);
      }
      setExtraCosts(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load extra costs');
    } finally {
      setExtraCostsLoading(false);
    }
  }, []);

  const handleOpenParentExtraCosts = (movement: any) => {
    const target = { type: 'parent' as const, movementId: movement.id, label: `Movement ${movement.code}` };
    setExtraCostTarget(target);
    setExtraCostOpen(true);
    resetExtraCostForm();
    fetchExtraCostsList(target);
  };

  const handleOpenDetailExtraCosts = (det: any) => {
    const target = { type: 'detail' as const, movementDetailId: det.id, label: `Item ${det.itemCode}` };
    setExtraCostTarget(target);
    setExtraCostOpen(true);
    resetExtraCostForm();
    fetchExtraCostsList(target);
  };

  const resetExtraCostForm = () => {
    setEcFormCode('FLETE');
    setEcFormAmount(0);
    setEcFormMU('BOB');
    setEcFormNotes('');
    setEditingExtraCostId(null);
  };

  const handleSaveExtraCost = async () => {
    if (!extraCostTarget) return;
    if (ecFormAmount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    try {
      const payload: any = {
        movementId: extraCostTarget.type === 'parent' ? extraCostTarget.movementId : undefined,
        movementDetailId: extraCostTarget.type === 'detail' ? extraCostTarget.movementDetailId : undefined,
        extraCostCode: ecFormCode,
        costAmount: Number(ecFormAmount),
        measureUnitCode: ecFormMU,
        notes: ecFormNotes || undefined
      };

      if (editingExtraCostId) {
        await extraCostRepo.update({ ...payload, id: editingExtraCostId });
        toast.success('Extra cost updated successfully');
      } else {
        await extraCostRepo.create(payload);
        toast.success('Extra cost recorded successfully');
      }
      resetExtraCostForm();
      fetchExtraCostsList(extraCostTarget);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to save extra cost');
    }
  };

  const handleEditExtraCostClick = (ec: MovementExtraCost) => {
    setEditingExtraCostId(ec.id);
    setEcFormCode(ec.extraCostCode || 'FLETE');
    setEcFormAmount(ec.costAmount || 0);
    setEcFormMU(ec.measureUnitCode || 'BOB');
    setEcFormNotes(ec.notes || '');
  };

  const handleDeleteExtraCost = async (id: string) => {
    if (confirm('Are you sure you want to delete this extra cost?')) {
      try {
        await extraCostRepo.delete(id);
        toast.success('Extra cost deleted successfully');
        fetchExtraCostsList(extraCostTarget);
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete extra cost');
      }
    }
  };

  // Local Unsaved Extra Cost handlers
  const handleOpenLocalExtraCosts = (index: number) => {
    setLocalExtraCostTargetIndex(index);
    setLocalExtraCostOpen(true);
    resetLocalEcForm();
  };

  const resetLocalEcForm = () => {
    setLocalEcCode('FLETE');
    setLocalEcAmount(0);
    setLocalEcMU('BOB');
    setLocalEcNotes('');
    setEditingLocalEcIndex(null);
  };

  const handleSaveLocalExtraCost = async () => {
    if (localExtraCostTargetIndex === null) return;
    if (localEcAmount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    const targetDetail = details[localExtraCostTargetIndex];
    const newEc = {
      extraCostCode: localEcCode,
      costAmount: Number(localEcAmount),
      measureUnitCode: localEcMU,
      notes: localEcNotes || undefined,
      id: undefined as string | undefined
    };

    // If detail is already saved in the database, write to backend immediately
    if (targetDetail.id) {
      try {
        const dbPayload = {
          movementDetailId: targetDetail.id,
          extraCostCode: localEcCode,
          costAmount: Number(localEcAmount),
          measureUnitCode: localEcMU,
          notes: localEcNotes || undefined
        };

        if (editingLocalEcIndex !== null) {
          const ecItem = targetDetail.extraCosts[editingLocalEcIndex];
          await extraCostRepo.update({ ...dbPayload, id: ecItem.id });
          newEc.id = ecItem.id;
          toast.success('Extra cost updated in database');
        } else {
          const created = await extraCostRepo.create(dbPayload);
          newEc.id = created.id;
          toast.success('Extra cost recorded in database');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to save extra cost in database');
        return;
      }
    }

    setDetails(prev => prev.map((d, idx) => {
      if (idx === localExtraCostTargetIndex) {
        const extraCosts = d.extraCosts || [];
        let updatedCosts;
        if (editingLocalEcIndex !== null) {
          updatedCosts = extraCosts.map((c: any, cIdx: number) => cIdx === editingLocalEcIndex ? newEc : c);
        } else {
          updatedCosts = [...extraCosts, newEc];
        }
        return { ...d, extraCosts: updatedCosts };
      }
      return d;
    }));

    resetLocalEcForm();
  };

  const handleEditLocalEcClick = (ecIndex: number, ec: any) => {
    setEditingLocalEcIndex(ecIndex);
    setLocalEcCode(ec.extraCostCode);
    setLocalEcAmount(ec.costAmount);
    setLocalEcMU(ec.measureUnitCode);
    setLocalEcNotes(ec.notes || '');
  };

  const handleDeleteLocalExtraCost = async (ecIndex: number) => {
    if (localExtraCostTargetIndex === null) return;
    const targetDetail = details[localExtraCostTargetIndex];
    const ecItem = targetDetail.extraCosts[ecIndex];

    // If it exists in DB, delete it
    if (ecItem && ecItem.id) {
      if (confirm('Are you sure you want to delete this extra cost from the database?')) {
        try {
          await extraCostRepo.delete(ecItem.id);
          toast.success('Extra cost deleted from database');
        } catch (err) {
          console.error(err);
          toast.error('Failed to delete extra cost from database');
          return;
        }
      } else {
        return;
      }
    }

    setDetails(prev => prev.map((d, idx) => {
      if (idx === localExtraCostTargetIndex) {
        const extraCosts = d.extraCosts || [];
        return { ...d, extraCosts: extraCosts.filter((_: any, cIdx: number) => cIdx !== ecIndex) };
      }
      return d;
    }));
  };

  // Next and Cancel Transition workflows
  const handleNextTransition = async (movement: any) => {
    if (!confirm(`Are you sure you want to move movement ${movement.code} to the next step?`)) return;
    try {
      const status = (movement.status || '').toLowerCase();
      if (type === 'in') {
        if (status === 'draft') {
          await movementRepo.requestIn(movement.id);
        } else if (status === 'requested') {
          await movementRepo.finishIn(movement.id);
        } else {
          toast.error(`Invalid status for Goods Receipt transition: ${movement.status}`);
          return;
        }
      } else if (type === 'out') {
        if (status === 'draft') {
          await movementRepo.requestOut(movement.id);
        } else if (status === 'requested') {
          await movementRepo.finishOut(movement.id);
        } else {
          toast.error(`Invalid status for Goods Issue transition: ${movement.status}`);
          return;
        }
      }
      toast.success('Successfully moved to next step');
      fetchMovements();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to move to next step');
    }
  };

  const handleCancelTransition = async (movement: any) => {
    if (!confirm(`Are you sure you want to cancel the action for movement ${movement.code}?`)) return;
    try {
      const workflow = type === 'in' 
        ? { entity: 'movement', processName: 'goods_receipt' } 
        : { entity: 'movement', processName: 'goods_issue' };

      const workflowApi = createApiClient('workflow');
      await workflowApi.post('/v1/state-machine/transition', {
        entity: workflow.entity,
        processName: workflow.processName,
        id: movement.id,
        action: 'annul'
      });
      toast.success('Successfully cancelled.');
      fetchMovements();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to cancel action.');
    }
  };

  const filteredMovements = movements.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (m.code || '').toLowerCase().includes(q) || (m.description || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10 mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground capitalize">
            {type === 'in' ? 'Goods Receipt' : 'Goods Issue'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage warehouse stock movements</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchMovements} className="rounded-full hover:bg-accent hover:rotate-180 transition-all duration-500">
            <RefreshCw className={loading ? "animate-spin size-5" : "size-5"} />
          </Button>
          <Button size="icon" onClick={handleOpenCreate} className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-md group">
            <Plus className="size-5 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search code or description..."
            className="pl-9 h-11 bg-card/50 border-border/40 focus:ring-primary/20 transition-all shadow-sm text-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 border border-border/40 p-1 rounded-xl bg-card/50">
          {(['draft', 'in_progress', 'finished_cancelled'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                statusFilter === filter
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-accent/30'
              }`}
            >
              {filter.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : filteredMovements.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl bg-card/10">
          <p className="text-muted-foreground">No movements found matching the active filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMovements.map((movement, index) => (
            <Card
              key={`${movement.id}-${index}`}
              className="group border-border/40 bg-card hover:bg-accent/5 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-primary/5 flex flex-col justify-between"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1 overflow-hidden flex-1 mr-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{movement.code}</p>
                  <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors truncate max-w-full block text-foreground">
                    {movement.subtype} Movement
                  </CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent transition-all outline-none">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 bg-card border-border/40">
                    <DropdownMenuItem onClick={() => handleOpenDetail(movement)} className="cursor-pointer text-foreground">
                      <Eye className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenEdit(movement)} className="cursor-pointer text-foreground">
                      <Edit2 className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    {type === 'in' && (
                      <DropdownMenuItem onClick={() => handleOpenParentExtraCosts(movement)} className="cursor-pointer text-foreground">
                        <Coins className="mr-2 h-4 w-4 text-amber-500" /> Extra Costs
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleDelete(movement.id)} className="text-destructive cursor-pointer focus:bg-destructive/10">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-3 pt-0 pb-4 flex-1">
                <div className="flex flex-col gap-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin size={14} className="text-primary/60 shrink-0" />
                    <span className="truncate">
                      {warehouses.find(w => w.id === movement.warehouseId)?.name || movement.warehouseId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar size={14} className="text-primary/60 shrink-0" />
                    <span>{formatDateTime(movement.movementDate)}</span>
                  </div>
                  {movement.description && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <FileText size={14} className="text-primary/60 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{movement.description}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Badge variant={movement.status === 'draft' ? 'secondary' : 'default'} className="text-[10px] py-0 h-4 uppercase">
                      {movement.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="py-3 border-t border-border/5 flex flex-col gap-2 h-auto mt-0">
                {/* Cancel and Next transition buttons */}
                {movement.status !== 'finished' && movement.status !== 'cancel' && movement.status !== 'cancelled' && movement.status !== 'canceled' && (
                  <div className="w-full flex gap-1.5 mt-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancelTransition(movement)}
                      className="flex-1 h-7 text-[10px] font-bold bg-destructive/10 text-destructive hover:bg-destructive/20 border-none shadow-none rounded-lg"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleNextTransition(movement)}
                      className="flex-1 h-7 text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-none rounded-lg"
                    >
                      Next
                    </Button>
                  </div>
                )}
                <div className="w-full flex justify-between items-center text-[9px] text-muted-foreground/40 uppercase tracking-widest font-medium pt-1">
                  <span>Created: {formatDateTime(movement.createdAt)}</span>
                  <span className="truncate max-w-[100px]">By: {movement.createdBy || 'System'}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Movement Details Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl bg-card border-border/40 text-foreground overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Movement Details - {selectedMovement?.code}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm border-b border-border/10 pb-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Subtype</p>
                <p className="font-medium capitalize">{selectedMovement?.subtype}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Date</p>
                <p className="font-medium">{selectedMovement?.movementDate ? formatDateTime(selectedMovement.movementDate) : ''}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Description</p>
                <p className="font-medium">{selectedMovement?.description || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Currency</p>
                <p className="font-medium">{selectedMovement?.currencyCode}</p>
              </div>
            </div>

            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Items List</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedDetails.map((det: any, idx: number) => (
                <Card key={idx} className="border-border/40 bg-card hover:border-primary/20 transition-all shadow-md flex flex-col justify-between">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-bold text-foreground truncate max-w-full block">
                      {det.itemCode}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-accent transition-all outline-none">
                        <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 bg-card border-border/40">
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
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-medium text-foreground">{det.quantity} {det.measureUnitCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Unit Cost:</span>
                      <span className="font-medium text-foreground">${Number(det.costAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border/5 pt-1 mt-1 font-bold">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="text-foreground">${Number(det.totalCost || (det.quantity * det.costAmount)).toFixed(2)}</span>
                    </div>
                  </CardContent>
                  {type === 'in' && (
                    <CardFooter className="pt-0 pb-3 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDetailExtraCosts(det)}
                        className="h-7 text-[10px] font-bold gap-1 bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white border-amber-500/20 rounded-lg px-2"
                      >
                        <Coins size={12} /> Extra Costs
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Existing DB Item Detail Edit Dialog */}
      <Dialog open={!!editingDetailItem} onOpenChange={(open) => !open && setEditingDetailItem(null)}>
        <DialogContent className="max-w-md bg-card border-border/40 text-foreground">
          <DialogHeader>
            <DialogTitle>Edit Item - {editingDetailItem?.itemCode}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quantity</label>
              <Input type="number" value={editDetailQty} onChange={(e) => setEditDetailQty(Number(e.target.value))} />
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
            <DialogTitle>Edit Added Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quantity</label>
              <Input type="number" value={editDetailQty} onChange={(e) => setEditDetailQty(Number(e.target.value))} />
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

      {/* Local Unsaved Extra Costs Dialog */}
      <Dialog open={localExtraCostOpen} onOpenChange={setLocalExtraCostOpen}>
        <DialogContent className="max-w-2xl bg-card border-border/40 text-foreground overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Local Extra Costs - {localExtraCostTargetIndex !== null ? details[localExtraCostTargetIndex]?.itemCode : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Inline Creation / Edit Form */}
            <div className="p-4 border border-border/40 rounded-xl bg-card/30 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                {editingLocalEcIndex !== null ? 'Edit Extra Cost' : 'Record New Extra Cost'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cost Type</label>
                  <select
                    value={localEcCode}
                    onChange={(e) => setLocalEcCode(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-border/50 bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer"
                  >
                    <option value="FLETE">Freight / Delivery (FLETE)</option>
                    <option value="SEGURO">Insurance (SEGURO)</option>
                    <option value="EMBALAJE">Packaging (EMBALAJE)</option>
                    <option value="OTROS">Others (OTROS)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Amount</label>
                  <Input type="number" step="0.01" className="h-10 text-xs" value={localEcAmount} onChange={(e) => setLocalEcAmount(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Currency</label>
                  <Input className="h-10 text-xs" value={localEcMU} onChange={(e) => setLocalEcMU(e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Notes</label>
                  <Input placeholder="Optional description" className="h-10 text-xs" value={localEcNotes} onChange={(e) => setLocalEcNotes(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  {editingLocalEcIndex !== null && (
                    <Button variant="outline" size="sm" onClick={resetLocalEcForm} className="h-10 flex-1 text-xs">
                      Cancel
                    </Button>
                  )}
                  <Button onClick={handleSaveLocalExtraCost} size="sm" className="h-10 flex-1 text-xs font-bold gap-1 bg-primary/10 text-primary hover:bg-primary hover:text-white">
                    <Save size={14} /> Save
                  </Button>
                </div>
              </div>
            </div>

            {/* List of Extra Costs */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Local Extra Costs</h4>
              {localExtraCostTargetIndex !== null && (!details[localExtraCostTargetIndex]?.extraCosts || details[localExtraCostTargetIndex]?.extraCosts.length === 0) ? (
                <p className="text-xs text-muted-foreground text-center py-6">No extra costs recorded for this item.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {localExtraCostTargetIndex !== null && details[localExtraCostTargetIndex]?.extraCosts?.map((ec: any, idx: number) => (
                    <Card key={idx} className="border-border/40 bg-card/45 p-4 shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold text-amber-500 border-amber-500/30">
                            {ec.extraCostCode}
                          </Badge>
                          <p className="text-sm font-bold text-foreground mt-2">${Number(ec.costAmount).toFixed(2)} {ec.measureUnitCode}</p>
                          {ec.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{ec.notes}"</p>}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditLocalEcClick(idx, ec)} className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary">
                            <Edit2 size={13} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteLocalExtraCost(idx)} className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive">
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DB Extra Costs Management Dialog */}
      <Dialog open={extraCostOpen} onOpenChange={setExtraCostOpen}>
        <DialogContent className="max-w-2xl bg-card border-border/40 text-foreground overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Extra Costs - {extraCostTarget?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Inline Creation / Edit Form */}
            <div className="p-4 border border-border/40 rounded-xl bg-card/30 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                {editingExtraCostId ? 'Edit Extra Cost' : 'Record New Extra Cost'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cost Type</label>
                  <select
                    value={ecFormCode}
                    onChange={(e) => setEcFormCode(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-border/50 bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer"
                  >
                    <option value="FLETE">Freight / Delivery (FLETE)</option>
                    <option value="SEGURO">Insurance (SEGURO)</option>
                    <option value="EMBALAJE">Packaging (EMBALAJE)</option>
                    <option value="OTROS">Others (OTROS)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Amount</label>
                  <Input type="number" step="0.01" className="h-10 text-xs" value={ecFormAmount} onChange={(e) => setEcFormAmount(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Currency</label>
                  <Input className="h-10 text-xs" value={ecFormMU} onChange={(e) => setEcFormMU(e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Notes</label>
                  <Input placeholder="Optional description" className="h-10 text-xs" value={ecFormNotes} onChange={(e) => setEcFormNotes(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  {editingExtraCostId && (
                    <Button variant="outline" size="sm" onClick={resetExtraCostForm} className="h-10 flex-1 text-xs">
                      Cancel
                    </Button>
                  )}
                  <Button onClick={handleSaveExtraCost} size="sm" className="h-10 flex-1 text-xs font-bold gap-1 bg-primary/10 text-primary hover:bg-primary hover:text-white">
                    <Save size={14} /> Save
                  </Button>
                </div>
              </div>
            </div>

            {/* List of Extra Costs */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recorded Extra Costs</h4>
              {extraCostsLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : extraCosts.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No extra costs recorded for this item.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {extraCosts.map((ec, idx) => (
                    <Card key={idx} className="border-border/40 bg-card/45 p-4 shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold text-amber-500 border-amber-500/30">
                            {ec.extraCostCode}
                          </Badge>
                          <p className="text-sm font-bold text-foreground mt-2">${Number(ec.costAmount).toFixed(2)} {ec.measureUnitCode}</p>
                          {ec.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{ec.notes}"</p>}
                        </div>
                        {ec.movementId && ec.movementDetailId ? (
                          <span className="text-[10px] text-muted-foreground bg-accent/50 px-2 py-1 rounded-md self-start font-medium">Landed Cost</span>
                        ) : (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEditExtraCostClick(ec)} className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary">
                              <Edit2 size={13} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteExtraCost(ec.id)} className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive">
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Movement Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl bg-card border-border/40 text-foreground overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{editingMovementId ? 'Edit Movement' : `Record New ${type === 'in' ? 'Goods Receipt' : 'Goods Issue'}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Movement Code</label>
                <Input
                  value={movementDraft.code}
                  placeholder="e.g. MV-001"
                  disabled={!!editingMovementId}
                  onChange={(e) => setMovementDraft(prev => ({ ...prev, code: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Warehouse</label>
                <select
                  value={movementDraft.warehouseId}
                  onChange={(e) => setMovementDraft(prev => ({ ...prev, warehouseId: e.target.value }))}
                  className="flex h-11 w-full rounded-md border border-border/50 bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subtype</label>
                <select
                  value={movementDraft.subtype}
                  onChange={(e) => setMovementDraft(prev => ({ ...prev, subtype: e.target.value }))}
                  className="flex h-11 w-full rounded-md border border-border/50 bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer"
                >
                  <option value="">Select Subtype</option>
                  <option value="AJUSTE">Adjustment</option>
                  <option value="COMPRA">Purchase</option>
                  <option value="VENTA">Sale</option>
                  <option value="TRASPASO">Transfer</option>
                  <option value="DEVOLUCION">Return</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</label>
                <Input
                  type="date"
                  value={movementDraft.movementDate}
                  onChange={(e) => setMovementDraft(prev => ({ ...prev, movementDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                <Input
                  value={movementDraft.description}
                  placeholder="Additional notes"
                  onChange={(e) => setMovementDraft(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            <div className="border-t border-border/10 pt-4 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Add Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Item Code</label>
                  <select
                    value={newItemCode}
                    onChange={(e) => setNewItemCode(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-border/50 bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer"
                  >
                    {itemOptions.map(it => (
                      <option key={it.CODE} value={it.CODE}>{it.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quantity</label>
                  <Input type="number" value={newItemQty} onChange={(e) => setNewItemQty(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unit Cost</label>
                  <Input type="number" step="0.01" value={newItemCost} onChange={(e) => setNewItemCost(Number(e.target.value))} />
                </div>
                <Button type="button" size="icon" variant="outline" onClick={handleAddDetail} className="h-11 w-11 rounded-xl">
                  <Plus className="size-5" />
                </Button>
              </div>

              {details.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 border-t border-border/5 pt-4">
                  {details.map((det, index) => (
                    <Card key={index} className="border-border/40 bg-card/50 flex flex-col justify-between p-4 shadow-sm relative group">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold text-foreground">{det.itemCode}</p>
                          <p className="text-xs text-muted-foreground mt-1">Quantity: {det.quantity} {det.measureUnitCode}</p>
                          <p className="text-xs text-muted-foreground">Unit Cost: ${Number(det.costAmount).toFixed(2)}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-accent transition-all outline-none">
                            <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32 bg-card border-border/40">
                            <DropdownMenuItem onClick={() => handleOpenEditLocalDetail(index)} className="cursor-pointer text-foreground text-xs">
                              <Edit2 className="mr-1.5 h-3 w-3" /> Edit
                            </DropdownMenuItem>
                            {type === 'in' && (
                              <DropdownMenuItem onClick={() => handleOpenLocalExtraCosts(index)} className="cursor-pointer text-foreground text-xs">
                                <Coins className="mr-1.5 h-3 w-3 text-amber-500" /> Extra Costs
                              </DropdownMenuItem>
                            )}
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
