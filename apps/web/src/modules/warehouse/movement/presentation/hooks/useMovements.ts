import { useState, useCallback } from 'react';
import {
  Movement,
  CreateMovementDto,
  MovementDetail,
  CreateMovementDetailDto,
  Warehouse
} from '@kplian/core';
import {
  MovementRepositoryImpl,
  MovementDetailRepositoryImpl,
  MovementExtraCostRepositoryImpl,
  WarehouseRepositoryImpl
} from '@kplian/infrastructure';
import { useVendor } from '@/hooks/use-vendor';

const movementRepo = new MovementRepositoryImpl();
const detailRepo = new MovementDetailRepositoryImpl();
const extraCostRepo = new MovementExtraCostRepositoryImpl();
const warehouseRepo = new WarehouseRepositoryImpl();

export interface MovementDraft {
  code: string;
  warehouseId: string;
  movementDate: string;
  subtype: string;
  currencyCode: string;
  description: string;
  warehousePersonCode: string;
  personCode: string;
}

export function useMovements(type: 'in' | 'out') {
  const { vendorCode } = useVendor();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('draft');

  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<MovementDetail[]>([]);
  const [editingMovementId, setEditingMovementId] = useState<string | null>(null);
  const [editingMovementCode, setEditingMovementCode] = useState<string | null>(null);

  const loadMovementRelations = useCallback(async (movementId: string) => {
    setLoading(true);
    try {
      const detailsData = await detailRepo.getByMovement(movementId);
      setSelectedDetails(detailsData);
      return detailsData;
    } catch (err) {
      console.error('Failed to load movement details:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const [movementDraft, setMovementDraft] = useState<MovementDraft>({
    code: '',
    warehouseId: '',
    movementDate: new Date().toISOString().split('T')[0],
    subtype: '',
    currencyCode: 'USD',
    description: '',
    warehousePersonCode: '',
    personCode: '',
  });

  const [details, setDetails] = useState<any[]>([]);

  const fetchWarehouses = useCallback(async () => {
    try {
      const data = await warehouseRepo.getAll();
      setWarehouses(data);
      if (data.length > 0 && !movementDraft.warehouseId) {
        setMovementDraft(p => ({ ...p, warehouseId: data[0].id }));
      }
    } catch (err) {
      console.error('Failed to fetch warehouses:', err);
    }
  }, [movementDraft.warehouseId]);

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data: Movement[] = [];
      const getBackendStatuses = (filter: string): string[] | undefined => {
        switch (filter) {
          case 'draft':
            return ['draft'];
          case 'in_progress':
            return ['requested'];
          case 'finished_cancelled':
            return ['finished', 'cancel', 'cancelled', 'canceled'];
          default:
            return undefined;
        }
      };
      const statuses = getBackendStatuses(statusFilter);
      if (vendorCode) {
        data = await movementRepo.getByVendor(vendorCode, statuses);
      } else {
        data = await movementRepo.getAll(statuses);
      }
      
      const filtered = type ? data.filter(m => m.type === type) : data;
      setMovements(filtered);
    } catch (err: any) {
      console.error('Failed to fetch movements:', err);
      setError(err.message || 'Error fetching movements');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, vendorCode, type]);

  const resetForm = useCallback(() => {
    setEditingMovementId(null);
    setEditingMovementCode(null);
    setMovementDraft({
      code: '',
      warehouseId: warehouses[0]?.id || '',
      movementDate: new Date().toISOString().split('T')[0],
      subtype: '',
      currencyCode: 'USD',
      description: '',
      warehousePersonCode: '',
      personCode: '',
    });
    setDetails([]);
  }, [warehouses]);

  const startEdit = useCallback((movement: Movement, detailsList: any[]) => {
    setEditingMovementId(movement.id);
    setEditingMovementCode(movement.code || null);
    setMovementDraft({
      code: movement.code || '',
      warehouseId: movement.warehouseId,
      movementDate: movement.movementDate.split('T')[0],
      subtype: movement.subtype,
      currencyCode: movement.currencyCode,
      description: movement.description || '',
      warehousePersonCode: movement.warehousePersonCode || '',
      personCode: movement.personCode || '',
    });
    setDetails(detailsList.map(d => ({
      id: d.id,
      itemCode: d.itemCode,
      quantity: d.quantity,
      costAmount: d.costAmount,
      measureUnitCode: d.measureUnitCode,
      extraCosts: d.extraCosts || []
    })));
  }, []);

  const addDetail = useCallback((itemCode: string, quantity: number, unitCost: number, measureUnitCode: string) => {
    setDetails(prev => [
      ...prev,
      {
        itemCode,
        quantity,
        costAmount: unitCost,
        measureUnitCode,
        extraCosts: []
      }
    ]);
  }, []);

  const removeDetail = useCallback((index: number) => {
    setDetails(prev => prev.filter((_, i) => i !== index));
  }, []);

  const saveMovement = useCallback(async () => {
    if (!movementDraft.code) {
      throw new Error('Movement Code is required');
    }
    if (!movementDraft.warehouseId || !movementDraft.subtype) {
      throw new Error('Warehouse and Subtype are required');
    }
    if (details.length === 0) {
      throw new Error('At least one item detail is required');
    }

    const payload: any = {
      code: movementDraft.code,
      vendorCode: vendorCode || '',
      warehouseId: movementDraft.warehouseId,
      movementDate: new Date(movementDraft.movementDate).toISOString(),
      type,
      subtype: movementDraft.subtype,
      currencyCode: movementDraft.currencyCode,
      description: movementDraft.description,
      warehousePersonCode: movementDraft.warehousePersonCode,
      personCode: movementDraft.personCode,
      movementDetails: details.map(d => ({
        id: d.id,
        itemCode: d.itemCode,
        quantity: Number(d.quantity),
        measureUnitCode: d.measureUnitCode,
        costAmount: Number(d.costAmount),
      }))
    };

    let saved;
    if (editingMovementId) {
      saved = await movementRepo.update({
        ...payload,
        id: editingMovementId,
        code: editingMovementCode || movementDraft.code
      });
    } else {
      saved = await movementRepo.create(payload);
      
      // Save local extra costs if any
      try {
        const detailsData = await detailRepo.getByMovement(saved.id);
        for (const d of details) {
          if (d.extraCosts && d.extraCosts.length > 0) {
            const savedDetail = detailsData.find(x => x.itemCode === d.itemCode);
            if (savedDetail) {
              for (const ec of d.extraCosts) {
                await extraCostRepo.create({
                  movementDetailId: savedDetail.id,
                  extraCostCode: ec.extraCostCode,
                  costAmount: ec.costAmount,
                  measureUnitCode: ec.measureUnitCode,
                  notes: ec.notes
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('Error saving local detail extra costs:', err);
      }
    }
    await fetchMovements();
    return saved;
  }, [movementDraft, details, vendorCode, type, editingMovementId, editingMovementCode, fetchMovements]);

  return {
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
    setEditingMovementId,
    startEdit,
    fetchMovements,
    fetchWarehouses,
    resetForm,
    addDetail,
    removeDetail,
    saveMovement
  };
}
