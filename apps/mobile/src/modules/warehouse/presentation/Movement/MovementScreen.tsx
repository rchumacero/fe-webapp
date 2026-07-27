import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ActivityIndicator, 
  Alert, 
  ScrollView,
  Pressable,
  SafeAreaView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@kplian/i18n';
import { Colors, Spacing, Typography } from '../../../../shared/theme/constants';
import { useMovements, MovementDraft } from '../hooks/useMovements';
import { MainLayout } from '../../../../shared/layout/MainLayout';
import { loadDomainParameters, getBatchParameters, Movement, MovementDetail, MovementExtraCost } from '@kplian/core';
import { createApiClient, MovementExtraCostRepositoryImpl, MovementRepositoryImpl, MovementDetailRepositoryImpl } from '@kplian/infrastructure';
import { WORKFLOW_CONSTANTS } from '../workflowConstants';
import { styles } from './styles/MovementScreenStyles';

const workflowApi = createApiClient('workflow');
const extraCostRepo = new MovementExtraCostRepositoryImpl();
const movementRepo = new MovementRepositoryImpl();

const FILTER_STATUSES = [
  { label: 'Borrador', value: 'draft' },
  { label: 'En Proceso', value: 'in_progress' },
  { label: 'Finalizado/Cancelado', value: 'finished_cancelled' },
];
const detailRepo = new MovementDetailRepositoryImpl();

interface MovementScreenProps {
  type: 'in' | 'out';
  onBack: () => void;
  onNavigate?: (route: string) => void;
}

