import { useState, useCallback, useMemo } from 'react';
import { 
  Inventory, 
  CreateInventoryDto, 
  InventoryDetail,
  CreateInventoryDetailDto,
  Warehouse
} from '@kplian/core';
import { 
  InventoryRepositoryImpl, 
  InventoryDetailRepositoryImpl,
  WarehouseRepositoryImpl
} from '@kplian/infrastructure';
import { useVendor } from '@/hooks/use-vendor';

const inventoryRepo = new InventoryRepositoryImpl();
const detailRepo = new InventoryDetailRepositoryImpl();
const warehouseRepo = new WarehouseRepositoryImpl();

export interface InventoryDraft {
  warehouseId: string;
  inventoryDate: string;
}

export function useInventory() {
  const { vendorCode } = useVendor();
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<InventoryDetail[]>([]);
  const [editingInventoryId, setEditingInventoryId] = useState<string | null>(null);

  const loadInventoryRelations = useCallback(async (inventoryId: string) => {
    setLoading(true);
    try {
      const detailsData = await detailRepo.getByInventory(inventoryId);
      setSelectedDetails(detailsData);
      return detailsData;
    } catch (err) {
      console.error('Failed to load inventory details:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const [inventoryDraft, setInventoryDraft] = useState<InventoryDraft>({
    warehouseId: '',
    inventoryDate: new Date().toISOString().split('T')[0],
  });

  const [details, setDetails] = useState<Omit<CreateInventoryDetailDto, 'inventoryId'>[]>([]);

  const fetchWarehouses = useCallback(async () => {
    try {
      const data = await warehouseRepo.getAll();
      setWarehouses(data);
      if (data.length > 0 && !inventoryDraft.warehouseId) {
        setInventoryDraft(p => ({ ...p, warehouseId: data[0].id }));
      }
    } catch (err) {
      console.error('Failed to fetch warehouses:', err);
    }
  }, [inventoryDraft.warehouseId]);

  const fetchInventories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data: Inventory[] = [];
      if (vendorCode) {
        data = await inventoryRepo.getByVendor(vendorCode);
      } else {
        data = await inventoryRepo.getAll();
      }

      const enriched = await Promise.all(data.map(async (inventory) => {
        try {
          const detailsData = await detailRepo.getByInventory(inventory.id);
          return {
            ...inventory,
            inventoryDetails: detailsData
          };
        } catch (err) {
          console.error(`Failed enriched details for inventory ${inventory.id}:`, err);
          return inventory;
        }
      }));
      setInventories(enriched);
    } catch (err: any) {
      console.error('Failed to fetch inventories:', err);
      setError(err.message || 'Error loading inventories');
    } finally {
      setLoading(false);
    }
  }, [vendorCode]);

  const totalItemsCount = useMemo(() => {
    return details.length;
  }, [details]);

  const totalRealQuantity = useMemo(() => {
    return details.reduce((sum, item) => sum + (item.realQuantity || 0), 0);
  }, [details]);

  const totalInventoryQuantity = useMemo(() => {
    return details.reduce((sum, item) => sum + (item.inventoryQuantity || 0), 0);
  }, [details]);

  const resetForm = useCallback(() => {
    setEditingInventoryId(null);
    setInventoryDraft({
      warehouseId: warehouses.length > 0 ? warehouses[0].id : '',
      inventoryDate: new Date().toISOString().split('T')[0],
    });
    setDetails([]);
  }, [warehouses]);

  const startEdit = useCallback((inventory: Inventory, detailsList: InventoryDetail[]) => {
    setEditingInventoryId(inventory.id);
    setInventoryDraft({
      warehouseId: inventory.warehouseId,
      inventoryDate: inventory.inventoryDate.split('T')[0],
    });
    setDetails(detailsList.map(d => ({
      itemCode: d.itemCode,
      inventoryQuantity: d.inventoryQuantity,
      realQuantity: d.realQuantity,
      unitCost: d.unitCost
    })));
  }, []);

  const addDetail = useCallback((item: Omit<CreateInventoryDetailDto, 'inventoryId'>) => {
    setDetails(prev => [...prev, item]);
  }, []);

  const removeDetail = useCallback((index: number) => {
    setDetails(prev => prev.filter((_, i) => i !== index));
  }, []);

  const saveInventory = useCallback(async () => {
    if (!inventoryDraft.warehouseId) {
      throw new Error('Warehouse selection is required.');
    }
    if (details.length === 0) {
      throw new Error('At least one item detail is required.');
    }

    setLoading(true);
    const payload: any = {
      vendorCode: vendorCode || 'SYSTEM',
      warehouseId: inventoryDraft.warehouseId,
      inventoryDate: new Date(inventoryDraft.inventoryDate).toISOString(),
      inventoryDetails: details.map(d => ({
        itemCode: d.itemCode,
        inventoryQuantity: d.inventoryQuantity || 0,
        realQuantity: d.realQuantity || 0,
        unitCost: d.unitCost || 0,
      }))
    };

    try {
      let created;
      if (editingInventoryId) {
        created = await inventoryRepo.update({ ...payload, id: editingInventoryId });
      } else {
        created = await inventoryRepo.create(payload);
      }
      await fetchInventories();
      resetForm();
      return created;
    } catch (err: any) {
      console.error('[useInventory Debug] Error saving inventory:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [vendorCode, inventoryDraft, details, editingInventoryId, fetchInventories, resetForm]);

  const filteredInventories = useMemo(() => {
    if (!searchQuery.trim()) return inventories;
    const query = searchQuery.toLowerCase();
    return inventories.filter(inv => {
      const name = (inv.warehouse?.name || '').toLowerCase();
      return name.includes(query) || inv.inventoryDate.includes(query);
    });
  }, [inventories, searchQuery]);

  return {
    inventories: filteredInventories,
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
    setEditingInventoryId,
    startEdit,
    totalItemsCount,
    totalRealQuantity,
    totalInventoryQuantity,
    fetchInventories,
    fetchWarehouses,
    resetForm,
    addDetail,
    removeDetail,
    saveInventory
  };
}
