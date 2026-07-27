import { useState, useCallback, useMemo } from 'react';
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
  WarehouseRepositoryImpl
} from '@kplian/infrastructure';
import { useVendor } from '../../../../shared/auth/AuthContext';

const movementRepo = new MovementRepositoryImpl();
const detailRepo = new MovementDetailRepositoryImpl();
const warehouseRepo = new WarehouseRepositoryImpl();

export interface MovementDraft {
  warehouseId: string;
  movementDate: string;
  subtype: string;
  currencyCode: string;
  description: string;
  warehousePersonCode: string;
  personCode: string;
}

export function useMovements(type: 'in' | 'out') {
  const { vendor, vendorCode } = useVendor();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('draft');

  // Selected Movement for detail screen
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<MovementDetail[]>([]);

  const loadMovementRelations = useCallback(async (movementId: string) => {
    setLoading(true);
    try {
      const detailsData = await detailRepo.getByMovement(movementId);
      setSelectedDetails(detailsData);
    } catch (err) {
      console.error('Failed to load movement details:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Unified editor states
  const [movementDraft, setMovementDraft] = useState<MovementDraft>({
    warehouseId: '',
    movementDate: new Date().toISOString().split('T')[0],
    subtype: 'ING_COMPRAS',
    currencyCode: 'BOB',
    description: '',
    warehousePersonCode: '',
    personCode: '',
  });

  const [details, setDetails] = useState<Omit<CreateMovementDetailDto, 'movementId'>[]>([]);

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
      
      // Filter by type ('in' or 'out')
      const filtered = data.filter(m => m.type?.toLowerCase() === type.toLowerCase());

      const enriched = await Promise.all(filtered.map(async (movement) => {
        try {
          const detailsData = await detailRepo.getByMovement(movement.id);
          let sufficientStock: boolean | undefined = undefined;
          if (type.toLowerCase() === 'out') {
            try {
              const stockCheck = await movementRepo.checkStock(movement.id);
              sufficientStock = stockCheck.length > 0 ? stockCheck.every(item => item.sufficient) : true;
            } catch (stockErr) {
              console.error(`Failed to check stock for movement ${movement.id}:`, stockErr);
            }
          }
          return {
            ...movement,
            movementDetails: detailsData,
            sufficientStock
          };
        } catch (err) {
          console.error(`Failed enriched details for movement ${movement.id}:`, err);
          return movement;
        }
      }));
      setMovements(enriched);
    } catch (err: any) {
      console.error('Failed to fetch movements:', err);
      setError(err.message || 'Error loading movements');
    } finally {
      setLoading(false);
    }
  }, [vendorCode, type, statusFilter]);

  // Calculations
  const totalQuantity = useMemo(() => {
    return details.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [details]);

  const totalCostVal = useMemo(() => {
    return details.reduce((sum, item) => sum + ((item.costAmount || 0) * (item.quantity || 0)), 0);
  }, [details]);

  // Draft operations
  const resetForm = useCallback(() => {
    setMovementDraft({
      warehouseId: warehouses.length > 0 ? warehouses[0].id : '',
      movementDate: new Date().toISOString().split('T')[0],
      subtype: type === 'in' ? 'ING_COMPRAS' : 'EGR_VENTAS',
      currencyCode: 'BOB',
      description: '',
      warehousePersonCode: '',
      personCode: '',
    });
    setDetails([]);
  }, [warehouses, type]);

  const addDetail = useCallback((item: Omit<CreateMovementDetailDto, 'movementId'>) => {
    setDetails(prev => [...prev, item]);
  }, []);

  const removeDetail = useCallback((index: number) => {
    setDetails(prev => prev.filter((_, i) => i !== index));
  }, []);

  const saveMovement = useCallback(async () => {
    if (!movementDraft.warehouseId) {
      throw new Error('Warehouse selection is required.');
    }
    if (details.length === 0) {
      throw new Error('At least one item detail is required.');
    }

    const generatedCode = `MVT-${type.toUpperCase()}-${Date.now().toString().slice(-6)}`;

    setLoading(true);
    const payload = {
      vendorCode: vendorCode || 'SYSTEM',
      code: generatedCode,
      warehouseId: movementDraft.warehouseId,
      movementDate: new Date(movementDraft.movementDate).toISOString(),
      type: type.toLowerCase(),
      subtype: movementDraft.subtype,
      currencyCode: movementDraft.currencyCode,
      description: movementDraft.description,
      warehousePersonCode: movementDraft.warehousePersonCode || 'SYSTEM',
      personCode: movementDraft.personCode || 'SYSTEM',
      movementDetails: details.map(d => ({
        itemCode: d.itemCode,
        quantity: d.quantity || 0,
        measureUnitCode: d.measureUnitCode || 'UNIDAD',
        costAmount: d.costAmount || 0,
      }))
    };

    console.log('[useMovements Debug] Saving Movement Payload:', JSON.stringify(payload, null, 2));

    try {
      const created = await movementRepo.create(payload as any);
      await fetchMovements();
      resetForm();
      return created;
    } catch (err: any) {
      console.error('[useMovements Debug] Error saving movement:', err);
      if (err.response) {
        console.error('[useMovements Debug] Response Data:', JSON.stringify(err.response.data, null, 2));
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [vendorCode, type, movementDraft, details, fetchMovements, resetForm]);

  // Filter movements by search query
  const filteredMovements = useMemo(() => {
    if (!searchQuery.trim()) return movements;
    const query = searchQuery.toLowerCase();
    return movements.filter(m => 
      m.code.toLowerCase().includes(query) || 
      (m.description || '').toLowerCase().includes(query)
    );
  }, [movements, searchQuery]);

  return {
    movements: filteredMovements,
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
    totalQuantity,
    totalCostVal,
    fetchMovements,
    fetchWarehouses,
    resetForm,
    addDetail,
    removeDetail,
    saveMovement
  };
}