export default function MovementScreen({ type, onBack, onNavigate }: MovementScreenProps) {
  const { t } = useTranslation();
  const workflow = type === 'in' ? WORKFLOW_CONSTANTS.MOVEMENT_RECEIPT : WORKFLOW_CONSTANTS.MOVEMENT_ISSUE;
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
    totalQuantity,
    totalCostVal,
    fetchMovements,
    fetchWarehouses,
    resetForm,
    addDetail,
    removeDetail,
    saveMovement
  } = useMovements(type);

  // Screen Modals Visibility
  const [editorVisible, setEditorVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [activeMenuMovementId, setActiveMenuMovementId] = useState<string | null>(null);
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);

  // Extra Cost Management State
  const [extraCostModalVisible, setExtraCostModalVisible] = useState(false);
  const [extraCostTarget, setExtraCostTarget] = useState<{
    type: 'parent' | 'detail';
    movementId?: string;
    movementDetailId?: string;
    label: string;
  } | null>(null);
  const [extraCosts, setExtraCosts] = useState<MovementExtraCost[]>([]);
  const [extraCostsLoading, setExtraCostsLoading] = useState(false);

  // Extra Cost Create/Edit Form State
  const [extraCostFormMode, setExtraCostFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingExtraCost, setEditingExtraCost] = useState<MovementExtraCost | null>(null);
  const [formExtraCostCode, setFormExtraCostCode] = useState('');
  const [formCostAmount, setFormCostAmount] = useState('');
  const [formMeasureUnitCode, setFormMeasureUnitCode] = useState('BOB');
  const [formExtraCostNotes, setFormExtraCostNotes] = useState('');

  const extraCostOptions = [
    { CODE: 'FLETE', name: 'Flete / Transporte' },
    { CODE: 'SEGURO', name: 'Seguro de Carga' },
    { CODE: 'ARANCEL', name: 'Arancel / Impuesto' },
    { CODE: 'MANIPULEO', name: 'Manipuleo / Carga' },
    { CODE: 'OTRO', name: 'Otro Costo Adicional' }
  ];

  // Sub-forms visibility & local state
  const [showInlineItemForm, setShowInlineItemForm] = useState(false);
  const [localItem, setLocalItem] = useState({
    itemCode: '',
    quantity: '1',
    measureUnitCode: 'UNIDAD',
    costAmount: '0'
  });

  const calculatedTotalCost = useMemo(() => {
    const qty = parseFloat(localItem.quantity) || 0;
    const cost = parseFloat(localItem.costAmount) || 0;
    return (qty * cost).toFixed(2);
  }, [localItem.quantity, localItem.costAmount]);

  // Dropdown helper state
  const [pickerModal, setPickerModal] = useState<{
    visible: boolean;
    title: string;
    data: { CODE: string; name: string }[];
    selectedValue: string;
    onSelect: (val: string) => void;
  }>({
    visible: false,
    title: '',
    data: [],
    selectedValue: '',
    onSelect: () => {},
  });

  const [itemOptions, setItemOptions] = useState<{ CODE: string; name: string }[]>([]);

  // Subtype options based on movement type
  const subtypeOptions = useMemo(() => {
    if (type === 'in') {
      return [
        { CODE: 'ING_COMPRAS', name: 'Compras / Proveedor' },
        { CODE: 'ING_AJUSTE', name: 'Ajuste de Inventario (+)' },
        { CODE: 'ING_DEVOLUCION', name: 'Devolución de Cliente' },
        { CODE: 'ING_TRASPASO', name: 'Traspaso entre Almacenes' }
      ];
    } else {
      return [
        { CODE: 'EGR_VENTAS', name: 'Venta / Entrega' },
        { CODE: 'EGR_AJUSTE', name: 'Ajuste de Inventario (-)' },
        { CODE: 'EGR_PRODUCCION', name: 'Consumo para Producción' },
        { CODE: 'EGR_TRASPASO', name: 'Traspaso entre Almacenes' }
      ];
    }
  }, [type]);

  const currencyOptions = [
    { CODE: 'BOB', name: 'BOB - Boliviano' },
    { CODE: 'USD', name: 'USD - Dólar' }
  ];

  // Load items from parameters on mount
  useEffect(() => {
    const fetchParams = async () => {
      try {
        const mapped = await loadDomainParameters(
          getBatchParameters,
          [{ fullCode: 'WAR/MAIN/ITEM' }]
        );
        if (mapped['WAR/MAIN/ITEM']) {
          const list = mapped['WAR/MAIN/ITEM'].map((x: any) => ({
            CODE: x.CODE || x.code,
            name: x.NAME || x.name || x.description || x.CODE || x.code
          }));
          setItemOptions(list);
          if (list.length > 0) {
            setLocalItem(prev => ({ ...prev, itemCode: list[0].CODE }));
          }
        }
      } catch (err) {
        console.error('Failed to load item parameters:', err);
      }
    };
    fetchParams();
  }, []);

  useEffect(() => {
    fetchMovements();
    fetchWarehouses();
  }, [fetchMovements, fetchWarehouses]);

  // Statistics calculation for the day
  const stats = useMemo(() => {
    let completedCount = movements.length;
    let totalItemsProcessed = movements.reduce((sum, m) => {
      return sum + (m.movementDetails?.reduce((dSum, d) => dSum + (d.quantity || 0), 0) || 0);
    }, 0);
    let totalValuation = movements.reduce((sum, m) => {
      return sum + (m.movementDetails?.reduce((dSum, d) => dSum + ((d.costAmount || 0) * (d.quantity || 0)), 0) || 0);
    }, 0);

    return {
      totalTransactions: completedCount,
      itemsProcessed: totalItemsProcessed,
      valuation: totalValuation
    };
  }, [movements]);

  const openDropdownPicker = (
    title: string,
    data: { CODE: string; name: string }[],
    selectedValue: string,
    onSelect: (val: string) => void
  ) => {
    setPickerModal({
      visible: true,
      title,
      data,
      selectedValue,
      onSelect,
    });
  };

  const sanitizeCostInput = (val: string) => {
    let clean = val.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) {
      clean = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts.length > 1 && parts[1].length > 2) {
      clean = parts[0] + '.' + parts[1].slice(0, 2);
    }
    return clean;
  };

  const getStatusBadgeStyle = (status?: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'draft':
        return { bg: 'rgba(255, 255, 255, 0.1)', text: '#9e9e9e', label: 'Borrador' };
      case 'requested':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', label: 'En Proceso' };
      case 'finished':
        return { bg: 'rgba(76, 175, 80, 0.15)', text: '#4caf50', label: 'Finalizado' };
      case 'cancel':
      case 'cancelled':
      case 'deleted':
        return { bg: 'rgba(244, 67, 54, 0.15)', text: '#f44336', label: s === 'deleted' ? 'Eliminado' : 'Cancelado' };
      default:
        return { bg: 'rgba(255, 255, 255, 0.05)', text: Colors.foreground, label: status || '' };
    }
  };

  const renderPickerOverlay = () => {
    if (!pickerModal.visible) return null;
    return (
      <Pressable 
        style={styles.pickerOverlay} 
        onPress={() => setPickerModal(p => ({ ...p, visible: false }))}
      >
        <Pressable style={styles.pickerContent} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.pickerTitle}>{pickerModal.title}</Text>
          <View style={styles.pickerDivider} />
          <FlatList
            data={pickerModal.data}
            keyExtractor={(item, idx) => (item.CODE || idx.toString())}
            renderItem={({ item }) => {
              const code = item.CODE;
              const name = item.name;
              const isSelected = pickerModal.selectedValue === code;

              return (
                <TouchableOpacity 
                  style={[styles.pickerItem, isSelected && styles.activePickerItem]} 
                  onPress={() => {
                    pickerModal.onSelect(code);
                    setPickerModal(p => ({ ...p, visible: false }));
                  }}
                >
                  <Text style={[styles.pickerLabel, isSelected && styles.activePickerLabel]}>
                    {name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </Pressable>
      </Pressable>
    );
  };

  const [editingDetailIndex, setEditingDetailIndex] = useState<number | null>(null);

  const handleOpenCreateForm = () => {
    setEditingMovement(null);
    setEditingDetailIndex(null);
    resetForm();
    setEditorVisible(true);
  };

  const openEditMovementModal = (mvt: Movement) => {
    setEditingMovement(mvt);
    setEditingDetailIndex(null);
    setMovementDraft({
      warehouseId: mvt.warehouseId,
      movementDate: mvt.movementDate ? mvt.movementDate.split('T')[0] : new Date().toISOString().split('T')[0],
      subtype: mvt.subtype || (type === 'in' ? 'ING_COMPRAS' : 'EGR_VENTAS'),
      currencyCode: mvt.currencyCode || 'BOB',
      description: mvt.description || '',
      warehousePersonCode: mvt.warehousePersonCode || '',
      personCode: mvt.personCode || '',
    });
    if (mvt.movementDetails) {
      setDetails(mvt.movementDetails.map(d => ({
        id: (d as any).id,
        itemCode: d.itemCode,
        quantity: d.quantity,
        measureUnitCode: d.measureUnitCode || 'UNIDAD',
        costAmount: d.costAmount,
      })));
    } else {
      setDetails([]);
    }
    setEditorVisible(true);
  };

  const handleDeleteMovement = (id: string, code: string, status?: string) => {
    const doDelete = async () => {
      try {
        await movementRepo.delete(id);
        Alert.alert('Éxito', 'Movimiento eliminado correctamente.');
        await fetchMovements();
      } catch (error: any) {
        console.error('Error deleting movement:', error);
        Alert.alert('Error', error?.response?.data?.message || 'Error al eliminar el movimiento.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`¿Está seguro de que desea eliminar el movimiento ${code}?`);
      if (confirmed) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Eliminar Movimiento',
        `¿Está seguro de que desea eliminar el movimiento ${code}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Eliminar', 
            style: 'destructive',
            onPress: doDelete
          }
        ]
      );
    }
  };

  const handleEditDetail = (index: number) => {
    const target = details[index];
    setEditingDetailIndex(index);
    setLocalItem({
      itemCode: target.itemCode,
      quantity: (target.quantity || 0).toString(),
      measureUnitCode: target.measureUnitCode || 'UNIDAD',
      costAmount: (target.costAmount || 0).toString(),
    });
    setShowInlineItemForm(true);
  };

  const handleSaveItem = () => {
    if (!localItem.itemCode) {
      Alert.alert('Error', 'Debe seleccionar un ítem.');
      return;
    }
    const qty = parseInt(localItem.quantity, 10);
    if (isNaN(qty) || qty <= 0 || String(qty) !== localItem.quantity) {
      Alert.alert('Error', 'La cantidad debe ser un número entero positivo.');
      return;
    }
    const cost = type === 'out' ? 0 : parseFloat(localItem.costAmount);
    if (type !== 'out' && (isNaN(cost) || cost < 0)) {
      Alert.alert('Error', 'El costo unitario debe ser un valor numérico positivo.');
      return;
    }
    const itemData = {
      itemCode: localItem.itemCode,
      quantity: qty,
      measureUnitCode: localItem.measureUnitCode,
      costAmount: cost,
      totalCost: qty * cost
    };

    if (editingDetailIndex !== null) {
      const updated = [...details];
      updated[editingDetailIndex] = {
        ...updated[editingDetailIndex],
        ...itemData
      };
      setDetails(updated);
      setEditingDetailIndex(null);
    } else {
      addDetail(itemData);
    }

    setShowInlineItemForm(false);
    setLocalItem(prev => ({
      itemCode: itemOptions.length > 0 ? itemOptions[0].CODE : '',
      quantity: '1',
      measureUnitCode: 'UNIDAD',
      costAmount: '0'
    }));
  };

  const handleConfirmMovement = async () => {
    try {
      if (!movementDraft.warehouseId) {
        Alert.alert('Error', 'Debe seleccionar un almacén.');
        return;
      }
      if (details.length === 0) {
        Alert.alert('Error', 'Debe agregar al menos un ítem al movimiento.');
        return;
      }

      if (editingMovement) {
        await movementRepo.update({
          id: editingMovement.id,
          vendorCode: editingMovement.vendorCode || 'SYSTEM',
          code: editingMovement.code,
          warehouseId: movementDraft.warehouseId,
          movementDate: new Date(movementDraft.movementDate).toISOString(),
          type: type.toLowerCase(),
          subtype: movementDraft.subtype,
          currencyCode: movementDraft.currencyCode,
          description: movementDraft.description,
          warehousePersonCode: movementDraft.warehousePersonCode || 'SYSTEM',
          personCode: movementDraft.personCode || 'SYSTEM',
          movementDetails: details.map(d => ({
            id: (d as any).id,
            itemCode: d.itemCode,
            quantity: d.quantity || 0,
            measureUnitCode: d.measureUnitCode || 'UNIDAD',
            costAmount: d.costAmount || 0,
          }))
        } as any);
        setEditorVisible(false);
        setEditingMovement(null);
        await fetchMovements();
        Alert.alert('Éxito', 'Movimiento actualizado con éxito.');
      } else {
        await saveMovement();
        setEditorVisible(false);
        Alert.alert('Éxito', 'Movimiento registrado con éxito.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al guardar el movimiento.');
    }
  };

  const handleCardPress = (mvt: Movement) => {
    openEditMovementModal(mvt);
  };

  const getSubtypeLabel = (code: string) => {
    const found = [...subtypeOptions, ...subtypeOptions].find(x => x.CODE === code);
    return found ? found.name : code;
  };

  const getWarehouseName = (id?: string) => {
    if (!id) return 'Default';
    const found = warehouses.find(w => w.id === id);
    return found ? found.name : 'Almacén';
  };

  const handleNext = (movement: Movement) => {
    const doNext = async () => {
      try {
        const status = (movement.status || '').toLowerCase();
        if (type === 'in') {
          if (status === 'draft') {
            await movementRepo.requestIn(movement.id);
          } else if (status === 'requested') {
            await movementRepo.finishIn(movement.id);
          } else {
            throw new Error(`Invalid status for Goods Receipt transition: ${movement.status}`);
          }
        } else if (type === 'out') {
          if (status === 'draft') {
            await movementRepo.requestOut(movement.id);
          } else if (status === 'requested') {
            await movementRepo.finishOut(movement.id);
          } else {
            throw new Error(`Invalid status for Goods Issue transition: ${movement.status}`);
          }
        }
        Alert.alert('Success', 'Successfully moved to next step.');
        await fetchMovements();
      } catch (error: any) {
        console.error('Error transitioning movement:', error);
        Alert.alert('Error', error?.response?.data?.message || error?.message || 'Failed to move to next step.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to move movement ${movement.code} to the next step?`);
      if (confirmed) {
        doNext();
      }
    } else {
      Alert.alert(
        'Next Step',
        `Are you sure you want to move movement ${movement.code} to the next step?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Confirm', 
            onPress: doNext
          }
        ]
      );
    }
  };

  const handleCancel = (movement: Movement) => {
    const doCancel = async () => {
      try {
        await workflowApi.post('/v1/state-machine/transition', {
          entity: workflow.entity,
          processName: workflow.processName,
          id: movement.id,
          action: 'annul'
        });
        Alert.alert('Success', 'Successfully cancelled.');
        await fetchMovements();
      } catch (error: any) {
        console.error('Error cancelling action:', error);
        Alert.alert('Error', error?.response?.data?.message || 'Failed to cancel action.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to cancel the action for movement ${movement.code}?`);
      if (confirmed) {
        doCancel();
      }
    } else {
      Alert.alert(
        'Cancel Action',
        `Are you sure you want to cancel the action for movement ${movement.code}?`,
        [
          { text: 'No', style: 'cancel' },
          { 
            text: 'Confirm', 
            onPress: doCancel
          }
        ]
      );
    }
  };

  const fetchExtraCosts = useCallback(async (target: { type: 'parent' | 'detail'; movementId?: string; movementDetailId?: string }) => {
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
      console.error('Error fetching extra costs:', err);
      Alert.alert('Error', 'No se pudieron cargar los costos extra.');
    } finally {
      setExtraCostsLoading(false);
    }
  }, []);

  const openParentExtraCosts = (movementId: string, code: string) => {
    const target = { type: 'parent' as const, movementId, label: `Movimiento ${code}` };
    setExtraCostTarget(target);
    setExtraCostModalVisible(true);
    fetchExtraCosts(target);
  };

  const openDetailExtraCosts = (movementDetailId: string, itemCode: string) => {
    const target = { type: 'detail' as const, movementDetailId, label: `Ítem ${itemCode}` };
    setExtraCostTarget(target);
    setExtraCostModalVisible(true);
    fetchExtraCosts(target);
  };

  const openCreateExtraCostForm = () => {
    setEditingExtraCost(null);
    setFormExtraCostCode('FLETE');
    setFormCostAmount('');
    setFormMeasureUnitCode('BOB');
    setFormExtraCostNotes('');
    setExtraCostFormMode('create');
  };

  const openEditExtraCostForm = (ec: MovementExtraCost) => {
    setEditingExtraCost(ec);
    setFormExtraCostCode(ec.extraCostCode || 'FLETE');
    setFormCostAmount(ec.costAmount !== undefined ? String(ec.costAmount) : '');
    setFormMeasureUnitCode(ec.measureUnitCode || 'BOB');
    setFormExtraCostNotes(ec.notes || '');
    setExtraCostFormMode('edit');
  };

  const handleSaveExtraCost = async () => {
    if (!extraCostTarget) return;
    if (!formExtraCostCode || !formCostAmount || parseFloat(formCostAmount) <= 0) {
      Alert.alert('Error', 'Ingrese un código y monto válido.');
      return;
    }

    setExtraCostsLoading(true);
    try {
      const amount = parseFloat(formCostAmount);
      if (extraCostFormMode === 'create') {
        await extraCostRepo.create({
          movementId: extraCostTarget.type === 'parent' ? extraCostTarget.movementId : undefined,
          movementDetailId: extraCostTarget.type === 'detail' ? extraCostTarget.movementDetailId : undefined,
          extraCostCode: formExtraCostCode,
          costAmount: amount,
          measureUnitCode: formMeasureUnitCode,
          notes: formExtraCostNotes || undefined
        });
        Alert.alert('Éxito', 'Costo extra registrado correctamente.');
      } else if (extraCostFormMode === 'edit' && editingExtraCost) {
        await extraCostRepo.update({
          id: editingExtraCost.id,
          movementId: extraCostTarget.type === 'parent' ? extraCostTarget.movementId : undefined,
          movementDetailId: extraCostTarget.type === 'detail' ? extraCostTarget.movementDetailId : undefined,
          extraCostCode: formExtraCostCode,
          costAmount: amount,
          measureUnitCode: formMeasureUnitCode,
          notes: formExtraCostNotes || undefined
        });
        Alert.alert('Éxito', 'Costo extra actualizado correctamente.');
      }
      setExtraCostFormMode(null);
      fetchExtraCosts(extraCostTarget);
      if (editingMovement) {
        const detailsData = await detailRepo.getByMovement(editingMovement.id);
        setDetails(detailsData.map(d => ({
          id: (d as any).id,
          itemCode: d.itemCode,
          quantity: d.quantity,
          measureUnitCode: d.measureUnitCode || 'UNIDAD',
          costAmount: d.costAmount,
        })));
        await fetchMovements();
      }
    } catch (err) {
      console.error('Error saving extra cost:', err);
      Alert.alert('Error', 'No se pudo guardar el costo extra.');
    } finally {
      setExtraCostsLoading(false);
    }
  };

  const handleDeleteExtraCost = (id: string) => {
    const doDelete = async () => {
      if (!extraCostTarget) return;
      setExtraCostsLoading(true);
      try {
        await extraCostRepo.delete(id);
        Alert.alert('Éxito', 'Costo extra eliminado.');
        fetchExtraCosts(extraCostTarget);
        if (editingMovement) {
          const detailsData = await detailRepo.getByMovement(editingMovement.id);
          setDetails(detailsData.map(d => ({
            id: (d as any).id,
            itemCode: d.itemCode,
            quantity: d.quantity,
            measureUnitCode: d.measureUnitCode || 'UNIDAD',
            costAmount: d.costAmount,
          })));
          await fetchMovements();
        }
      } catch (err) {
        console.error('Error deleting extra cost:', err);
        Alert.alert('Error', 'No se pudo eliminar el costo extra.');
      } finally {
        setExtraCostsLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('¿Está seguro de que desea eliminar este costo extra?');
      if (confirmed) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Eliminar Costo Extra',
        '¿Está seguro de que desea eliminar este costo extra?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Eliminar', 
            style: 'destructive',
            onPress: doDelete
          }
        ]
      );
    }
  };

  const renderMovementItem = ({ item }: { item: Movement }) => {
    const qty = item.movementDetails?.reduce((sum, d) => sum + (d.quantity || 0), 0) || 0;
    const costVal = item.movementDetails?.reduce((sum, d) => sum + ((d.costAmount || 0) * (d.quantity || 0)), 0) || 0;
    const displayCode = item.code;
    const displayDate = item.movementDate.split('T')[0];

    return (
      <View 
        style={[
          styles.cardItem, 
          { zIndex: activeMenuMovementId === item.id ? 100 : 1, overflow: 'visible' }
        ]} 
      >
        {/* Card Header Row with 3-dots Menu */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: activeMenuMovementId === item.id ? 10 : 1, marginBottom: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <Text style={styles.customerName}>{`Mov: ${displayCode}`}</Text>
            <View style={[styles.badge, type === 'in' ? styles.badgeSuccess : styles.badgeWarning]}>
              <Text style={[styles.badgeText, type === 'in' ? styles.badgeTextSuccess : styles.badgeTextWarning]}>
                {type === 'in' ? 'Entrada' : 'Salida'}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: getStatusBadgeStyle(item.status).bg }]}>
              <Text style={[styles.badgeText, { color: getStatusBadgeStyle(item.status).text }]}>
                {getStatusBadgeStyle(item.status).label}
              </Text>
            </View>
            {type === 'out' && item.sufficientStock !== undefined && (
              <View style={[
                styles.badge, 
                item.sufficientStock ? styles.badgeSuccess : styles.badgeDanger
              ]}>
                <Text style={[
                  styles.badgeText, 
                  item.sufficientStock ? styles.badgeTextSuccess : styles.badgeTextDanger
                ]}>
                  {item.sufficientStock ? 'Stock Suficiente' : 'Stock Insuficiente'}
                </Text>
              </View>
            )}
          </View>

          {/* 3-dots Menu Trigger */}
          <View style={{ position: 'relative', zIndex: 999 }}>
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 10, padding: 8 }]}
              onPress={(e) => {
                e.stopPropagation();
                setActiveMenuMovementId(activeMenuMovementId === item.id ? null : item.id);
              }}
            >
              <Ionicons name="ellipsis-vertical" size={20} color={Colors.foreground} />
            </TouchableOpacity>

            {/* Dropdown Menu Overlay */}
            {activeMenuMovementId === item.id && (
              <>
                <Pressable 
                  style={{
                    position: 'absolute',
                    top: -1000,
                    left: -1000,
                    right: -1000,
                    bottom: -1000,
                    zIndex: 998,
                  }}
                  onPress={() => setActiveMenuMovementId(null)}
                />
                <View style={[styles.dropdownMenu, { zIndex: 9999 }]}>
                  <TouchableOpacity 
                    style={styles.dropdownMenuItem}
                    onPress={(e) => {
                      e.stopPropagation();
                      setActiveMenuMovementId(null);
                      openEditMovementModal(item);
                    }}
                  >
                    <Text style={styles.dropdownMenuText}>Edit</Text>
                  </TouchableOpacity>



                  <View style={styles.dropdownDivider} />

                  <TouchableOpacity 
                    style={styles.dropdownMenuItem}
                    onPress={(e) => {
                      e.stopPropagation();
                      setActiveMenuMovementId(null);
                      handleDeleteMovement(item.id, item.code, item.status);
                    }}
                  >
                    <Text style={[styles.dropdownMenuText, { color: Colors.destructive }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>

        <Text style={styles.dateAndCodeText}>
          {`📅 ${displayDate} · Almacén: ${getWarehouseName(item.warehouseId)}`}
        </Text>
        <Text style={styles.subtypeText}>
          {`Motivo: ${getSubtypeLabel(item.subtype || '')}`}
        </Text>

        <View style={styles.cardDivider} />
        
        <View style={styles.cardFooter}>
          <Text style={styles.footerTotal}>
            {`Bs ${costVal.toFixed(2)}`}
          </Text>
          <View style={styles.footerRight}>
            <Text style={styles.paymentMethodLabel}>
              {`${qty} items · ${item.currencyCode || 'BOB'}`}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xs, paddingTop: 2, zIndex: 0 }}>
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            onPress={(e) => {
              e.stopPropagation();
              handleCancel(item);
            }}
          >
            <Ionicons name="close-circle-outline" size={20} color={Colors.muted} />
            <Text style={{ color: Colors.muted, fontSize: Typography.sizes.sm, fontWeight: 'bold' }}>Cancel</Text>
          </TouchableOpacity>

          {statusFilter !== 'finished_cancelled' && (
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              onPress={(e) => {
                e.stopPropagation();
                handleNext(item);
              }}
            >
              <Ionicons name="arrow-forward-circle-outline" size={20} color={Colors.primary} />
              <Text style={{ color: Colors.primary, fontSize: Typography.sizes.sm, fontWeight: 'bold' }}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const titleText = type === 'in' ? 'Entrada de Mercancía' : 'Salida de Mercancía';
  const statsLabel = type === 'in' ? 'Mercancía ingresada' : 'Mercancía retirada';

  return (
    <MainLayout headerTitle={titleText} onNavigate={onNavigate}>
      {/* Header bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerTitleContainer}>
          <Ionicons name={type === 'in' ? "cloud-download-outline" : "cloud-upload-outline"} size={24} color={Colors.primary} />
          <Text style={styles.headerTitleText}>{titleText}</Text>
        </View>
        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.headerActionButton} onPress={() => {}}>
            <Ionicons name="search" size={20} color={Colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.mainScroll} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* RESUMEN DEL DÍA section */}
        <Text style={styles.subHeadingText}>RESUMEN DEL DÍA</Text>
        <View style={styles.analyticsContainer}>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>Transacciones</Text>
            <Text style={styles.analyticsValue}>{stats.totalTransactions}</Text>
            <Text style={styles.analyticsSubGreen}>Hoy</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>{statsLabel}</Text>
            <Text style={styles.analyticsValue}>{`${stats.itemsProcessed} und.`}</Text>
            <Text style={styles.analyticsSubOrange}>{`Valor: Bs ${stats.valuation.toFixed(2)}`}</Text>
          </View>
        </View>

        {/* RECIENTES list header row */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          paddingRight: Spacing.md, 
          marginTop: Spacing.md,
          marginBottom: Spacing.sm
        }}>
          <Text style={[styles.subHeadingText, { marginTop: 0, marginBottom: 0, paddingRight: 0 }]}>
            MOVIMIENTOS RECIENTES
          </Text>
          <TouchableOpacity 
            onPress={handleOpenCreateForm}
            style={{ padding: 4 }}
          >
            <Ionicons name="add-circle" size={32} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Status Filters Section */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filtersScroll} 
          contentContainerStyle={styles.filtersContainer}
        >
          {FILTER_STATUSES.map((status) => {
            const isSelected = statusFilter === status.value;
            return (
              <TouchableOpacity
                key={status.value}
                style={[
                  styles.filterBadgeCard,
                  isSelected && styles.filterBadgeCardActive
                ]}
                onPress={() => setStatusFilter(status.value)}
              >
                <Text style={[
                  styles.filterBadgeCardText,
                  isSelected && styles.filterBadgeCardTextActive
                ]}>
                  {status.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : movements.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="layers-outline" size={60} color={Colors.muted} />
            <Text style={styles.emptyText}>No se encontraron movimientos.</Text>
            <Text style={styles.emptySubText}>{`Presione el botón "+" arriba para empezar.`}</Text>
          </View>
        ) : (
          movements.map(item => (
            <React.Fragment key={item.id}>
              {renderMovementItem({ item })}
            </React.Fragment>
          ))
        )}
      </ScrollView>

      {/* DETALLE MOVIMIENTO MODAL */}
      {selectedMovement && (
        <Modal
          visible={detailVisible}
          animationType="slide"
          onRequestClose={() => setDetailVisible(false)}
        >
          <SafeAreaView style={styles.modalRoot}>
            {/* Header detail */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setDetailVisible(false)} style={styles.headerIconButton}>
                <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Detalle Movimiento</Text>
              <View style={[
                styles.badge, 
                type === 'in' ? styles.badgeSuccess : styles.badgeWarning
              ]}>
                <Text style={[
                  styles.badgeText, 
                  type === 'in' ? styles.badgeTextSuccess : styles.badgeTextWarning
                ]}>
                  {type === 'in' ? 'Entrada' : 'Salida'}
                </Text>
              </View>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Movement Info Block */}
              <View style={styles.infoBlock}>
                <Text style={styles.infoCodeAndDate}>
                  {`Código: ${selectedMovement.code} • Fecha: ${selectedMovement.movementDate.split('T')[0]}`}
                </Text>
                <Text style={styles.infoCustomerName}>
                  {`Almacén: ${getWarehouseName(selectedMovement.warehouseId)}`}
                </Text>
                <Text style={styles.infoDocAndPayment}>
                  {`Motivo: ${getSubtypeLabel(selectedMovement.subtype || '')} • Moneda: ${selectedMovement.currencyCode || 'BOB'}`}
                </Text>
                {selectedMovement.description ? (
                  <Text style={styles.descriptionText}>
                    {`Nota: ${selectedMovement.description}`}
                  </Text>
                ) : null}

                {/* Parent Movement Extra Cost Trigger */}
                {type === 'in' && (
                  <TouchableOpacity 
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingVertical: 10, paddingHorizontal: Spacing.md, borderRadius: 12, marginTop: Spacing.sm, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' }}
                    onPress={() => openParentExtraCosts(selectedMovement.id, selectedMovement.code)}
                  >
                    <Ionicons name="pricetag" size={18} color={Colors.warning} />
                    <Text style={{ color: Colors.warning, fontSize: Typography.sizes.sm, fontWeight: 'bold' }}>
                      Costos Extra del Movimiento (Nivel Padre)
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Items Section */}
              <Text style={styles.subHeadingText}>ÍTEMS REGISTRADOS</Text>
              <View style={styles.tabContentContainer}>
                {selectedDetails.map((item, index) => (
                  <View key={item.id || index} style={styles.detailItemRow}>
                    <View style={styles.detailItemLeft}>
                      <View style={styles.numberCircle}>
                        <Text style={styles.numberCircleText}>{index + 1}</Text>
                      </View>
                      <View style={styles.detailItemInfo}>
                        <Text style={styles.detailItemName}>{item.itemCode}</Text>
                        <Text style={styles.detailItemSub}>
                          {type === 'out'
                            ? `${item.quantity} ${item.measureUnitCode || 'UNIDAD'}`
                            : `${item.quantity} ${item.measureUnitCode || 'UNIDAD'} · Costo Unitario: Bs ${(item.costAmount || 0).toFixed(2)}`}
                        </Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      {type !== 'out' && (
                        <Text style={styles.detailItemPrice}>
                          {`Bs ${((item.costAmount || 0) * (item.quantity || 0)).toFixed(2)}`}
                        </Text>
                      )}
                      {/* Detail Level Extra Cost Trigger */}
                      {type === 'in' && (
                        <TouchableOpacity 
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 }}
                          onPress={() => openDetailExtraCosts(item.id, item.itemCode)}
                        >
                          <Ionicons name="pricetag-outline" size={14} color={Colors.warning} />
                          <Text style={{ color: Colors.warning, fontSize: Typography.sizes.xs, fontWeight: 'bold' }}>
                            Costo Extra Ítem
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}

                {/* Totals Summary */}
                {type !== 'out' && (
                  <>
                    <View style={styles.detailTotalDivider} />
                    <View style={styles.detailTotalRow}>
                      <Text style={styles.detailTotalLabel}>Valor total del movimiento</Text>
                      <Text style={styles.detailTotalValue}>
                        {`Bs ${selectedDetails.reduce((sum, d) => sum + ((d.costAmount || 0) * (d.quantity || 0)), 0).toFixed(2)}`}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}

      {/* NUEVO MOVIMIENTO FORM MODAL */}
      <Modal
        visible={editorVisible}
        animationType="slide"
        onRequestClose={() => setEditorVisible(false)}
      >
        <SafeAreaView style={styles.modalRoot}>
          {/* Header editor */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditorVisible(false)} style={styles.headerIconButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingMovement 
                ? `Editar ${type === 'in' ? 'Entrada' : 'Salida'} (${editingMovement.code})`
                : `Registrar ${type === 'in' ? 'Entrada' : 'Salida'}`}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {editingMovement && type === 'in' ? (
                <TouchableOpacity 
                  onPress={() => openParentExtraCosts(editingMovement.id, editingMovement.code)} 
                  style={styles.headerIconButton}
                >
                  <Ionicons name="pricetag-outline" size={22} color={Colors.warning} />
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity onPress={handleConfirmMovement} style={styles.headerIconButton}>
                <Ionicons name="checkmark-circle-outline" size={26} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.formPadding}>
              
              {/* Almacén Selection */}
              <Text style={styles.formInputHeading}>ALMACÉN DESTINO/ORIGEN</Text>
              <TouchableOpacity 
                style={styles.customerSelectorTrigger}
                onPress={() => openDropdownPicker('Seleccionar Almacén', warehouses.map(w => ({ CODE: w.id, name: w.name })), movementDraft.warehouseId, (val) => {
                  setMovementDraft((p: MovementDraft) => ({ ...p, warehouseId: val }));
                })}
              >
                <Ionicons name="business" size={20} color={Colors.muted} />
                <Text style={styles.customerSelectorValue}>
                  {getWarehouseName(movementDraft.warehouseId) || 'Seleccione Almacén...'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={Colors.muted} />
              </TouchableOpacity>

              {/* Fecha y Motivo */}
              <View style={styles.gridRow}>
                <View style={styles.gridCol}>
                  <Text style={styles.formFieldLabel}>Fecha</Text>
                  <TextInput 
                    style={styles.formTextInputSmall}
                    value={movementDraft.movementDate}
                    onChangeText={txt => setMovementDraft((p: MovementDraft) => ({ ...p, movementDate: txt }))}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.muted}
                  />
                </View>
                <View style={styles.gridCol}>
                  <Text style={styles.formFieldLabel}>Motivo</Text>
                  <TouchableOpacity 
                    style={styles.formPickerSelectorButton}
                    onPress={() => openDropdownPicker('Seleccionar Motivo', subtypeOptions, movementDraft.subtype, (val) => {
                      setMovementDraft((p: MovementDraft) => ({ ...p, subtype: val }));
                    })}
                  >
                    <Text style={styles.formPickerSelectorValue}>
                      {getSubtypeLabel(movementDraft.subtype)}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color={Colors.foreground} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Moneda y Notas */}
              <View style={styles.gridRow}>
                <View style={styles.gridCol}>
                  <Text style={styles.formFieldLabel}>Moneda</Text>
                  <TouchableOpacity 
                    style={styles.formPickerSelectorButton}
                    onPress={() => openDropdownPicker('Seleccionar Moneda', currencyOptions, movementDraft.currencyCode, (val) => {
                      setMovementDraft((p: MovementDraft) => ({ ...p, currencyCode: val }));
                    })}
                  >
                    <Text style={styles.formPickerSelectorValue}>
                      {movementDraft.currencyCode}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color={Colors.foreground} />
                  </TouchableOpacity>
                </View>
                <View style={styles.gridCol}>
                  <Text style={styles.formFieldLabel}>Notas / Comentario</Text>
                  <TextInput 
                    style={styles.formTextInputSmall}
                    value={movementDraft.description}
                    onChangeText={txt => setMovementDraft((p: MovementDraft) => ({ ...p, description: txt }))}
                    placeholder="Escriba un comentario..."
                    placeholderTextColor={Colors.muted}
                  />
                </View>
              </View>

              {/* Items Section */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.formInputHeading}>DETALLE ÍTEMS</Text>
                <TouchableOpacity 
                  style={styles.addItemInlineButton}
                  onPress={() => {
                    if (itemOptions.length === 0) {
                      Alert.alert('Error', 'No hay ítems cargados en el sistema.');
                      return;
                    }
                    setEditingDetailIndex(null);
                    setLocalItem({
                      itemCode: itemOptions[0]?.CODE || '',
                      quantity: '1',
                      measureUnitCode: 'UNIDAD',
                      costAmount: '0'
                    });
                    setShowInlineItemForm(true);
                  }}
                >
                  <Ionicons name="add-circle" size={18} color={Colors.primary} />
                  <Text style={styles.addItemInlineText}>Agregar ítem</Text>
                </TouchableOpacity>
              </View>

              {/* Inline Item Form */}
              {showInlineItemForm && (
                <View style={styles.inlineItemFormCard}>
                  <View style={styles.inlineItemFormHeader}>
                    <Text style={styles.inlineItemFormTitle}>
                      {editingDetailIndex !== null ? 'Editar Ítem' : 'Agregar Nuevo Ítem'}
                    </Text>
                    <TouchableOpacity onPress={() => setShowInlineItemForm(false)}>
                      <Ionicons name="close-circle" size={20} color={Colors.destructive} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.formFieldLabel}>Seleccionar Ítem</Text>
                  <TouchableOpacity 
                    style={styles.dropdownTrigger}
                    onPress={() => openDropdownPicker('Seleccionar Ítem', itemOptions, localItem.itemCode, val => {
                      setLocalItem(prev => ({ ...prev, itemCode: val }));
                    })}
                  >
                    <Text style={styles.dropdownValue}>
                      {localItem.itemCode || 'Seleccione un ítem...'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={Colors.muted} />
                  </TouchableOpacity>

                  {type === 'out' ? (
                    <View style={{ marginBottom: 15 }}>
                      <Text style={styles.formFieldLabel}>Cantidad</Text>
                      <TextInput 
                        style={styles.formTextInputSmall}
                        value={localItem.quantity}
                        onChangeText={txt => setLocalItem(prev => ({ ...prev, quantity: txt.replace(/[^0-9]/g, '') }))}
                        keyboardType="numeric"
                      />
                    </View>
                  ) : (
                    <>
                      <View style={styles.gridRow}>
                        <View style={styles.gridCol}>
                          <Text style={styles.formFieldLabel}>Cantidad</Text>
                          <TextInput 
                            style={styles.formTextInputSmall}
                            value={localItem.quantity}
                            onChangeText={txt => setLocalItem(prev => ({ ...prev, quantity: txt.replace(/[^0-9]/g, '') }))}
                            keyboardType="numeric"
                          />
                        </View>
                        <View style={styles.gridCol}>
                          <Text style={styles.formFieldLabel}>Costo Unitario (Bs)</Text>
                          <TextInput 
                            style={styles.formTextInputSmall}
                            value={localItem.costAmount}
                            onChangeText={txt => setLocalItem(prev => ({ ...prev, costAmount: sanitizeCostInput(txt) }))}
                            keyboardType="numeric"
                          />
                        </View>
                      </View>

                      <Text style={styles.formFieldLabel}>Costo Total (Bs)</Text>
                      <TextInput 
                        style={[styles.formTextInputSmall, { backgroundColor: 'rgba(255, 255, 255, 0.05)', color: Colors.muted }]}
                        value={isNaN(parseFloat(calculatedTotalCost)) ? '0.00' : calculatedTotalCost}
                        editable={false}
                      />
                    </>
                  )}

                  <TouchableOpacity style={styles.saveItemBtn} onPress={handleSaveItem}>
                    <Text style={styles.saveItemBtnText}>Confirmar Ítem</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Added Items List */}
              <View style={styles.itemsFormContainer}>
                {details.map((item, index) => (
                  <View key={index} style={styles.detailItemFormRow}>
                    <View style={styles.detailItemFormLeft}>
                      <View style={styles.numberCircle}>
                        <Text style={styles.numberCircleText}>{index + 1}</Text>
                      </View>
                      <View style={styles.detailItemInfo}>
                        <Text style={styles.detailItemName}>{item.itemCode}</Text>
                        <Text style={styles.detailItemSub}>
                          {type === 'out'
                            ? `${item.quantity} und.`
                            : `${item.quantity} und. x Bs ${(item.costAmount || 0).toFixed(2)}`}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailItemFormRight}>
                      {type !== 'out' && (
                        <Text style={styles.detailItemPrice}>
                          {`Bs ${((item.costAmount || 0) * (item.quantity || 0)).toFixed(2)}`}
                        </Text>
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        {item.id && type === 'in' ? (
                          <TouchableOpacity onPress={() => openDetailExtraCosts(item.id!, item.itemCode)}>
                            <Ionicons name="pricetag-outline" size={18} color={Colors.warning} />
                          </TouchableOpacity>
                        ) : null}
                        <TouchableOpacity onPress={() => handleEditDetail(index)}>
                          <Ionicons name="create-outline" size={18} color={Colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => removeDetail(index)}>
                          <Ionicons name="trash-outline" size={18} color={Colors.destructive} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}

                {details.length === 0 && (
                  <View style={styles.emptyItemsBox}>
                    <Text style={styles.emptyItemsText}>Aún no has agregado ítems.</Text>
                  </View>
                )}
              </View>

              {/* Total Calculation Display */}
              <View style={styles.formTotalSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Cantidad Total:</Text>
                  <Text style={styles.totalValue}>{`${totalQuantity} unidades`}</Text>
                </View>
                {type !== 'out' && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Costo Estimado:</Text>
                    <Text style={[styles.totalValue, { color: Colors.primary }]}>{`Bs ${totalCostVal.toFixed(2)}`}</Text>
                  </View>
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity style={styles.submitBtn} onPress={handleConfirmMovement}>
                <Text style={styles.submitBtnText}>{`Guardar ${type === 'in' ? 'Entrada' : 'Salida'}`}</Text>
              </TouchableOpacity>

            </View>
          </ScrollView>

          {renderPickerOverlay()}
        </SafeAreaView>
      </Modal>

      {/* EXTRA COSTS MANAGEMENT MODAL */}
      {extraCostTarget && (
        <Modal
          visible={extraCostModalVisible}
          animationType="slide"
          onRequestClose={() => setExtraCostModalVisible(false)}
        >
          <SafeAreaView style={styles.modalRoot}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setExtraCostModalVisible(false)} style={styles.headerIconButton}>
                <Ionicons name="close" size={24} color={Colors.foreground} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {`Costos Extra: ${extraCostTarget.label}`}
              </Text>
              <TouchableOpacity onPress={openCreateExtraCostForm} style={styles.headerIconButton}>
                <Ionicons name="add-circle-outline" size={26} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {extraCostsLoading && extraCosts.length === 0 ? (
                <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
              ) : extraCosts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="pricetag-outline" size={50} color={Colors.muted} />
                  <Text style={styles.emptyText}>No hay costos extra registrados.</Text>
                  <Text style={styles.emptySubText}>Presione "+" arriba para agregar un costo extra.</Text>
                </View>
              ) : (
                <View style={{ padding: Spacing.md, gap: Spacing.sm }}>
                  {extraCosts.map(ec => (
                    <View key={ec.id} style={{ backgroundColor: Colors.card, borderRadius: 16, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: Colors.foreground, fontSize: Typography.sizes.md, fontWeight: 'bold' }}>
                          {ec.extraCostCode}
                        </Text>
                        <Text style={{ color: Colors.primary, fontSize: Typography.sizes.md, fontWeight: 'bold', marginTop: 2 }}>
                          {`${ec.measureUnitCode || 'BOB'} ${parseFloat(String(ec.costAmount || 0)).toFixed(2)}`}
                        </Text>
                        {ec.notes ? (
                          <Text style={{ color: Colors.muted, fontSize: Typography.sizes.xs, marginTop: 4 }}>
                            {`Notas: ${ec.notes}`}
                          </Text>
                        ) : null}
                      </View>
                      {(!ec.movementId || !ec.movementDetailId) ? (
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                          <TouchableOpacity onPress={() => openEditExtraCostForm(ec)}>
                            <Ionicons name="create-outline" size={20} color={Colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteExtraCost(ec.id)}>
                            <Ionicons name="trash-outline" size={20} color={Colors.destructive} />
                          </TouchableOpacity>
                        </View>
                      ) : null}
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* FORM SUB-OVERLAY (CREATE / EDIT EXTRA COST) */}
            {extraCostFormMode !== null && (
              <Pressable style={styles.subModalOverlay} onPress={() => setExtraCostFormMode(null)}>
                <Pressable style={[styles.pickerContent, { maxHeight: '80%' }]} onPress={(e) => e.stopPropagation()}>
                  <Text style={styles.pickerTitle}>
                    {extraCostFormMode === 'create' ? 'Agregar Costo Extra' : 'Editar Costo Extra'}
                  </Text>
                  <View style={styles.pickerDivider} />

                  <Text style={styles.formFieldLabel}>Tipo de Costo Extra</Text>
                  <TouchableOpacity 
                    style={styles.dropdownTrigger}
                    onPress={() => openDropdownPicker('Seleccionar Tipo', extraCostOptions, formExtraCostCode, setFormExtraCostCode)}
                  >
                    <Text style={styles.dropdownValue}>{formExtraCostCode || 'Seleccionar...'}</Text>
                    <Ionicons name="chevron-down" size={20} color={Colors.muted} />
                  </TouchableOpacity>

                  <Text style={styles.formFieldLabel}>Monto</Text>
                  <TextInput 
                    style={styles.formTextInputSmall}
                    value={formCostAmount}
                    onChangeText={setFormCostAmount}
                    keyboardType="numeric"
                    placeholder="Monto (ej. 150.00)"
                    placeholderTextColor={Colors.muted}
                  />

                  <Text style={styles.formFieldLabel}>Moneda / Unidad de Medida</Text>
                  <TouchableOpacity 
                    style={styles.dropdownTrigger}
                    onPress={() => openDropdownPicker('Seleccionar Moneda', currencyOptions, formMeasureUnitCode, setFormMeasureUnitCode)}
                  >
                    <Text style={styles.dropdownValue}>{formMeasureUnitCode}</Text>
                    <Ionicons name="chevron-down" size={20} color={Colors.muted} />
                  </TouchableOpacity>

                  <Text style={styles.formFieldLabel}>Notas / Observaciones</Text>
                  <TextInput 
                    style={styles.formTextInputSmall}
                    value={formExtraCostNotes}
                    onChangeText={setFormExtraCostNotes}
                    placeholder="Detalles del costo..."
                    placeholderTextColor={Colors.muted}
                  />

                  <View style={{ flexDirection: 'row', gap: 12, marginTop: Spacing.md }}>
                    <TouchableOpacity style={[styles.saveItemBtn, { flex: 1, backgroundColor: Colors.muted }]} onPress={() => setExtraCostFormMode(null)}>
                      <Text style={styles.saveItemBtnText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.saveItemBtn, { flex: 1 }]} onPress={handleSaveExtraCost}>
                      <Text style={styles.saveItemBtnText}>Guardar</Text>
                    </TouchableOpacity>
                  </View>
                </Pressable>
              </Pressable>
            )}
            {renderPickerOverlay()}
          </SafeAreaView>
        </Modal>
      )}

      {/* Global Picker Overlay */}
      {renderPickerOverlay()}
    </MainLayout>
  );
}
