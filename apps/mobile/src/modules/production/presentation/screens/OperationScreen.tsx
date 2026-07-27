import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  TextInput, 
  Modal, 
  Pressable, 
  FlatList,
  Alert,
  Dimensions
} from 'react-native';
import { useTranslation } from '@kplian/i18n';
import { MainLayout } from '../../../../shared/layout/MainLayout';
import { Colors, Spacing, Typography } from '../../../../shared/theme/constants';
import { 
  OperationRepositoryImpl,
  ProductRepositoryImpl,
  WarehouseRepositoryImpl,
  OperationProductRepositoryImpl,
  OperationExtraCostRepositoryImpl
} from '@kplian/infrastructure';
import { 
  Operation,
  Product,
  Warehouse,
  OperationProduct,
  OperationExtraCost,
  loadDomainParameters,
  getBatchParameters 
} from '@kplian/core';
import { Ionicons } from '@expo/vector-icons';
import { useVendor } from '../../../../shared/auth/AuthContext';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 48;

const SafeAreaWrapper = ({ children, style }: { children: React.ReactNode; style?: any }) => {
  return <View style={[{ flex: 1, backgroundColor: Colors.background, paddingTop: 44 }, style]}>{children}</View>;
};

const formatDateString = (dateStr: string | undefined | null): string => {
  if (!dateStr) return '';
  const cleanStr = dateStr.split('T')[0];
  const parts = cleanStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  
  const format = process.env.EXPO_PUBLIC_DATE_FORMAT || 'yyyy-mm-dd';
  
  switch (format.toLowerCase()) {
    case 'dd/mm/yyyy':
      return `${d}/${m}/${y}`;
    case 'mm/dd/yyyy':
      return `${m}/${d}/${y}`;
    case 'yyyy-mm-dd':
    default:
      return `${y}-${m}-${d}`;
  }
};

const opRepo = new OperationRepositoryImpl();
const productRepo = new ProductRepositoryImpl();
const warehouseRepo = new WarehouseRepositoryImpl();
const opProductRepo = new OperationProductRepositoryImpl();
const opExtraCostRepo = new OperationExtraCostRepositoryImpl();

interface OperationScreenProps {
  onBack: () => void;
  onNavigate?: (route: string) => void;
}

