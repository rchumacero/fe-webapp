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
import { useInventory, InventoryDraft } from '../hooks/useInventory';
import { MainLayout } from '../../../../shared/layout/MainLayout';
import { loadDomainParameters, getBatchParameters, Inventory, InventoryDetail } from '@kplian/core';
import { createApiClient, InventoryRepositoryImpl } from '@kplian/infrastructure';
import { WORKFLOW_CONSTANTS } from '../workflowConstants';
import { styles } from './styles/InventoryScreenStyles';

const workflowApi = createApiClient('workflow');
const inventoryRepo = new InventoryRepositoryImpl();

interface InventoryScreenProps {
  onBack: () => void;
  onNavigate?: (route: string) => void;
}

export default function InventoryScreen({ onBack, onNavigate }: InventoryScreenProps) {
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
    totalItemsCount,
    totalRealQuantity,
    totalInventoryQuantity,
    fetchInventories,
    fetchWarehouses,
    resetForm,
    addDetail,
    removeDetail,
    saveInventory
  } = useInventory();

  // Screen Modals Visibility
  const [editorVisible, setEditorVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [activeMenuInventoryId, setActiveMenuInventoryId] = useState<string | null>(null);
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null);

  // Sub-forms inline state
  const [showInlineItemForm, setShowInlineItemForm] = useState(false);
  const [localItem, setLocalItem] = useState({
    itemCode: '',
    inventoryQuantity: '0',
    realQuantity: '0',
    unitCost: '0'
  });

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
    fetchInventories();
    fetchWarehouses();
  }, [fetchInventories, fetchWarehouses]);

  // Statistics calculation
  const stats = useMemo(() => {
    let count = inventories.length;
    let items = inventories.reduce((sum, inv) => sum + (inv.inventoryDetails?.length || 0), 0);
    return {
      totalInventories: count,
      totalItemsRecorded: items,
    };
  }, [inventories]);

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

  const [editingDetailIndex, setEditingDetailIndex] = useState<number | null>(null);

  const handleOpenCreateForm = () => {
    setEditingInventory(null);
    setEditingDetailIndex(null);
    resetForm();
    setEditorVisible(true);
  };

  const openEditInventoryModal = (inv: Inventory) => {
    setEditingInventory(inv);
    setEditingDetailIndex(null);
    setInventoryDraft({
      warehouseId: inv.warehouseId,
      inventoryDate: inv.inventoryDate ? inv.inventoryDate.split('T')[0] : new Date().toISOString().split('T')[0],
    });
    if (inv.inventoryDetails) {
      setDetails(inv.inventoryDetails.map(d => ({
        id: (d as any).id,
        itemCode: d.itemCode,
        inventoryQuantity: d.inventoryQuantity,
        realQuantity: d.realQuantity,
        unitCost: d.unitCost,
      })));
    } else {
      setDetails([]);
    }
    setEditorVisible(true);
  };

  const handleDeleteInventory = (id: string, dateStr: string, status?: string) => {
    const doDelete = async () => {
      try {
        await inventoryRepo.delete(id);
        Alert.alert('Éxito', 'Inventario eliminado correctamente.');
        await fetchInventories();
      } catch (error: any) {
        console.error('Error deleting inventory:', error);
        Alert.alert('Error', error?.response?.data?.message || 'Error al eliminar el inventario.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`¿Está seguro de que desea eliminar la toma física de fecha ${dateStr}?`);
      if (confirmed) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Eliminar Inventario',
        `¿Está seguro de que desea eliminar la toma física de fecha ${dateStr}?`,
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
      inventoryQuantity: (target.inventoryQuantity || 0).toString(),
      realQuantity: (target.realQuantity || 0).toString(),
      unitCost: (target.unitCost || 0).toString(),
    });
    setShowInlineItemForm(true);
  };

  const handleSaveItem = () => {
    if (!localItem.itemCode || parseFloat(localItem.inventoryQuantity) < 0 || parseFloat(localItem.realQuantity) < 0 || parseFloat(localItem.unitCost) < 0) {
      Alert.alert('Error', 'Please fill item details with valid values.');
      return;
    }
    const itemData = {
      itemCode: localItem.itemCode,
      inventoryQuantity: parseFloat(localItem.inventoryQuantity),
      realQuantity: parseFloat(localItem.realQuantity),
      unitCost: parseFloat(localItem.unitCost)
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
      inventoryQuantity: '0',
      realQuantity: '0',
      unitCost: '0'
    }));
  };

  const handleConfirmInventory = async () => {
    try {
      if (!inventoryDraft.warehouseId) {
        Alert.alert('Error', 'Debe seleccionar un almacén.');
        return;
      }
      if (details.length === 0) {
        Alert.alert('Error', 'Debe agregar al menos un ítem al inventario.');
        return;
      }

      if (editingInventory) {
        await inventoryRepo.update({
          id: editingInventory.id,
          warehouseId: inventoryDraft.warehouseId,
          vendorCode: editingInventory.vendorCode || 'SYSTEM',
          inventoryDate: new Date(inventoryDraft.inventoryDate).toISOString(),
          inventoryDetails: details.map(d => ({
            id: (d as any).id,
            itemCode: d.itemCode,
            inventoryQuantity: d.inventoryQuantity || 0,
            realQuantity: d.realQuantity || 0,
            unitCost: d.unitCost || 0,
          }))
        } as any);
        setEditorVisible(false);
        setEditingInventory(null);
        await fetchInventories();
        Alert.alert('Éxito', 'Inventario actualizado con éxito.');
      } else {
        await saveInventory();
        setEditorVisible(false);
        Alert.alert('Éxito', 'Inventario físico registrado con éxito.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al guardar el inventario.');
    }
  };

  const handleCardPress = async (inv: Inventory) => {
    setSelectedInventory(inv);
    await loadInventoryRelations(inv.id);
    setDetailVisible(true);
  };

  const getWarehouseName = (id?: string) => {
    if (!id) return 'Default';
    const found = warehouses.find(w => w.id === id);
    return found ? found.name : 'Almacén';
  };

  const handleNext = (inventory: Inventory) => {
    const doNext = async () => {
      try {
        await workflowApi.post('/v1/state-machine/transition', {
          entity: WORKFLOW_CONSTANTS.INVENTORY.entity,
          processName: WORKFLOW_CONSTANTS.INVENTORY.processName,
          id: inventory.id,
          action: 'forward'
        });
        Alert.alert('Success', 'Successfully moved to next step.');
        await fetchInventories();
      } catch (error: any) {
        console.error('Error transitioning inventory:', error);
        Alert.alert('Error', error?.response?.data?.message || 'Failed to move to next step.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to move this inventory to the next step?');
      if (confirmed) {
        doNext();
      }
    } else {
      Alert.alert(
        'Next Step',
        'Are you sure you want to move this inventory to the next step?',
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

  const handleCancel = (inventory: Inventory) => {
    const doCancel = async () => {
      try {
        await workflowApi.post('/v1/state-machine/transition', {
          entity: WORKFLOW_CONSTANTS.INVENTORY.entity,
          processName: WORKFLOW_CONSTANTS.INVENTORY.processName,
          id: inventory.id,
          action: 'annul'
        });
        Alert.alert('Success', 'Successfully cancelled.');
        await fetchInventories();
      } catch (error: any) {
        console.error('Error cancelling action:', error);
        Alert.alert('Error', error?.response?.data?.message || 'Failed to cancel action.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to cancel the action for this inventory?');
      if (confirmed) {
        doCancel();
      }
    } else {
      Alert.alert(
        'Cancel Action',
        'Are you sure you want to cancel the action for this inventory?',
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

  const renderInventoryItem = ({ item }: { item: Inventory }) => {
    const totalItems = item.inventoryDetails?.length || 0;
    const dateStr = item.inventoryDate.split('T')[0];

    return (
      <TouchableOpacity 
        style={[
          styles.cardItem, 
          { zIndex: activeMenuInventoryId === item.id ? 100 : 1, overflow: 'visible' }
        ]} 
        onPress={() => handleCardPress(item)}
      >
        {/* Card Header Row with 3-dots Menu */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: activeMenuInventoryId === item.id ? 10 : 1, marginBottom: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <Text style={styles.customerName}>{`Inventario: ${dateStr}`}</Text>
            <View style={[styles.badge, styles.badgeSuccess]}>
              <Text style={[styles.badgeText, styles.badgeTextSuccess]}>
                {item.status || 'Registrado'}
              </Text>
            </View>
          </View>

          {/* 3-dots Menu Trigger */}
          <View style={{ position: 'relative', zIndex: 999 }}>
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 10, padding: 8 }]}
              onPress={(e) => {
                e.stopPropagation();
                setActiveMenuInventoryId(activeMenuInventoryId === item.id ? null : item.id);
              }}
            >
              <Ionicons name="ellipsis-vertical" size={20} color={Colors.foreground} />
            </TouchableOpacity>

            {/* Dropdown Menu Overlay */}
            {activeMenuInventoryId === item.id && (
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
                  onPress={() => setActiveMenuInventoryId(null)}
                />
                <View style={[styles.dropdownMenu, { zIndex: 9999 }]}>
                  <TouchableOpacity 
                    style={styles.dropdownMenuItem}
                    onPress={(e) => {
                      e.stopPropagation();
                      setActiveMenuInventoryId(null);
                      openEditInventoryModal(item);
                    }}
                  >
                    <Text style={styles.dropdownMenuText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.dropdownMenuItem}
                    onPress={(e) => {
                      e.stopPropagation();
                      setActiveMenuInventoryId(null);
                      handleCardPress(item);
                    }}
                  >
                    <Text style={styles.dropdownMenuText}>Detail</Text>
                  </TouchableOpacity>

                  <View style={styles.dropdownDivider} />

                  <TouchableOpacity 
                    style={styles.dropdownMenuItem}
                    onPress={(e) => {
                      e.stopPropagation();
                      setActiveMenuInventoryId(null);
                      handleDeleteInventory(item.id, dateStr, item.status);
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
          {`📅 ${dateStr} · Almacén: ${getWarehouseName(item.warehouseId)}`}
        </Text>
        <Text style={styles.subtypeText}>
          {`Ítems Auditados: ${totalItems}`}
        </Text>

        <View style={styles.cardDivider} />
        
        <View style={styles.cardFooter}>
          <Text style={styles.footerTotal}>
            {`Total items: ${totalItems}`}
          </Text>
          <View style={styles.footerRight}>
            <Text style={styles.paymentMethodLabel}>
              Ver Detalle
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xs, paddingTop: 2 }}>
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
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <MainLayout headerTitle="Inventarios Físicos" onNavigate={onNavigate}>
      {/* Header bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="clipboard-outline" size={24} color={Colors.primary} />
          <Text style={styles.headerTitleText}>Inventarios Físicos</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.mainScroll} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        {/* RESUMEN section */}
        <Text style={styles.subHeadingText}>RESUMEN DE AUDITORÍA</Text>
        <View style={styles.analyticsContainer}>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>Tomas Físicas</Text>
            <Text style={styles.analyticsValue}>{stats.totalInventories}</Text>
            <Text style={styles.analyticsSubGreen}>Realizadas</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>Ítems Auditados</Text>
            <Text style={styles.analyticsValue}>{stats.totalItemsRecorded}</Text>
            <Text style={styles.analyticsSubGreen}>Registrados</Text>
          </View>
        </View>

        {/* LIST section */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          paddingRight: Spacing.md, 
          marginTop: Spacing.md,
          marginBottom: Spacing.sm
        }}>
          <Text style={[styles.subHeadingText, { marginTop: 0, marginBottom: 0, paddingRight: 0 }]}>
            HISTORIAL DE INVENTARIOS
          </Text>
          <TouchableOpacity 
            onPress={handleOpenCreateForm}
            style={{ padding: 4 }}
          >
            <Ionicons name="add-circle" size={32} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {loading && inventories.length === 0 ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : inventories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={60} color={Colors.muted} />
            <Text style={styles.emptyText}>No se encontraron tomas de inventario.</Text>
            <Text style={styles.emptySubText}>Presione el botón "+" arriba para empezar.</Text>
          </View>
        ) : (
          inventories.map(item => (
            <React.Fragment key={item.id}>
              {renderInventoryItem({ item })}
            </React.Fragment>
          ))
        )}
      </ScrollView>

      {/* DETAIL MODAL */}
      {selectedInventory && (
        <Modal
          visible={detailVisible}
          animationType="slide"
          onRequestClose={() => setDetailVisible(false)}
        >
          <SafeAreaView style={styles.modalRoot}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setDetailVisible(false)} style={styles.headerIconButton}>
                <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Detalle Toma Física</Text>
              <View style={[styles.badge, styles.badgeSuccess]}>
                <Text style={[styles.badgeText, styles.badgeTextSuccess]}>
                  {selectedInventory.status || 'Registrado'}
                </Text>
              </View>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.infoBlock}>
                <Text style={styles.infoCodeAndDate}>
                  {`Fecha de Toma: ${selectedInventory.inventoryDate.split('T')[0]}`}
                </Text>
                <Text style={styles.infoCustomerName}>
                  {`Almacén: ${getWarehouseName(selectedInventory.warehouseId)}`}
                </Text>
              </View>

              <Text style={styles.subHeadingText}>ÍTEMS AUDITADOS</Text>
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
                          {`Cantidad Teórica: ${item.inventoryQuantity} · Real: ${item.realQuantity}`}
                        </Text>
                      </View>
                    </View>
                    <Text style={[
                      styles.detailItemPrice, 
                      { color: (item.realQuantity || 0) >= (item.inventoryQuantity || 0) ? Colors.primary : Colors.destructive }
                    ]}>
                      {`Diferencia: ${(item.realQuantity || 0) - (item.inventoryQuantity || 0)}`}
                    </Text>
                  </View>
                ))}

                <View style={styles.detailTotalDivider} />
                <View style={styles.detailTotalRow}>
                  <Text style={styles.detailTotalLabel}>Total Ítems Auditados</Text>
                  <Text style={styles.detailTotalValue}>
                    {`${selectedDetails.length} items`}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}

      {/* CREATE MODAL */}
      <Modal
        visible={editorVisible}
        animationType="slide"
        onRequestClose={() => setEditorVisible(false)}
      >
        <SafeAreaView style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditorVisible(false)} style={styles.headerIconButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.foreground} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nueva Toma Física</Text>
            <TouchableOpacity onPress={handleConfirmInventory} style={styles.headerIconButton}>
              <Ionicons name="checkmark-circle-outline" size={26} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.formPadding}>
              
              {/* Almacén Selection */}
              <Text style={styles.formInputHeading}>ALMACÉN DE TOMA FÍSICA</Text>
              <TouchableOpacity 
                style={styles.customerSelectorTrigger}
                onPress={() => openDropdownPicker('Seleccionar Almacén', warehouses.map(w => ({ CODE: w.id, name: w.name })), inventoryDraft.warehouseId, (val) => {
                  setInventoryDraft((p: InventoryDraft) => ({ ...p, warehouseId: val }));
                })}
              >
                <Ionicons name="business" size={20} color={Colors.muted} />
                <Text style={styles.customerSelectorValue}>
                  {getWarehouseName(inventoryDraft.warehouseId) || 'Seleccione Almacén...'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={Colors.muted} />
              </TouchableOpacity>

              {/* Fecha */}
              <Text style={styles.formFieldLabel}>Fecha de Inventario</Text>
              <TextInput 
                style={styles.formTextInputSmall}
                value={inventoryDraft.inventoryDate}
                onChangeText={txt => setInventoryDraft((p: InventoryDraft) => ({ ...p, inventoryDate: txt }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.muted}
              />

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
                      inventoryQuantity: '0',
                      realQuantity: '0',
                      unitCost: '0'
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

                  <View style={styles.gridRow}>
                    <View style={styles.gridCol}>
                      <Text style={styles.formFieldLabel}>Cant. Teórica</Text>
                      <TextInput 
                        style={styles.formTextInputSmall}
                        value={localItem.inventoryQuantity}
                        onChangeText={txt => setLocalItem(prev => ({ ...prev, inventoryQuantity: txt }))}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.gridCol}>
                      <Text style={styles.formFieldLabel}>Cant. Real</Text>
                      <TextInput 
                        style={styles.formTextInputSmall}
                        value={localItem.realQuantity}
                        onChangeText={txt => setLocalItem(prev => ({ ...prev, realQuantity: txt }))}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <Text style={styles.formFieldLabel}>Costo Unitario (Bs)</Text>
                  <TextInput 
                    style={styles.formTextInputSmall}
                    value={localItem.unitCost}
                    onChangeText={txt => setLocalItem(prev => ({ ...prev, unitCost: txt }))}
                    keyboardType="numeric"
                  />

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
                          {`Teórica: ${item.inventoryQuantity} | Real: ${item.realQuantity} x Bs ${(item.unitCost || 0).toFixed(2)}`}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailItemFormRight}>
                      <Text style={styles.detailItemPrice}>
                        {`Bs ${((item.realQuantity || 0) * (item.unitCost || 0)).toFixed(2)}`}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
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

              {/* Submit Button */}
              <TouchableOpacity style={styles.submitBtn} onPress={handleConfirmInventory}>
                <Text style={styles.submitBtnText}>Guardar Toma Física</Text>
              </TouchableOpacity>

            </View>
          </ScrollView>

        </SafeAreaView>
      </Modal>

      {/* Global Picker Dropdown Modal */}
      <Modal
        visible={pickerModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerModal(p => ({ ...p, visible: false }))}
      >
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
      </Modal>
    </MainLayout>
  );
}
