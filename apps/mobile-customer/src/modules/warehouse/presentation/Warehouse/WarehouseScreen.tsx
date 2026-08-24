import React, { useState, useEffect, useCallback } from 'react';
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
  Platform
} from 'react-native';
import { useTranslation } from '@kplian/i18n';
import { MainLayout } from '../../../../shared/layout/MainLayout';
import { Colors, Spacing, Typography } from '../../../../shared/theme/constants';
import { WarehouseRepositoryImpl, StockLevelRepositoryImpl, StockLevelAlertRepositoryImpl, createApiClient } from '@kplian/infrastructure';
import { WORKFLOW_CONSTANTS } from '../workflowConstants';
import { Warehouse, StockLevel, CreateStockLevelDto, UpdateStockLevelDto, StockLevelAlert, CreateStockLevelAlertDto, UpdateStockLevelAlertDto, loadDomainParameters, getBatchParameters } from '@kplian/core';
import { Ionicons } from '@expo/vector-icons';
import { useVendor } from '../../../../shared/auth/AuthContext';
import { styles } from './styles/WarehouseScreenStyles';

const warehouseRepo = new WarehouseRepositoryImpl();
const stockLevelRepo = new StockLevelRepositoryImpl();
const stockLevelAlertRepo = new StockLevelAlertRepositoryImpl();
const workflowApi = createApiClient('workflow');

interface WarehouseScreenProps {
  onBack: () => void;
  onNavigate?: (route: string) => void;
}