export default function OperationScreen({ onBack, onNavigate }: OperationScreenProps) {
  const { t } = useTranslation();
  const { vendor: vendorId } = useVendor();
  const carouselRef = useRef<ScrollView>(null);

  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdowns
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [unitMeasures, setUnitMeasures] = useState<any[]>([]);

  // Selection states
  const [selectedOp, setSelectedOp] = useState<Operation | null>(null);
  const [opProducts, setOpProducts] = useState<OperationProduct[]>([]);
  const [opExtraCosts, setOpExtraCosts] = useState<OperationExtraCost[]>([]);

  // Main Form Modal State
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [formOpDate, setFormOpDate] = useState('');
  const [formDeliveryDate, setFormDeliveryDate] = useState('');
  const [formStatus, setFormStatus] = useState('DRAFT');
  const [formMaterialWarehouse, setFormMaterialWarehouse] = useState('');
  const [formProductWarehouse, setFormProductWarehouse] = useState('');

  // Relation Modals States
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<OperationProduct | null>(null);
  const [formProductUnitId, setFormProductUnitId] = useState('');
  const [formPlannedQty, setFormPlannedQty] = useState('');
  const [formProdQty, setFormProdQty] = useState('');
  const [formDefQty, setFormDefQty] = useState('');
  const [formUnitMeasure, setFormUnitMeasure] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const [extraCostModalVisible, setExtraCostModalVisible] = useState(false);
  const [editingExtraCost, setEditingExtraCost] = useState<OperationExtraCost | null>(null);
  const [formCostName, setFormCostName] = useState('');
  const [formCostAmount, setFormCostAmount] = useState('');
  const [formCostNotes, setFormCostNotes] = useState('');

  // Dropdown Picker Modal State
  const [pickerModal, setPickerModal] = useState<{
    visible: boolean;
    title: string;
    data: any[];
    onSelect: (value: string) => void;
    selectedValue: string;
  }>({
    visible: false,
    title: '',
    data: [],
    onSelect: () => {},
    selectedValue: '',
  });

  // Custom Date Picker Modal State
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [dateTargetSetter, setDateTargetSetter] = useState<((val: string) => void) | null>(null);
  const [pickerYear, setPickerYear] = useState('2026');
  const [pickerMonth, setPickerMonth] = useState('07');
  const [pickerDay, setPickerDay] = useState('10');

  const openDatePicker = (initialVal: string, setter: (val: string) => void) => {
    let y = '2026';
    let m = '07';
    let d = '10';
    const cleanVal = initialVal ? initialVal.split('T')[0] : '';
    if (cleanVal && cleanVal.includes('-')) {
      const parts = cleanVal.split('-');
      if (parts[0]) y = parts[0];
      if (parts[1]) m = parts[1];
      if (parts[2]) d = parts[2];
    } else {
      const today = new Date().toISOString().split('T')[0].split('-');
      y = today[0];
      m = today[1];
      d = today[2];
    }
    setPickerYear(y);
    setPickerMonth(m);
    setPickerDay(d);
    setDateTargetSetter(() => setter);
    setDatePickerVisible(true);
  };

  const handleConfirmDate = () => {
    if (dateTargetSetter) {
      dateTargetSetter(`${pickerYear}-${pickerMonth}-${pickerDay}`);
    }
    setDatePickerVisible(false);
  };

  const yearsList = ['2024', '2025', '2026', '2027', '2028', '2029', '2030'];
  const monthsList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const daysList = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

  const getOrderedPickerColumns = () => {
    const format = process.env.EXPO_PUBLIC_DATE_FORMAT || 'yyyy-mm-dd';

    const renderYearColumn = () => (
      <View key="year" style={{ flex: 1, alignItems: 'center' }}>
        <Text style={styles.label}>Year</Text>
        <TouchableOpacity 
          style={styles.dropdownTrigger}
          onPress={() => openDropdownPicker(
            'Select Year', 
            yearsList.map(y => ({ CODE: y, name: y })), 
            pickerYear, 
            setPickerYear
          )}
        >
          <Text style={styles.dropdownValue}>{pickerYear}</Text>
        </TouchableOpacity>
      </View>
    );

    const renderMonthColumn = () => (
      <View key="month" style={{ flex: 1, alignItems: 'center', marginHorizontal: 8 }}>
        <Text style={styles.label}>Month</Text>
        <TouchableOpacity 
          style={styles.dropdownTrigger}
          onPress={() => openDropdownPicker(
            'Select Month', 
            monthsList.map(m => ({ CODE: m, name: m })), 
            pickerMonth, 
            setPickerMonth
          )}
        >
          <Text style={styles.dropdownValue}>{pickerMonth}</Text>
        </TouchableOpacity>
      </View>
    );

    const renderDayColumn = () => (
      <View key="day" style={{ flex: 1, alignItems: 'center' }}>
        <Text style={styles.label}>Day</Text>
        <TouchableOpacity 
          style={styles.dropdownTrigger}
          onPress={() => openDropdownPicker(
            'Select Day', 
            daysList.map(d => ({ CODE: d, name: d })), 
            pickerDay, 
            setPickerDay
          )}
        >
          <Text style={styles.dropdownValue}>{pickerDay}</Text>
        </TouchableOpacity>
      </View>
    );

    switch (format.toLowerCase()) {
      case 'dd/mm/yyyy':
        return [renderDayColumn(), renderMonthColumn(), renderYearColumn()];
      case 'mm/dd/yyyy':
        return [renderMonthColumn(), renderDayColumn(), renderYearColumn()];
      case 'yyyy-mm-dd':
      default:
        return [renderYearColumn(), renderMonthColumn(), renderDayColumn()];
    }
  };

  const fetchOperations = useCallback(async () => {
    setLoading(true);
    try {
      let data = await opRepo.getAll();
      if (vendorId) {
        data = data.filter(o => o.vendorCode === vendorId);
      }
      if (searchQuery.trim()) {
        data = data.filter(o => 
          o.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.warehouseMaterialCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.warehouseProductCode.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      setOperations(data);
    } catch (error) {
      console.error('Error loading operations:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, vendorId]);

  // Load Dropdowns & Parameters Data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [warehousesData, productsData, paramsMapped] = await Promise.all([
          warehouseRepo.getAll(),
          productRepo.getAll(),
          loadDomainParameters(
            getBatchParameters,
            [
              { fullCode: 'GEN/MAIN/MEA' }
            ]
          )
        ]);
        setWarehouses(warehousesData);
        setProductsList(productsData);

        if (paramsMapped['GEN/MAIN/MEA']) {
          setUnitMeasures(paramsMapped['GEN/MAIN/MEA']);
        }
      } catch (error) {
        console.error('Failed to load dropdown source data:', error);
      }
    };
    loadDropdownData();
  }, []);

  useEffect(() => {
    fetchOperations();
  }, [fetchOperations]);

  const selectOp = async (op: Operation) => {
    setLoading(true);
    setSelectedOp(op);
    try {
      const [prods, costs] = await Promise.all([
        opRepo.getProductsByOperationId(op.id),
        opRepo.getExtraCostsByOperationId(op.id)
      ]);
      setOpProducts(prods);
      setOpExtraCosts(costs);
    } catch (error) {
      console.error('Failed to load operation relations:', error);
    } finally {
      setLoading(false);
    }
  };

  const reloadRelations = async () => {
    if (!selectedOp) return;
    try {
      const [prods, costs] = await Promise.all([
        opRepo.getProductsByOperationId(selectedOp.id),
        opRepo.getExtraCostsByOperationId(selectedOp.id)
      ]);
      setOpProducts(prods);
      setOpExtraCosts(costs);
    } catch (error) {
      console.error('Failed to reload operation relations:', error);
    }
  };

  const openCreateModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormOpDate(today);
    setFormDeliveryDate(today);
    setFormStatus('DRAFT');
    setFormMaterialWarehouse(warehouses[0]?.code || '');
    setFormProductWarehouse(warehouses[0]?.code || '');
    setModalMode('create');
  };

  const openEditModal = (op: Operation) => {
    setFormOpDate(op.operationDate);
    setFormDeliveryDate(op.deliveryDate || '');
    setFormStatus(op.status || 'DRAFT');
    setFormMaterialWarehouse(op.warehouseMaterialCode);
    setFormProductWarehouse(op.warehouseProductCode);
    setModalMode('edit');
  };

  const handleSave = async () => {
    if (!formOpDate || !formDeliveryDate || !formMaterialWarehouse || !formProductWarehouse) {
      Alert.alert('Error', 'Operation Date, Delivery Date, and Warehouses are required.');
      return;
    }
    setLoading(true);
    try {
      const isEdit = modalMode === 'edit';
      const opDateWithTime = formOpDate.includes('T') ? formOpDate : `${formOpDate}T00:00:00`;
      const delDateWithTime = formDeliveryDate.includes('T') ? formDeliveryDate : `${formDeliveryDate}T00:00:00`;

      if (isEdit && selectedOp) {
        await opRepo.update({
          id: selectedOp.id,
          vendorCode: selectedOp.vendorCode,
          operationDate: opDateWithTime,
          deliveryDate: delDateWithTime,
          status: formStatus,
          warehouseMaterialCode: formMaterialWarehouse,
          warehouseProductCode: formProductWarehouse
        });
      } else {
        await opRepo.create({
          vendorCode: vendorId || 'SYSTEM',
          operationDate: opDateWithTime,
          deliveryDate: delDateWithTime,
          status: formStatus,
          warehouseMaterialCode: formMaterialWarehouse,
          warehouseProductCode: formProductWarehouse
        });
      }
      setModalMode(null);
      fetchOperations();
      setSelectedOp(null);
      
      setTimeout(() => {
        Alert.alert(
          'Success',
          isEdit ? 'Operation updated successfully.' : 'Operation created successfully.'
        );
      }, typeof jest !== 'undefined' ? 10 : 500);
    } catch (error) {
      console.error('Failed to save operation:', error);
      Alert.alert('Error', 'Failed to save operation.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Operation', 'Are you sure you want to delete this operation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await opRepo.delete(id);
            fetchOperations();
            setSelectedOp(null);
            setTimeout(() => {
              Alert.alert('Success', 'Operation deleted successfully.');
            }, typeof jest !== 'undefined' ? 10 : 500);
          } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to delete operation.');
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  // Products Relations Actions
  const openAddProduct = () => {
    setEditingProduct(null);
    setFormProductUnitId(productsList[0]?.id || '');
    setFormPlannedQty('');
    setFormProdQty('');
    setFormDefQty('');
    setFormUnitMeasure(unitMeasures[0]?.CODE || unitMeasures[0]?.code || '');
    setFormNotes('');
    setProductModalVisible(true);
  };

  const openEditProduct = (item: OperationProduct) => {
    setEditingProduct(item);
    setFormProductUnitId(item.productId);
    setFormPlannedQty(String(item.plannedQuantity));
    setFormProdQty(item.producedQuantity ? String(item.producedQuantity) : '');
    setFormDefQty(item.defectedQuantity ? String(item.defectedQuantity) : '');
    setFormUnitMeasure(item.unitMeasureCode || '');
    setFormNotes(item.notes || '');
    setProductModalVisible(true);
  };

  const handleSaveProduct = async () => {
    if (!selectedOp) return;
    if (!formProductUnitId || !formPlannedQty) {
      Alert.alert('Error', 'Product and Planned Quantity are required.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        operationId: selectedOp.id,
        productId: formProductUnitId,
        plannedQuantity: parseFloat(formPlannedQty),
        producedQuantity: formProdQty ? parseFloat(formProdQty) : undefined,
        defectedQuantity: formDefQty ? parseFloat(formDefQty) : undefined,
        unitMeasureCode: formUnitMeasure || undefined,
        notes: formNotes || undefined
      };

      if (editingProduct) {
        await opProductRepo.update({
          id: editingProduct.id,
          ...payload
        });
      } else {
        await opProductRepo.create(payload);
      }
      setProductModalVisible(false);
      reloadRelations();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (id: string) => {
    Alert.alert('Delete Product relation', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await opProductRepo.delete(id);
            reloadRelations();
          } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to delete relation.');
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  // Extra Costs Relations Actions
  const openAddExtraCost = () => {
    setEditingExtraCost(null);
    setFormCostName('');
    setFormCostAmount('');
    setFormCostNotes('');
    setExtraCostModalVisible(true);
  };

  const openEditExtraCost = (item: OperationExtraCost) => {
    setEditingExtraCost(item);
    setFormCostName(item.costCode || item.name || '');
    setFormCostAmount(item.amount !== undefined ? String(item.amount) : (item.costAmount !== undefined ? String(item.costAmount) : ''));
    setFormCostNotes(item.notes || '');
    setExtraCostModalVisible(true);
  };

  const handleSaveExtraCost = async () => {
    if (!selectedOp) return;
    if (!formCostName || !formCostAmount) {
      Alert.alert('Error', 'Name and Cost Amount are required.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        operationId: selectedOp.id,
        costCode: formCostName,
        amount: parseFloat(formCostAmount),
        currencyCode: 'USD',
        notes: formCostNotes || undefined
      };

      if (editingExtraCost) {
        await opExtraCostRepo.update({
          id: editingExtraCost.id,
          ...payload
        });
      } else {
        await opExtraCostRepo.create(payload);
      }
      setExtraCostModalVisible(false);
      reloadRelations();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save extra cost.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExtraCost = (id: string) => {
    Alert.alert('Delete Extra Cost relation', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await opExtraCostRepo.delete(id);
            reloadRelations();
          } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to delete relation.');
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  const getWarehouseLabel = (code: string) => {
    const match = warehouses.find(w => w.code === code);
    return match ? match.name : code;
  };

  const getProductLabel = (id: string) => {
    const match = productsList.find(p => p.id === id);
    return match ? match.name : id;
  };

  const getParamLabel = (data: any[], val: string) => {
    const item = data.find(
      i => (i.CODE || i.code) === val
    );
    return item ? (item.NAME || item.name) : val;
  };

  const openDropdownPicker = (
    title: string, 
    data: any[], 
    selectedValue: string, 
    onSelect: (value: string) => void
  ) => {
    setPickerModal({
      visible: true,
      title,
      data,
      selectedValue,
      onSelect
    });
  };

  const opStatuses = [
    { CODE: 'DRAFT', name: 'Draft' },
    { CODE: 'PLANNED', name: 'Planned' },
    { CODE: 'IN_PROGRESS', name: 'In Progress' },
    { CODE: 'COMPLETED', name: 'Completed' },
    { CODE: 'CANCELLED', name: 'Cancelled' }
  ];

  const renderPickerModal = () => {
    if (!pickerModal.visible) return null;
    return (
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
          <View style={styles.pickerContent}>
            <Text style={styles.pickerTitle}>{pickerModal.title}</Text>
            <View style={styles.pickerDivider} />
            <FlatList
              data={pickerModal.data}
              keyExtractor={(item, idx) => (item.CODE || item.code || idx.toString())}
              renderItem={({ item }) => {
                const code = item.CODE || item.code;
                const name = item.name || item.NAME || code;
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
          </View>
        </Pressable>
      </Modal>
    );
  };

  return (
    <MainLayout headerTitle={t('production.operation.title', 'Operations')}>
      <TouchableOpacity style={styles.backLink} onPress={selectedOp ? () => setSelectedOp(null) : onBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.muted} />
        <Text style={styles.backLinkText}>Volver</Text>
      </TouchableOpacity>

      {loading && !selectedOp && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {!selectedOp ? (
        // List View
        <View style={{ flex: 1 }}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Operations</Text>
            <TouchableOpacity testID="add-operation-button" style={styles.addButton} onPress={openCreateModal}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.muted} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search by status or warehouse..."
              placeholderTextColor={Colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close" size={20} color={Colors.muted} />
              </TouchableOpacity>
            )}
          </View>

          {operations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="construct-outline" size={48} color={Colors.muted} />
              <Text style={styles.emptyText}>No operations found.</Text>
            </View>
          ) : (
            <ScrollView style={styles.scroll}>
              {operations.map(op => (
                <View key={op.id} style={styles.unitCard}>
                  <View style={styles.unitIcon}>
                    <Ionicons name="settings-outline" size={24} color={Colors.primary} />
                  </View>
                  <View style={styles.unitInfo}>
                    <Text style={styles.unitName}>Op Date: {formatDateString(op.operationDate)}</Text>
                    <Text style={styles.unitDesc}>Material Whse: {getWarehouseLabel(op.warehouseMaterialCode)}</Text>
                    <Text style={styles.unitDesc}>Product Whse: {getWarehouseLabel(op.warehouseProductCode)}</Text>
                    <View style={[
                      styles.statusBadge,
                      op.status === 'COMPLETED' ? styles.statusActive : styles.statusInactive
                    ]}>
                      <Text style={styles.statusText}>{op.status}</Text>
                    </View>
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => selectOp(op)}>
                      <Ionicons name="eye-outline" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openEditModal(op)}>
                      <Ionicons name="create-outline" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(op.id)}>
                      <Ionicons name="trash-outline" size={18} color={Colors.destructive} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      ) : (
        // Carousel Details & Relations View
        <View style={styles.detailWrapper}>
          <View style={styles.configHeader}>
            <Text style={styles.configTitle}>Operation details</Text>
            <Text style={styles.configSubtitle}>Date: {formatDateString(selectedOp.operationDate)}</Text>
            <Text style={styles.configSubtitle}>Material Whse: {getWarehouseLabel(selectedOp.warehouseMaterialCode)}</Text>
            <Text style={styles.configSubtitle}>Product Whse: {getWarehouseLabel(selectedOp.warehouseProductCode)}</Text>
          </View>

          <ScrollView
            ref={carouselRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + 16}
            snapToAlignment="center"
            contentContainerStyle={styles.carouselContainer}
          >
            {/* Card 1: Products */}
            <View style={styles.carouselCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.carouselCardTitle}>Products</Text>
                <TouchableOpacity style={styles.addButtonMini} onPress={openAddProduct}>
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.carouselCardScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.relationSection}>
                  {opProducts.length === 0 ? (
                    <Text style={styles.noDataText}>No products mapped.</Text>
                  ) : (
                    opProducts.map((p, idx) => (
                      <View key={p.id || idx} style={styles.itemCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                            <Ionicons name="cube-outline" size={20} color={Colors.primary} />
                            <Text style={styles.itemName}>{getProductLabel(p.productId)}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                            <TouchableOpacity onPress={() => openEditProduct(p)}>
                              <Ionicons name="create-outline" size={18} color={Colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteProduct(p.id)}>
                              <Ionicons name="trash-outline" size={18} color={Colors.destructive} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <Text style={styles.itemQty}>
                          Planned: {p.plannedQuantity} {p.unitMeasureCode ? getParamLabel(unitMeasures, p.unitMeasureCode) : ''}
                        </Text>
                        {p.producedQuantity !== undefined && (
                          <Text style={styles.itemNotes}>Produced: {p.producedQuantity}</Text>
                        )}
                        {p.defectedQuantity !== undefined && (
                          <Text style={styles.itemNotes}>Defected: {p.defectedQuantity}</Text>
                        )}
                        {p.notes && (
                          <Text style={styles.itemNotes}>Notes: {p.notes}</Text>
                        )}
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>
            </View>

            {/* Card 2: Extra Costs */}
            <View style={styles.carouselCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.carouselCardTitle}>Extra Costs</Text>
                <TouchableOpacity style={styles.addButtonMini} onPress={openAddExtraCost}>
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.carouselCardScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.relationSection}>
                  {opExtraCosts.length === 0 ? (
                    <Text style={styles.noDataText}>No extra costs mapped.</Text>
                  ) : (
                    opExtraCosts.map((c, idx) => (
                      <View key={c.id || idx} style={styles.itemCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                            <Ionicons name="cash-outline" size={20} color={Colors.primary} />
                            <Text style={styles.itemName}>{c.costCode || c.name}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                            <TouchableOpacity onPress={() => openEditExtraCost(c)}>
                              <Ionicons name="create-outline" size={18} color={Colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteExtraCost(c.id)}>
                              <Ionicons name="trash-outline" size={18} color={Colors.destructive} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <Text style={styles.itemQty}>
                          Amount: ${c.amount !== undefined ? c.amount : c.costAmount} {c.currencyCode || ''}
                        </Text>
                        {c.notes && (
                          <Text style={styles.itemNotes}>Notes: {c.notes}</Text>
                        )}
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Main Operation Form Modal */}
      <Modal
        visible={modalMode !== null}
        animationType="slide"
        onRequestClose={() => setModalMode(null)}
      >
        <SafeAreaWrapper style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalMode(null)}>
              <Ionicons name="close" size={24} color={Colors.muted} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {modalMode === 'create' ? 'Create Operation' : 'Edit Operation'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalFormContent} contentContainerStyle={{ paddingBottom: 60 }}>
            {/* Operation Date */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Operation Date</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => openDatePicker(formOpDate, setFormOpDate)}
              >
                <Text style={styles.dropdownValue}>
                  {formOpDate ? formatDateString(formOpDate) : 'Select Date...'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={Colors.muted} />
              </TouchableOpacity>
            </View>

            {/* Delivery Date */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Delivery Date</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => openDatePicker(formDeliveryDate, setFormDeliveryDate)}
              >
                <Text style={styles.dropdownValue}>
                  {formDeliveryDate ? formatDateString(formDeliveryDate) : 'Select Date...'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={Colors.muted} />
              </TouchableOpacity>
            </View>

            {/* Status Dropdown */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Status</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => openDropdownPicker(
                  'Select Status', 
                  opStatuses, 
                  formStatus, 
                  setFormStatus
                )}
              >
                <Text style={styles.dropdownValue}>
                  {formStatus}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.muted} />
              </TouchableOpacity>
            </View>

            {/* Material Warehouse */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Material Warehouse</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => openDropdownPicker(
                  'Select Material Warehouse', 
                  warehouses.map(w => ({ CODE: w.code, name: w.name })), 
                  formMaterialWarehouse, 
                  setFormMaterialWarehouse
                )}
              >
                <Text style={styles.dropdownValue}>
                  {getWarehouseLabel(formMaterialWarehouse) || 'Select Warehouse...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.muted} />
              </TouchableOpacity>
            </View>

            {/* Product Warehouse */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Product Warehouse</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => openDropdownPicker(
                  'Select Product Warehouse', 
                  warehouses.map(w => ({ CODE: w.code, name: w.name })), 
                  formProductWarehouse, 
                  setFormProductWarehouse
                )}
              >
                <Text style={styles.dropdownValue}>
                  {getWarehouseLabel(formProductWarehouse) || 'Select Warehouse...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.muted} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Selector Modal inside Main Modal */}
          {modalMode !== null && !datePickerVisible && renderPickerModal()}

          {/* Custom Date Picker Modal */}
          <Modal
            visible={datePickerVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setDatePickerVisible(false)}
          >
            <Pressable 
              style={styles.pickerOverlay} 
              onPress={() => setDatePickerVisible(false)}
            >
              <View style={[styles.pickerContent, { width: '90%' }]}>
                <Text style={styles.pickerTitle}>Select Date</Text>
                <View style={styles.pickerDivider} />
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.lg }}>
                  {getOrderedPickerColumns()}
                </View>

                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <TouchableOpacity 
                    style={[styles.addButton, { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: Colors.border }]} 
                    onPress={() => setDatePickerVisible(false)}
                  >
                    <Text style={{ color: Colors.foreground, fontWeight: 'bold' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.addButton, { flex: 1 }]} 
                    onPress={handleConfirmDate}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>

            {/* Selector Modal inside Date Picker Modal */}
            {datePickerVisible && renderPickerModal()}
          </Modal>
        </SafeAreaWrapper>
      </Modal>

      {/* Product Relation Modal */}
      <Modal
        visible={productModalVisible}
        animationType="slide"
        onRequestClose={() => setProductModalVisible(false)}
      >
        <SafeAreaWrapper style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setProductModalVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.muted} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </Text>
            <TouchableOpacity onPress={handleSaveProduct}>
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalFormContent} contentContainerStyle={{ paddingBottom: 60 }}>
            {/* Product Selector */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Product</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => openDropdownPicker(
                  'Select Product', 
                  productsList.map(p => ({ CODE: p.id, name: p.name })), 
                  formProductUnitId, 
                  setFormProductUnitId
                )}
              >
                <Text style={styles.dropdownValue}>
                  {getProductLabel(formProductUnitId) || 'Select Product...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.muted} />
              </TouchableOpacity>
            </View>

            {/* Planned Quantity */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Planned Quantity</Text>
              <TextInput 
                style={styles.input}
                keyboardType="numeric"
                placeholder="0.0"
                placeholderTextColor={Colors.muted}
                value={formPlannedQty}
                onChangeText={setFormPlannedQty}
              />
            </View>

            {/* Produced Quantity */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Produced Quantity (Optional)</Text>
              <TextInput 
                style={styles.input}
                keyboardType="numeric"
                placeholder="0.0"
                placeholderTextColor={Colors.muted}
                value={formProdQty}
                onChangeText={setFormProdQty}
              />
            </View>

            {/* Defected Quantity */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Defected Quantity (Optional)</Text>
              <TextInput 
                style={styles.input}
                keyboardType="numeric"
                placeholder="0.0"
                placeholderTextColor={Colors.muted}
                value={formDefQty}
                onChangeText={setFormDefQty}
              />
            </View>

            {/* Unit Measure Dropdown */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Unit of Measure</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => openDropdownPicker(
                  'Select Unit Measure', 
                  unitMeasures, 
                  formUnitMeasure, 
                  setFormUnitMeasure
                )}
              >
                <Text style={styles.dropdownValue}>
                  {getParamLabel(unitMeasures, formUnitMeasure) || 'Select Unit...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.muted} />
              </TouchableOpacity>
            </View>

            {/* Notes */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput 
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                multiline
                numberOfLines={3}
                placeholder="Add notes..."
                placeholderTextColor={Colors.muted}
                value={formNotes}
                onChangeText={setFormNotes}
              />
            </View>
          </ScrollView>

          {/* Selector Modal inside Product Modal */}
          {productModalVisible && renderPickerModal()}
        </SafeAreaWrapper>
      </Modal>

      {/* Extra Cost Modal */}
      <Modal
        visible={extraCostModalVisible}
        animationType="slide"
        onRequestClose={() => setExtraCostModalVisible(false)}
      >
        <SafeAreaWrapper style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setExtraCostModalVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.muted} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingExtraCost ? 'Edit Extra Cost' : 'Add Extra Cost'}
            </Text>
            <TouchableOpacity onPress={handleSaveExtraCost}>
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalFormContent} contentContainerStyle={{ paddingBottom: 60 }}>
            {/* Cost Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput 
                style={styles.input}
                placeholder="e.g. Electricity, Overtime"
                placeholderTextColor={Colors.muted}
                value={formCostName}
                onChangeText={setFormCostName}
              />
            </View>

            {/* Cost Amount */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Cost Amount</Text>
              <TextInput 
                style={styles.input}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={Colors.muted}
                value={formCostAmount}
                onChangeText={setFormCostAmount}
              />
            </View>

            {/* Notes */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput 
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                multiline
                numberOfLines={3}
                placeholder="Add notes..."
                placeholderTextColor={Colors.muted}
                value={formCostNotes}
                onChangeText={setFormCostNotes}
              />
            </View>
          </ScrollView>
        </SafeAreaWrapper>
      </Modal>

    </MainLayout>
  );
}

const styles = StyleSheet.create({
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: 4,
  },
  backLinkText: {
    color: Colors.muted,
    fontSize: Typography.sizes.md,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    marginLeft: Spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: Colors.muted,
    fontSize: Typography.sizes.md,
    marginTop: Spacing.sm,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  unitCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  unitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  unitInfo: {
    flex: 1,
  },
  unitName: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  unitDesc: {
    color: Colors.muted,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 6,
  },
  statusActive: {
    backgroundColor: 'rgba(76,175,80,0.1)',
  },
  statusInactive: {
    backgroundColor: 'rgba(244,67,54,0.1)',
  },
  statusText: {
    color: Colors.primary,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
  },
  detailWrapper: {
    flex: 1,
  },
  configHeader: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  configTitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  configSubtitle: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
    marginTop: 2,
  },
  carouselContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 60,
    gap: 16,
  },
  carouselCard: {
    width: CARD_WIDTH,
    height: 480,
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  carouselCardTitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  addButtonMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselCardScroll: {
    flex: 1,
  },
  relationSection: {
    gap: Spacing.md,
  },
  noDataText: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  itemCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemName: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  itemQty: {
    color: Colors.primary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    marginTop: 4,
  },
  itemNotes: {
    color: Colors.muted,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  saveText: {
    color: Colors.primary,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  modalFormContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    color: Colors.foreground,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.foreground,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.sizes.md,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    height: 48,
  },
  dropdownValue: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContent: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  pickerTitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  pickerDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  pickerItem: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activePickerItem: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  pickerLabel: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    textAlign: 'center',
  },
  activePickerLabel: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
});