export default function WarehouseScreen({ onBack, onNavigate }: WarehouseScreenProps) {
  const { t } = useTranslation();
  const { vendor: vendorId, vendorCode } = useVendor();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown options
  const [typeOptions, setTypeOptions] = useState<{ CODE: string; name: string }[]>([]);
  const [locationOptions, setLocationOptions] = useState<{ CODE: string; name: string }[]>([]);
  const [costMethodOptions, setCostMethodOptions] = useState<{ CODE: string; name: string }[]>([]);

  const statusOptions = [
    { CODE: 'ACTIVE', name: 'Active' },
    { CODE: 'INACTIVE', name: 'Inactive' },
  ];

  // Form State
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'detail' | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formType, setFormType] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCostMethod, setFormCostMethod] = useState('');
  const [formStatus, setFormStatus] = useState('ACTIVE');

  // Menus State
  const [activeMenuWarehouseId, setActiveMenuWarehouseId] = useState<string | null>(null);

  // Stock Levels State
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [stockLevelsActiveWarehouse, setStockLevelsActiveWarehouse] = useState<Warehouse | null>(null);
  const [stockLevelModalMode, setStockLevelModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedStockLevel, setSelectedStockLevel] = useState<StockLevel | null>(null);
  const [formItemCode, setFormItemCode] = useState('');
  const [formMinQuantity, setFormMinQuantity] = useState('0');
  const [formStockLevelStatus, setFormStockLevelStatus] = useState('ACTIVE');

  // Stock Level Alerts State
  const [stockLevelAlerts, setStockLevelAlerts] = useState<StockLevelAlert[]>([]);
  const [stockLevelAlertsActiveStockLevel, setStockLevelAlertsActiveStockLevel] = useState<StockLevel | null>(null);
  const [stockLevelAlertModalMode, setStockLevelAlertModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedStockLevelAlert, setSelectedStockLevelAlert] = useState<StockLevelAlert | null>(null);
  const [formAlertMinQuantity, setFormAlertMinQuantity] = useState('0');
  const [formAlertMaxQuantity, setFormAlertMaxQuantity] = useState('0');
  const [formAlertType, setFormAlertType] = useState('WAR');
  const [formAlertNotificationCode, setFormAlertNotificationCode] = useState('EMAIL');
  const [formAlertStatus, setFormAlertStatus] = useState('ACTIVE');

  // Item parameter options loaded from parameter microservice
  const [itemOptions, setItemOptions] = useState<any[]>([]);

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

  const renderPickerModal = () => (
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
  );

  // Load parameters dynamically
  useEffect(() => {
    if (!vendorId) return;
    const fetchParams = async () => {
      try {
        const mapped = await loadDomainParameters(
          getBatchParameters,
          [
            { fullCode: 'WAR/MAIN/ITEM' },
            { fullCode: 'WAR/MAIN/WAT' },
            { fullCode: 'GEO/LOC/LOC' },
            { fullCode: 'WAR/MAIN/TVAL' }
          ]
        );
        console.log('[Warehouse Debug] fetchParams Mapped:', JSON.stringify(mapped));
        
        if (mapped['WAR/MAIN/ITEM']) {
          const list = mapped['WAR/MAIN/ITEM'].map((x: any) => ({
            CODE: x.CODE || x.code,
            name: x.NAME || x.name || x.description || x.CODE || x.code
          }));
          setItemOptions(list);
        }

        if (mapped['WAR/MAIN/WAT']) {
          const list = mapped['WAR/MAIN/WAT'].map((x: any) => ({
            CODE: x.CODE || x.code,
            name: x.NAME || x.name || x.description || x.CODE || x.code
          }));
          setTypeOptions(list);
        }

        if (mapped['GEO/LOC/LOC']) {
          const list = mapped['GEO/LOC/LOC'].map((x: any) => ({
            CODE: x.CODE || x.code || x.codea3 || x.CODEA3 || x.key,
            name: x.NAME || x.name || x.description || x.CODE || x.code
          }));
          setLocationOptions(list);
        }

        if (mapped['WAR/MAIN/TVAL']) {
          const list = mapped['WAR/MAIN/TVAL'].map((x: any) => ({
            CODE: x.CODE || x.code,
            name: x.NAME || x.name || x.description || x.CODE || x.code
          }));
          setCostMethodOptions(list);
        }
      } catch (err) {
        console.error('Failed to load parameters:', err);
      }
    };
    fetchParams();
  }, [vendorId]);

  const fetchStockLevels = useCallback(async (warehouseId: string) => {
    setLoading(true);
    try {
      const data = await stockLevelRepo.getByWarehouse(warehouseId);
      setStockLevels(data);
    } catch (error) {
      console.error('Error loading stock levels:', error);
      Alert.alert('Error', 'Failed to load stock levels.');
    } finally {
      setLoading(false);
    }
  }, []);

  const openCreateStockLevelModal = () => {
    setSelectedStockLevel(null);
    setFormItemCode('');
    setFormMinQuantity('0');
    setFormStockLevelStatus('ACTIVE');
    setStockLevelModalMode('create');
  };

  const openEditStockLevelModal = (sl: StockLevel) => {
    setSelectedStockLevel(sl);
    setFormItemCode(sl.itemCode);
    setFormMinQuantity(sl.minQuantity !== undefined ? String(sl.minQuantity) : '0');
    setFormStockLevelStatus(sl.status || 'ACTIVE');
    setStockLevelModalMode('edit');
  };

  const handleSaveStockLevel = async () => {
    if (!stockLevelsActiveWarehouse) return;
    if (!formItemCode.trim() || !formMinQuantity.trim()) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    setLoading(true);
    try {
      if (stockLevelModalMode === 'create') {
        await stockLevelRepo.create({
          warehouseId: stockLevelsActiveWarehouse.id,
          itemCode: formItemCode,
          minQuantity: parseFloat(formMinQuantity)
        });
        Alert.alert('Success', 'Stock level created successfully.');
      } else if (stockLevelModalMode === 'edit' && selectedStockLevel) {
        await stockLevelRepo.update({
          id: selectedStockLevel.id,
          warehouseId: stockLevelsActiveWarehouse.id,
          itemCode: formItemCode,
          minQuantity: parseFloat(formMinQuantity)
        });
        Alert.alert('Success', 'Stock level updated successfully.');
      }
      setStockLevelModalMode(null);
      fetchStockLevels(stockLevelsActiveWarehouse.id);
    } catch (error) {
      console.error('Error saving stock level:', error);
      Alert.alert('Error', 'Failed to save stock level.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStockLevel = (id: string) => {
    const doDelete = async () => {
      setLoading(true);
      try {
        await stockLevelRepo.delete(id);
        Alert.alert('Success', 'Stock level deleted successfully.');
        if (stockLevelsActiveWarehouse) {
          fetchStockLevels(stockLevelsActiveWarehouse.id);
        }
      } catch (error) {
        console.error('Error deleting stock level:', error);
        Alert.alert('Error', 'Failed to delete stock level.');
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete this stock level?');
      if (confirmed) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Delete Stock Level',
        'Are you sure you want to delete this stock level?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: doDelete
          }
        ]
      );
    }
  };

  const fetchStockLevelAlerts = useCallback(async (stockLevelId: string) => {
    setLoading(true);
    try {
      const data = await stockLevelAlertRepo.getByStockLevel(stockLevelId);
      setStockLevelAlerts(data);
    } catch (error) {
      console.error('Error loading stock level alerts:', error);
      Alert.alert('Error', 'Failed to load stock level alerts.');
    } finally {
      setLoading(false);
    }
  }, []);

  const openCreateStockLevelAlertModal = () => {
    setSelectedStockLevelAlert(null);
    setFormAlertMinQuantity('0');
    setFormAlertMaxQuantity('0');
    setFormAlertType('WAR');
    setFormAlertNotificationCode('EMAIL');
    setFormAlertStatus('ACTIVE');
    setStockLevelAlertModalMode('create');
  };

  const openEditStockLevelAlertModal = (sla: StockLevelAlert) => {
    setSelectedStockLevelAlert(sla);
    setFormAlertMinQuantity(sla.minQuantity !== undefined ? String(sla.minQuantity) : '0');
    setFormAlertMaxQuantity(sla.maxQuantity !== undefined ? String(sla.maxQuantity) : '0');
    setFormAlertType(sla.type || 'WAR');
    setFormAlertNotificationCode(sla.notificationCode || 'EMAIL');
    setFormAlertStatus(sla.status || 'ACTIVE');
    setStockLevelAlertModalMode('edit');
  };

  const handleSaveStockLevelAlert = async () => {
    if (!stockLevelAlertsActiveStockLevel) return;
    if (!formAlertMinQuantity.trim() || !formAlertMaxQuantity.trim() || !formAlertType.trim() || !formAlertNotificationCode.trim()) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    setLoading(true);
    try {
      if (stockLevelAlertModalMode === 'create') {
        await stockLevelAlertRepo.create({
          stockLevelId: stockLevelAlertsActiveStockLevel.id,
          minQuantity: parseFloat(formAlertMinQuantity),
          maxQuantity: parseFloat(formAlertMaxQuantity),
          type: formAlertType,
          notificationCode: formAlertNotificationCode,
        });
        Alert.alert('Success', 'Stock level alert created successfully.');
      } else if (stockLevelAlertModalMode === 'edit' && selectedStockLevelAlert) {
        await stockLevelAlertRepo.update({
          id: selectedStockLevelAlert.id,
          stockLevelId: stockLevelAlertsActiveStockLevel.id,
          minQuantity: parseFloat(formAlertMinQuantity),
          maxQuantity: parseFloat(formAlertMaxQuantity),
          type: formAlertType,
          notificationCode: formAlertNotificationCode,
        });
        Alert.alert('Success', 'Stock level alert updated successfully.');
      }
      setStockLevelAlertModalMode(null);
      fetchStockLevelAlerts(stockLevelAlertsActiveStockLevel.id);
    } catch (error) {
      console.error('Error saving stock level alert:', error);
      Alert.alert('Error', 'Failed to save stock level alert.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStockLevelAlert = (id: string) => {
    const doDelete = async () => {
      setLoading(true);
      try {
        await stockLevelAlertRepo.delete(id);
        Alert.alert('Success', 'Stock level alert deleted successfully.');
        if (stockLevelAlertsActiveStockLevel) {
          fetchStockLevelAlerts(stockLevelAlertsActiveStockLevel.id);
        }
      } catch (error) {
        console.error('Error deleting stock level alert:', error);
        Alert.alert('Error', 'Failed to delete alert.');
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete this alert?');
      if (confirmed) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Delete Stock Level Alert',
        'Are you sure you want to delete this alert?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: doDelete
          }
        ]
      );
    }
  };

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      let data: Warehouse[] = [];
      if (searchQuery.trim()) {
        const result = await warehouseRepo.search({
          vendorCode: vendorCode || undefined,
          name: searchQuery,
          code: searchQuery,
          size: 50
        });
        data = result.content || result.data || result.results || [];
      } else {
        if (vendorCode) {
          data = await warehouseRepo.getByVendor(vendorCode);
        } else {
          data = await warehouseRepo.getAll();
        }
      }
      setWarehouses(data);
    } catch (error) {
      console.error('Error loading warehouses:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, vendorCode]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const openCreateModal = () => {
    setSelectedWarehouse(null);
    setFormName('');
    setFormCode('');
    setFormType('');
    setFormLocation('');
    setFormAddress('');
    setFormCostMethod('');
    setFormStatus('ACTIVE');
    setModalMode('create');
  };

  const openEditModal = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setFormName(warehouse.name || '');
    setFormCode(warehouse.code || '');
    setFormType(warehouse.type || 'WAR');
    setFormLocation(warehouse.locationCode || 'GEO');
    setFormAddress(warehouse.address || '');
    setFormCostMethod(warehouse.costMethodCode || 'WAR');
    setFormStatus(warehouse.status || 'ACTIVE');
    setModalMode('edit');
  };

  const openDetailModal = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setModalMode('detail');
  };

  const handleSave = async () => {
    if (!formName.trim() || !formCode.trim()) {
      Alert.alert('Error', 'Name and Code are required.');
      return;
    }

    setLoading(true);
    try {
      if (modalMode === 'create') {
        await warehouseRepo.create({
          vendorCode: vendorCode || 'SYSTEM',
          code: formCode,
          name: formName,
          type: formType || undefined,
          locationCode: formLocation || undefined,
          address: formAddress || undefined,
          costMethodCode: formCostMethod || undefined
        });
        Alert.alert('Success', 'Warehouse created successfully.');
      } else if (modalMode === 'edit' && selectedWarehouse) {
        await warehouseRepo.update({
          id: selectedWarehouse.id,
          vendorCode: selectedWarehouse.vendorCode,
          code: formCode,
          name: formName,
          type: formType || undefined,
          locationCode: formLocation || undefined,
          address: formAddress || undefined,
          costMethodCode: formCostMethod || undefined
        });
        Alert.alert('Success', 'Warehouse updated successfully.');
      }
      setModalMode(null);
      fetchWarehouses();
    } catch (error) {
      console.error('Error saving warehouse:', error);
      Alert.alert('Error', 'Failed to save warehouse.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    const doDelete = async () => {
      setLoading(true);
      try {
        await warehouseRepo.delete(id);
        Alert.alert('Success', 'Warehouse deleted successfully.');
        setModalMode(null);
        fetchWarehouses();
      } catch (error) {
        console.error('Error deleting warehouse:', error);
        Alert.alert('Error', 'Failed to delete warehouse.');
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete this warehouse?');
      if (confirmed) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Delete Warehouse',
        'Are you sure you want to delete this warehouse?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: doDelete
          }
        ]
      );
    }
  };

  const openDropdownPicker = (
    title: string,
    data: any[],
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

  const getParamLabel = (data: any[], val: string) => {
    const item = data.find(i => i.CODE === val);
    return item ? item.name : val;
  };

  const handleNext = (warehouse: Warehouse) => {
    const doNext = async () => {
      setLoading(true);
      try {
        await workflowApi.post('/v1/state-machine/transition', {
          entity: WORKFLOW_CONSTANTS.WAREHOUSE.entity,
          processName: WORKFLOW_CONSTANTS.WAREHOUSE.processName,
          id: warehouse.id,
          action: 'forward'
        });
        Alert.alert('Success', 'Successfully moved to next step.');
        await fetchWarehouses();
      } catch (error: any) {
        console.error('Error transitioning warehouse:', error);
        Alert.alert('Error', error?.response?.data?.message || 'Failed to move to next step.');
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to move ${warehouse.name} to the next step?`);
      if (confirmed) {
        doNext();
      }
    } else {
      Alert.alert(
        'Next Step',
        `Are you sure you want to move ${warehouse.name} to the next step?`,
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

  const handleCancel = (warehouse: Warehouse) => {
    const doCancel = async () => {
      setLoading(true);
      try {
        await workflowApi.post('/v1/state-machine/transition', {
          entity: WORKFLOW_CONSTANTS.WAREHOUSE.entity,
          processName: WORKFLOW_CONSTANTS.WAREHOUSE.processName,
          id: warehouse.id,
          action: 'annul'
        });
        Alert.alert('Success', 'Successfully cancelled.');
        await fetchWarehouses();
      } catch (error: any) {
        console.error('Error cancelling action:', error);
        Alert.alert('Error', error?.response?.data?.message || 'Failed to cancel action.');
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to cancel the action for ${warehouse.name}?`);
      if (confirmed) {
        doCancel();
      }
    } else {
      Alert.alert(
        'Cancel Action',
        `Are you sure you want to cancel the action for ${warehouse.name}?`,
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

  if (stockLevelAlertsActiveStockLevel) {
    return (
      <MainLayout headerTitle={`Alerts: Item ${getParamLabel(itemOptions, stockLevelAlertsActiveStockLevel.itemCode)}`}>
        <TouchableOpacity style={styles.backLink} onPress={() => setStockLevelAlertsActiveStockLevel(null)}>
          <Ionicons name="arrow-back" size={20} color={Colors.muted} />
          <Text style={styles.backLinkText}>Volver a Stock Levels</Text>
        </TouchableOpacity>

        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Alerts</Text>
          <TouchableOpacity style={styles.addButton} onPress={openCreateStockLevelAlertModal}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading && stockLevelAlerts.length === 0 ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : stockLevelAlerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color={Colors.muted} />
            <Text style={styles.emptyText}>No alerts defined for this stock level.</Text>
          </View>
        ) : (
          <ScrollView style={styles.scroll}>
            {stockLevelAlerts.map(sla => (
              <View key={sla.id} style={styles.warehouseCard}>
                <View style={styles.warehouseIcon}>
                  <Ionicons name="alert-circle" size={24} color={Colors.primary} />
                </View>
                <View style={styles.warehouseInfo}>
                  <Text style={styles.warehouseName}>Type: {sla.type}</Text>
                  <Text style={sla.maxQuantity !== undefined ? styles.warehouseDesc : styles.warehouseDesc}>Min: {sla.minQuantity} | Max: {sla.maxQuantity}</Text>
                  <Text style={styles.warehouseDesc}>Code: {sla.notificationCode}</Text>
                  <Text style={[styles.typeTag, { color: sla.status === 'ACTIVE' ? Colors.primary : Colors.muted }]}>
                    Status: {sla.status || 'ACTIVE'}
                  </Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.iconButton} onPress={() => openEditStockLevelAlertModal(sla)}>
                    <Ionicons name="create-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteStockLevelAlert(sla.id)}>
                    <Ionicons name="trash-outline" size={20} color={Colors.destructive} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Alert Edit/Create Modal */}
        <Modal
          visible={stockLevelAlertModalMode !== null}
          animationType="slide"
          onRequestClose={() => setStockLevelAlertModalMode(null)}
        >
          <SafeAreaWrapper style={styles.modalRoot}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setStockLevelAlertModalMode(null)}>
                <Ionicons name="close" size={28} color={Colors.muted} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {stockLevelAlertModalMode === 'create' ? 'Create Alert' : 'Edit Alert'}
              </Text>
              <TouchableOpacity onPress={handleSaveStockLevelAlert}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalFormContent}>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Alert Type</Text>
                <TouchableOpacity 
                  style={styles.dropdownTrigger}
                  onPress={() => openDropdownPicker('Select Type', [
                    { CODE: 'WAR', name: 'WAR - Warehouse Alert' },
                    { CODE: 'MAIN', name: 'MAIN - Main Alert' },
                    { CODE: 'ALL', name: 'ALL - All' }
                  ], formAlertType, setFormAlertType)}
                >
                  <Text style={styles.dropdownValue}>
                    {formAlertType}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={Colors.muted} />
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Min Quantity</Text>
                <TextInput 
                  style={styles.textInput}
                  value={formAlertMinQuantity}
                  onChangeText={setFormAlertMinQuantity}
                  keyboardType="numeric"
                  placeholder="Minimum Quantity"
                  placeholderTextColor={Colors.muted}
                />

                <Text style={styles.inputLabel}>Max Quantity</Text>
                <TextInput 
                  style={styles.textInput}
                  value={formAlertMaxQuantity}
                  onChangeText={setFormAlertMaxQuantity}
                  keyboardType="numeric"
                  placeholder="Maximum Quantity"
                  placeholderTextColor={Colors.muted}
                />

                <Text style={styles.inputLabel}>Notification Code</Text>
                <TouchableOpacity 
                  style={styles.dropdownTrigger}
                  onPress={() => openDropdownPicker('Select Code', [
                    { CODE: 'EMAIL', name: 'EMAIL - Send Email' },
                    { CODE: 'SMS', name: 'SMS - Send Text Message' },
                    { CODE: 'PUSH', name: 'PUSH - Mobile Push Notification' },
                    { CODE: 'IN_APP', name: 'IN_APP - Internal Notification' }
                  ], formAlertNotificationCode, setFormAlertNotificationCode)}
                >
                  <Text style={styles.dropdownValue}>
                    {formAlertNotificationCode}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={Colors.muted} />
                </TouchableOpacity>

                {stockLevelAlertModalMode === 'edit' && (
                  <>
                    <Text style={styles.inputLabel}>Status</Text>
                    <TouchableOpacity 
                      style={styles.dropdownTrigger}
                      onPress={() => openDropdownPicker('Select Status', statusOptions, formAlertStatus, setFormAlertStatus)}
                    >
                      <Text style={styles.dropdownValue}>
                        {formAlertStatus}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color={Colors.muted} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </ScrollView>


            {pickerModal.visible && renderPickerModal()}
          </SafeAreaWrapper>
        </Modal>
      </MainLayout>
    );
  }

  if (stockLevelsActiveWarehouse) {
    return (
      <MainLayout headerTitle={`Stock Levels: ${stockLevelsActiveWarehouse.name}`}>
        <TouchableOpacity style={styles.backLink} onPress={() => setStockLevelsActiveWarehouse(null)}>
          <Ionicons name="arrow-back" size={20} color={Colors.muted} />
          <Text style={styles.backLinkText}>Volver a Almacenes</Text>
        </TouchableOpacity>

        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Stock Levels</Text>
          <TouchableOpacity style={styles.addButton} onPress={openCreateStockLevelModal}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading && stockLevels.length === 0 ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : stockLevels.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="layers-outline" size={48} color={Colors.muted} />
            <Text style={styles.emptyText}>No stock levels defined for this warehouse.</Text>
          </View>
        ) : (
          <ScrollView style={styles.scroll}>
            {stockLevels.map(sl => (
              <View key={sl.id} style={styles.warehouseCard}>
                <View style={styles.warehouseIcon}>
                  <Ionicons name="layers" size={24} color={Colors.primary} />
                </View>
                <View style={styles.warehouseInfo}>
                  <Text style={styles.warehouseName}>
                    Item: {getParamLabel(itemOptions, sl.itemCode)}
                  </Text>
                  <Text style={styles.warehouseDesc}>Min Qty: {sl.minQuantity}</Text>
                  <Text style={[styles.typeTag, { color: sl.status === 'ACTIVE' ? Colors.primary : Colors.muted }]}>
                    Status: {sl.status}
                  </Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={styles.iconButton} 
                    onPress={() => {
                      setStockLevelAlertsActiveStockLevel(sl);
                      fetchStockLevelAlerts(sl.id);
                    }}
                  >
                    <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton} onPress={() => openEditStockLevelModal(sl)}>
                    <Ionicons name="create-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteStockLevel(sl.id)}>
                    <Ionicons name="trash-outline" size={20} color={Colors.destructive} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Stock Level Edit/Create Modal */}
        <Modal
          visible={stockLevelModalMode !== null}
          animationType="slide"
          onRequestClose={() => setStockLevelModalMode(null)}
        >
          <SafeAreaWrapper style={styles.modalRoot}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setStockLevelModalMode(null)}>
                <Ionicons name="close" size={28} color={Colors.muted} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {stockLevelModalMode === 'create' ? 'Create Stock Level' : 'Edit Stock Level'}
              </Text>
              <TouchableOpacity onPress={handleSaveStockLevel}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalFormContent}>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Item Code</Text>
                <TouchableOpacity 
                  style={styles.dropdownTrigger}
                  onPress={() => openDropdownPicker('Select Item', itemOptions, formItemCode, setFormItemCode)}
                >
                  <Text style={styles.dropdownValue}>
                    {getParamLabel(itemOptions, formItemCode) || 'Select Item...'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={Colors.muted} />
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Min Quantity</Text>
                <TextInput 
                  style={styles.textInput}
                  value={formMinQuantity}
                  onChangeText={setFormMinQuantity}
                  keyboardType="numeric"
                  placeholder="Minimum Quantity"
                  placeholderTextColor={Colors.muted}
                />



                {stockLevelModalMode === 'edit' && (
                  <>
                    <Text style={styles.inputLabel}>Status</Text>
                    <TouchableOpacity 
                      style={styles.dropdownTrigger}
                      onPress={() => openDropdownPicker('Select Status', statusOptions, formStockLevelStatus, setFormStockLevelStatus)}
                    >
                      <Text style={styles.dropdownValue}>
                        {getParamLabel(statusOptions, formStockLevelStatus) || 'Select Status...'}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color={Colors.muted} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </ScrollView>

            {pickerModal.visible && renderPickerModal()}
          </SafeAreaWrapper>
        </Modal>
      </MainLayout>
    );
  }

  return (
    <MainLayout headerTitle={t('warehouse.title', 'Warehouse Management')}>
      <TouchableOpacity style={styles.backLink} onPress={onBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.muted} />
        <Text style={styles.backLinkText}>Volver</Text>
      </TouchableOpacity>

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Warehouses</Text>
        <TouchableOpacity testID="add-warehouse-button" style={styles.addButton} onPress={openCreateModal}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={Colors.muted} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search by name or code..."
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

      {loading && warehouses.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : warehouses.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="business-outline" size={48} color={Colors.muted} />
          <Text style={styles.emptyText}>No warehouses found.</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll}>
          {warehouses.map(warehouse => (
            <View 
              key={warehouse.id} 
              style={[styles.warehouseCard, { flexDirection: 'column', alignItems: 'stretch', zIndex: activeMenuWarehouseId === warehouse.id ? 100 : 1, overflow: 'visible', paddingBottom: activeMenuWarehouseId === warehouse.id ? 100 : Spacing.md }]}
            >
              {/* Row 1: Info and 3-dots Menu Button */}
              <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative', zIndex: activeMenuWarehouseId === warehouse.id ? 10 : 1 }}>
                <View style={styles.warehouseIcon}>
                  <Ionicons name="business" size={24} color={Colors.primary} />
                </View>
                <View style={styles.warehouseInfo}>
                  <Text style={styles.warehouseName}>{warehouse.name}</Text>
                  <Text style={styles.warehouseDesc}>Code: {warehouse.code}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    {warehouse.type && (
                      <Text style={[styles.typeTag, { marginTop: 0 }]}>
                        {getParamLabel(typeOptions, warehouse.type)}
                      </Text>
                    )}
                    {warehouse.status && (
                      <View style={[
                        styles.statusBadge, 
                        { backgroundColor: warehouse.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)' }
                      ]}>
                        <Text style={[
                          styles.statusBadgeText, 
                          { color: warehouse.status === 'ACTIVE' ? Colors.primary : Colors.muted }
                        ]}>
                          {warehouse.status}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                
                {/* 3-dots Menu Trigger */}
                <View style={{ position: 'relative', zIndex: 999 }}>
                  <TouchableOpacity 
                    style={[styles.iconButton, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 10, padding: 8 }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      setActiveMenuWarehouseId(activeMenuWarehouseId === warehouse.id ? null : warehouse.id);
                    }}
                  >
                    <Ionicons name="ellipsis-vertical" size={20} color={Colors.foreground} />
                  </TouchableOpacity>

                  {/* Dropdown Menu Overlay */}
                  {activeMenuWarehouseId === warehouse.id && (
                    <>
                      {/* Full-screen invisible press handler to detect outside clicks */}
                      <Pressable 
                        style={{
                          position: 'absolute',
                          top: -1000,
                          left: -1000,
                          right: -1000,
                          bottom: -1000,
                          zIndex: 998,
                        }}
                        onPress={() => setActiveMenuWarehouseId(null)}
                      />
                      <View style={[styles.dropdownMenu, { zIndex: 9999 }]}>
                        <TouchableOpacity 
                          style={styles.dropdownMenuItem}
                          onPress={(e) => {
                            e.stopPropagation();
                            setActiveMenuWarehouseId(null);
                            openEditModal(warehouse);
                          }}
                        >
                          <Text style={styles.dropdownMenuText}>Edit</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.dropdownMenuItem}
                          onPress={(e) => {
                            e.stopPropagation();
                            setActiveMenuWarehouseId(null);
                            openDetailModal(warehouse);
                          }}
                        >
                          <Text style={styles.dropdownMenuText}>Detail</Text>
                        </TouchableOpacity>

                        <View style={styles.dropdownDivider} />

                        <TouchableOpacity 
                          style={styles.dropdownMenuItem}
                          onPress={(e) => {
                            e.stopPropagation();
                            setActiveMenuWarehouseId(null);
                            handleDelete(warehouse.id);
                          }}
                        >
                          <Text style={[styles.dropdownMenuText, { color: Colors.destructive }]}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              </View>

              {/* Space between Row 1 and Row 2 */}
              <View style={{ height: Spacing.md }} />

              {/* Row 2: Cancel (left, neutral) and Next (right, primary) */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.sm, zIndex: 0 }}>
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleCancel(warehouse);
                  }}
                >
                  <Ionicons name="close-circle-outline" size={20} color={Colors.muted} />
                  <Text style={{ color: Colors.muted, fontSize: Typography.sizes.sm, fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleNext(warehouse);
                  }}
                >
                  <Ionicons name="arrow-forward-circle-outline" size={20} color={Colors.primary} />
                  <Text style={{ color: Colors.primary, fontSize: Typography.sizes.sm, fontWeight: 'bold' }}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Form (Create / Edit) & Detail Modals */}
      <Modal
        visible={modalMode !== null}
        animationType="slide"
        onRequestClose={() => setModalMode(null)}
      >
        <SafeAreaWrapper style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalMode(null)}>
              <Ionicons name="close" size={28} color={Colors.muted} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {modalMode === 'create' && 'Create Warehouse'}
              {modalMode === 'edit' && 'Edit Warehouse'}
              {modalMode === 'detail' && 'Warehouse Details'}
            </Text>
            {modalMode !== 'detail' ? (
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 28 }} />
            )}
          </View>

          <ScrollView style={styles.modalFormContent} contentContainerStyle={{ paddingBottom: 60 }}>
            {modalMode === 'detail' && selectedWarehouse ? (
              <View style={styles.detailCard}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name</Text>
                  <Text style={styles.detailValue}>{selectedWarehouse.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Code</Text>
                  <Text style={styles.detailValue}>{selectedWarehouse.code}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>
                    {getParamLabel(typeOptions, selectedWarehouse.type || '') || 'None'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>
                    {getParamLabel(locationOptions, selectedWarehouse.locationCode || '') || 'None'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Address</Text>
                  <Text style={styles.detailValue}>{selectedWarehouse.address || 'None'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cost Method</Text>
                  <Text style={styles.detailValue}>
                    {getParamLabel(costMethodOptions, selectedWarehouse.costMethodCode || '') || 'None'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={styles.detailValue}>{selectedWarehouse.status || 'ACTIVE'}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Type</Text>
                <TouchableOpacity 
                  style={styles.dropdownTrigger}
                  onPress={() => openDropdownPicker('Select Type', typeOptions, formType, setFormType)}
                >
                  <Text style={styles.dropdownValue}>
                    {getParamLabel(typeOptions, formType) || 'Select Type...'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={Colors.muted} />
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Code</Text>
                <TextInput 
                  style={styles.textInput}
                  value={formCode}
                  onChangeText={setFormCode}
                  placeholder="Warehouse Code"
                  placeholderTextColor={Colors.muted}
                />

                <Text style={styles.inputLabel}>Name</Text>
                <TextInput 
                  style={styles.textInput}
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="Warehouse Name"
                  placeholderTextColor={Colors.muted}
                />

                <Text style={styles.inputLabel}>Location Code</Text>
                <TouchableOpacity 
                  style={styles.dropdownTrigger}
                  onPress={() => openDropdownPicker('Select Location', locationOptions, formLocation, setFormLocation)}
                >
                  <Text style={styles.dropdownValue}>
                    {getParamLabel(locationOptions, formLocation) || 'Select Location...'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={Colors.muted} />
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Address</Text>
                <TextInput 
                  style={[styles.textInput, styles.textArea]}
                  value={formAddress}
                  onChangeText={setFormAddress}
                  placeholder="Warehouse Address"
                  placeholderTextColor={Colors.muted}
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.inputLabel}>Cost Method Code</Text>
                <TouchableOpacity 
                  style={styles.dropdownTrigger}
                  onPress={() => openDropdownPicker('Select Cost Method', costMethodOptions, formCostMethod, setFormCostMethod)}
                >
                  <Text style={styles.dropdownValue}>
                    {getParamLabel(costMethodOptions, formCostMethod) || 'Select Cost Method...'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={Colors.muted} />
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Status</Text>
                <TouchableOpacity 
                  style={styles.dropdownTrigger}
                  onPress={() => openDropdownPicker('Select Status', statusOptions, formStatus, setFormStatus)}
                >
                  <Text style={styles.dropdownValue}>
                    {getParamLabel(statusOptions, formStatus) || 'Select Status...'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={Colors.muted} />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

            {pickerModal.visible && renderPickerModal()}
         </SafeAreaWrapper>
       </Modal>
     </MainLayout>
   );
 }

const SafeAreaWrapper = ({ children, style }: { children: React.ReactNode; style?: any }) => {
  return <View style={[{ flex: 1, backgroundColor: Colors.background, paddingTop: 40 }, style]}>{children}</View>;
};
