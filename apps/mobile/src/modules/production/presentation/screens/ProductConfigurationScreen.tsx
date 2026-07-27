import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  Modal,
  TextInput,
  Dimensions,
  Pressable,
  FlatList
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 48;
import { useTranslation } from '@kplian/i18n';
import { MainLayout } from '../../../../shared/layout/MainLayout';
import { Colors, Spacing, Typography } from '../../../../shared/theme/constants';
import { useVendor } from '../../../../shared/auth/AuthContext';
import { 
  ProductRepositoryImpl, 
  ProductConfigurationRepositoryImpl,
  ProductItemRepositoryImpl,
  ProductTaskRepositoryImpl,
  ProductVariableRepositoryImpl,
  ProductOperatorSkillRepositoryImpl
} from '@kplian/infrastructure';
import { Product, ProductConfiguration, ProductItem, ProductTask, ProductVariable, ProductOperatorSkill, loadDomainParameters, getBatchParameters } from '@kplian/core';
import { Ionicons } from '@expo/vector-icons';

const productRepo = new ProductRepositoryImpl();
const configRepo = new ProductConfigurationRepositoryImpl();
const itemRepo = new ProductItemRepositoryImpl();
const taskRepo = new ProductTaskRepositoryImpl();
const varRepo = new ProductVariableRepositoryImpl();
const skillRepo = new ProductOperatorSkillRepositoryImpl();

interface ProductConfigurationScreenProps {
  productId: string;
  onBack: () => void;
}

export default function ProductConfigurationScreen({ productId, onBack }: ProductConfigurationScreenProps) {
  const { t } = useTranslation();
  const { vendor: vendorId } = useVendor();
  const carouselRef = useRef<ScrollView>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [configurations, setConfigurations] = useState<ProductConfiguration[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<ProductConfiguration | null>(null);
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'ITEMS' | 'TASKS' | 'VARIABLES' | 'SKILLS'>('DETAILS');

  // Dropdown parameters states
  const [unitMeasures, setUnitMeasures] = useState<any[]>([]);
  const [warehouseItems, setWarehouseItems] = useState<any[]>([]);
  const [businessRules, setBusinessRules] = useState<any[]>([]);
  const [operatorSkills, setOperatorSkills] = useState<any[]>([]);

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
    const item = data.find(
      i => (i.CODE || i.code) === val
    );
    return item ? (item.NAME || item.name || item.description || val) : val;
  };

  useEffect(() => {
    const fetchParameters = async () => {
      try {
        const mapped = await loadDomainParameters(
          getBatchParameters,
          [
            { fullCode: 'GEN/MAIN/MEA' },
            { fullCode: 'WAR/MAIN/ITEM' },
            { fullCode: 'TM/SPE/SPE' }
          ]
        );
        if (mapped['GEN/MAIN/MEA']) {
          setUnitMeasures(mapped['GEN/MAIN/MEA']);
        }
        if (mapped['WAR/MAIN/ITEM']) {
          setWarehouseItems(mapped['WAR/MAIN/ITEM']);
        }
        if (mapped['TM/SPE/SPE']) {
          setOperatorSkills(mapped['TM/SPE/SPE']);
        }
      } catch (error) {
        console.error('Failed to load parameters in config:', error);
      }
    };
    fetchParameters();
  }, []);

  useEffect(() => {
    if (!vendorId) return;
    const fetchRules = async () => {
      try {
        const rules = await varRepo.getRulesByVendor(vendorId);
        setBusinessRules(rules);
      } catch (error) {
        console.error('Failed to load rules by vendor:', error);
      }
    };
    fetchRules();
  }, [vendorId]);

  // Creation Form State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ProductConfiguration | null>(null);
  const [formCode, setFormCode] = useState('');
  const [formVersion, setFormVersion] = useState('');
  const [formFromDate, setFormFromDate] = useState('');
  const [formToDate, setFormToDate] = useState('');
  const [formQty, setFormQty] = useState('');

  // Edit item state
  const [editingItem, setEditingItem] = useState<ProductItem | null>(null);
  const [editingTask, setEditingTask] = useState<ProductTask | null>(null);
  const [editingVar, setEditingVar] = useState<ProductVariable | null>(null);
  const [editingSkill, setEditingSkill] = useState<ProductOperatorSkill | null>(null);

  // 4 New Modal States
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [itemCode, setItemCode] = useState('');
  const [itemQty, setItemQty] = useState('');
  const [itemUnit, setItemUnit] = useState('');
  const [itemNotes, setItemNotes] = useState('');

  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [taskOrder, setTaskOrder] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskHours, setTaskHours] = useState('');
  const [taskDesc, setTaskDesc] = useState('');

  const [varModalVisible, setVarModalVisible] = useState(false);
  const [varOrder, setVarOrder] = useState('');
  const [varName, setVarName] = useState('');
  const [varType, setVarType] = useState('');
  const [varValue, setVarValue] = useState('');
  const [varBusinessRuleCode, setVarBusinessRuleCode] = useState('');

  const [skillModalVisible, setSkillModalVisible] = useState(false);
  const [skillCode, setSkillCode] = useState('');
  const [skillQty, setSkillQty] = useState('');

  const openEditItemModal = (item: ProductItem) => {
    setEditingItem(item);
    setItemCode(item.itemCode);
    setItemQty(String(item.quantity));
    setItemUnit(item.unitMeasureCode || '');
    setItemNotes(item.notes || '');
    setItemModalVisible(true);
  };

  const refreshItems = async () => {
    if (!selectedConfig) return;
    try {
      const items = await configRepo.getItemsByConfigId(selectedConfig.id);
      setSelectedConfig(prev => prev ? { ...prev, items } : null);
    } catch (error) {
      console.error('Error refreshing items:', error);
    }
  };

  const refreshTasks = async () => {
    if (!selectedConfig) return;
    try {
      const tasks = await configRepo.getTasksByConfigId(selectedConfig.id);
      setSelectedConfig(prev => prev ? { ...prev, tasks } : null);
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    }
  };

  const refreshVariables = async () => {
    if (!selectedConfig) return;
    try {
      const variables = await configRepo.getVariablesByConfigId(selectedConfig.id);
      setSelectedConfig(prev => prev ? { ...prev, variables } : null);
    } catch (error) {
      console.error('Error refreshing variables:', error);
    }
  };

  const refreshSkills = async () => {
    if (!selectedConfig) return;
    try {
      const skills = await configRepo.getOperatorSkillsByConfigId(selectedConfig.id);
      setSelectedConfig(prev => prev ? { ...prev, productOperatorSkills: skills } : null);
    } catch (error) {
      console.error('Error refreshing skills:', error);
    }
  };

  // Save handlers
  const handleSaveItem = async () => {
    if (!selectedConfig) return;
    if (!itemCode.trim() || !itemQty.trim() || !itemUnit.trim()) {
      Alert.alert('Error', 'Item Code, Quantity, and Unit are required.');
      return;
    }
    try {
      if (editingItem) {
        await itemRepo.update({
          id: editingItem.id,
          productConfigurationId: selectedConfig.id,
          itemCode,
          quantity: parseFloat(itemQty),
          unitMeasureCode: itemUnit,
          notes: itemNotes || undefined
        });
      } else {
        await itemRepo.create({
          productConfigurationId: selectedConfig.id,
          itemCode,
          quantity: parseFloat(itemQty),
          unitMeasureCode: itemUnit,
          notes: itemNotes || undefined
        });
      }
      setItemModalVisible(false);
      setPickerModal(p => ({ ...p, visible: false }));
      setEditingItem(null);
      setItemCode('');
      setItemQty('');
      setItemUnit('');
      setItemNotes('');
      await refreshItems();
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', 'Failed to save item.');
    }
  };

  const openEditTaskModal = (task: ProductTask) => {
    setEditingTask(task);
    setTaskOrder(String(task.order));
    setTaskName(task.name);
    setTaskHours(task.estimatedHours !== undefined ? String(task.estimatedHours) : '');
    setTaskDesc(task.description || '');
    setTaskModalVisible(true);
  };

  const openEditVarModal = (variable: ProductVariable) => {
    setEditingVar(variable);
    setVarOrder(String(variable.order));
    setVarName(variable.name);
    setVarType(variable.type);
    setVarValue(variable.value || '');
    setVarBusinessRuleCode(variable.businessRuleCode || '');
    setVarModalVisible(true);
  };

  const openEditSkillModal = (skill: ProductOperatorSkill) => {
    setEditingSkill(skill);
    setSkillCode(skill.skillCode);
    setSkillQty(String(skill.quantity));
    setSkillModalVisible(true);
  };

  const handleSaveTask = async () => {
    if (!selectedConfig) return;
    if (!taskOrder.trim() || !taskName.trim()) {
      Alert.alert('Error', 'Order and Task Name are required.');
      return;
    }
    try {
      if (editingTask) {
        await taskRepo.update({
          id: editingTask.id,
          productConfigurationId: selectedConfig.id,
          order: parseInt(taskOrder),
          name: taskName,
          estimatedHours: taskHours ? parseFloat(taskHours) : undefined,
          description: taskDesc || undefined
        });
      } else {
        await taskRepo.create({
          productConfigurationId: selectedConfig.id,
          order: parseInt(taskOrder),
          name: taskName,
          estimatedHours: taskHours ? parseFloat(taskHours) : undefined,
          description: taskDesc || undefined
        });
      }
      setTaskModalVisible(false);
      setEditingTask(null);
      setTaskOrder('');
      setTaskName('');
      setTaskHours('');
      setTaskDesc('');
      await refreshTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task.');
    }
  };

  const handleSaveVar = async () => {
    if (!selectedConfig) return;
    if (!varOrder.trim() || !varName.trim() || !varType.trim()) {
      Alert.alert('Error', 'Order, Name, and Type are required.');
      return;
    }
    
    const normalizedType = varType.trim().toLowerCase();
    if (normalizedType !== 'text' && normalizedType !== 'integer' && normalizedType !== 'parameter') {
      Alert.alert('Error', 'Type must be one of: text, integer, or parameter');
      return;
    }

    try {
      if (editingVar) {
        await varRepo.update({
          id: editingVar.id,
          productConfigurationId: selectedConfig.id,
          order: parseInt(varOrder),
          name: varName,
          type: normalizedType,
          value: varValue || undefined,
          businessRuleCode: varBusinessRuleCode || undefined
        });
      } else {
        await varRepo.create({
          productConfigurationId: selectedConfig.id,
          order: parseInt(varOrder),
          name: varName,
          type: normalizedType,
          value: varValue || undefined,
          businessRuleCode: varBusinessRuleCode || undefined
        });
      }
      setVarModalVisible(false);
      setEditingVar(null);
      setVarOrder('');
      setVarName('');
      setVarType('');
      setVarValue('');
      setVarBusinessRuleCode('');
      await refreshVariables();
    } catch (error) {
      console.error('Error saving variable:', error);
      Alert.alert('Error', 'Failed to save variable.');
    }
  };

  const handleSaveSkill = async () => {
    if (!selectedConfig) return;
    if (!skillCode.trim() || !skillQty.trim()) {
      Alert.alert('Error', 'Skill Code and Quantity are required.');
      return;
    }
    try {
      if (editingSkill) {
        await skillRepo.update({
          id: editingSkill.id,
          productConfigurationId: selectedConfig.id,
          skillCode,
          quantity: parseInt(skillQty)
        });
      } else {
        await skillRepo.create({
          productConfigurationId: selectedConfig.id,
          skillCode,
          quantity: parseInt(skillQty)
        });
      }
      setSkillModalVisible(false);
      setPickerModal(p => ({ ...p, visible: false }));
      setEditingSkill(null);
      setSkillCode('');
      setSkillQty('');
      await refreshSkills();
    } catch (error) {
      console.error('Error saving skill:', error);
      Alert.alert('Error', 'Failed to save skill.');
    }
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await itemRepo.delete(id);
              await refreshItems();
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteTask = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await taskRepo.delete(id);
              await refreshTasks();
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteVar = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this variable?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await varRepo.delete(id);
              await refreshVariables();
            } catch (error) {
              console.error('Error deleting variable:', error);
              Alert.alert('Error', 'Failed to delete variable.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteSkill = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this skill?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await skillRepo.delete(id);
              await refreshSkills();
            } catch (error) {
              console.error('Error deleting skill:', error);
              Alert.alert('Error', 'Failed to delete skill.');
            }
          }
        }
      ]
    );
  };

  const getTodayDateString = () => {
    const d = new Date();
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  };

  const parseDisplayDateToDb = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateStr;
  };

  const parseDbDateToDisplay = (dateStr?: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  const openCreateModal = () => {
    setEditingConfig(null);
    setFormCode('');
    setFormVersion('1.0.0');
    setFormFromDate(parseDbDateToDisplay(getTodayDateString()));
    setFormToDate('');
    setFormQty('1');
    setCreateModalVisible(true);
  };

  const openEditConfigModal = (config: ProductConfiguration) => {
    setEditingConfig(config);
    setFormCode(config.code);
    setFormVersion(config.version);
    setFormFromDate(parseDbDateToDisplay(config.fromDate));
    setFormToDate(config.toDate ? parseDbDateToDisplay(config.toDate) : '');
    setFormQty(config.productQuantityByRecipe !== undefined ? String(config.productQuantityByRecipe) : '');
    setCreateModalVisible(true);
  };

  const handleSaveConfig = async () => {
    if (!formCode.trim() || !formVersion.trim() || !formFromDate.trim()) {
      Alert.alert('Error', 'Code, Version, and Valid From Date are required.');
      return;
    }
    setLoading(true);
    try {
      const fromDateDb = parseDisplayDateToDb(formFromDate);
      const toDateDb = formToDate ? parseDisplayDateToDb(formToDate) : undefined;

      if (!/^\d{4}-\d{2}-\d{2}$/.test(fromDateDb)) {
        Alert.alert('Error', 'Valid From Date must be in DD/MM/YYYY format.');
        setLoading(false);
        return;
      }
      if (toDateDb && !/^\d{4}-\d{2}-\d{2}$/.test(toDateDb)) {
        Alert.alert('Error', 'Valid To Date must be in DD/MM/YYYY format.');
        setLoading(false);
        return;
      }

      if (editingConfig) {
        await configRepo.update({
          id: editingConfig.id,
          productId,
          code: formCode,
          version: formVersion,
          fromDate: fromDateDb,
          toDate: toDateDb,
          productQuantityByRecipe: formQty ? parseInt(formQty, 10) : undefined,
          status: editingConfig.status
        } as any);
        Alert.alert('Success', 'Configuration updated successfully.');
      } else {
        await configRepo.create({
          productId,
          code: formCode,
          version: formVersion,
          fromDate: fromDateDb,
          toDate: toDateDb,
          productQuantityByRecipe: formQty ? parseInt(formQty, 10) : undefined
        });
        Alert.alert('Success', 'Configuration created successfully.');
      }
      setCreateModalVisible(false);
      setEditingConfig(null);
      loadData();
    } catch (error) {
      console.error('Error saving product configuration:', error);
      Alert.alert('Error', 'Failed to save product configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfig = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this configuration?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await configRepo.delete(id);
              Alert.alert('Success', 'Configuration deleted successfully.');
              loadData();
            } catch (error) {
              console.error('Error deleting configuration:', error);
              Alert.alert('Error', 'Failed to delete configuration.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const loadData = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      // Fetch product info
      const prodData = await productRepo.getById(productId);
      setProduct(prodData);

      // Fetch configs for this product
      const configs = await productRepo.getConfigurationsByProductId(productId);
      setConfigurations(configs);
    } catch (error) {
      console.error('Error fetching configuration data:', error);
      Alert.alert('Error', 'Failed to load product configurations.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectConfiguration = async (config: ProductConfiguration) => {
    setLoading(true);
    try {
      // Load full configuration details with sub-relations if available
      const fullConfig = await configRepo.getById(config.id);
      
      // Load sub-relations explicitly to ensure we have all data
      const items = await configRepo.getItemsByConfigId(config.id);
      const tasks = await configRepo.getTasksByConfigId(config.id);
      const variables = await configRepo.getVariablesByConfigId(config.id);
      const skills = await configRepo.getOperatorSkillsByConfigId(config.id);

      setSelectedConfig({
        ...fullConfig,
        items,
        tasks,
        variables,
        productOperatorSkills: skills
      });
      setActiveTab('DETAILS');
    } catch (error) {
      console.error('Error loading configuration details:', error);
      Alert.alert('Error', 'Failed to load configuration details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout headerTitle={t('production.configuration.title', 'Product Configurations')}>
      <TouchableOpacity style={styles.backLink} onPress={selectedConfig ? () => setSelectedConfig(null) : onBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.muted} />
        <Text style={styles.backLinkText}>Volver</Text>
      </TouchableOpacity>

      {product && (
        <View style={styles.productBanner}>
          <Text style={styles.productLabel}>Product</Text>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productCode}>Code: {product.code}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : !selectedConfig ? (
        // List configurations
        <View style={styles.scroll}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Available Configurations</Text>
            <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          {configurations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="options-outline" size={48} color={Colors.muted} />
              <Text style={styles.emptyText}>No configurations found for this product.</Text>
            </View>
          ) : (
            configurations.map(config => (
              <View 
                key={config.id} 
                style={styles.configCard}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.versionContainer}>
                    <Text style={styles.versionLabel}>Version</Text>
                    <Text style={styles.versionText}>{config.version}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity 
                      onPress={() => selectConfiguration(config)}
                    >
                      <Ionicons name="eye-outline" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={(e) => {
                        e.stopPropagation();
                        openEditConfigModal(config);
                      }}
                    >
                      <Ionicons name="create-outline" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteConfig(config.id);
                      }}
                    >
                      <Ionicons name="trash-outline" size={18} color={Colors.destructive} />
                    </TouchableOpacity>
                    <View style={[
                      styles.statusBadge,
                      config.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive
                    ]}>
                      <Text style={styles.statusText}>{config.status}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Code:</Text>
                  <Text style={styles.infoValue}>{config.code}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>From:</Text>
                  <Text style={styles.infoValue}>{parseDbDateToDisplay(config.fromDate)}</Text>
                </View>

                {config.toDate && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>To:</Text>
                    <Text style={styles.infoValue}>{parseDbDateToDisplay(config.toDate)}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      ) : (
        // Detail View
        <View style={styles.detailWrapper}>
          <View style={styles.configHeader}>
            <Text style={styles.configTitle}>Version {selectedConfig.version}</Text>
            <Text style={styles.configSubtitle}>Code: {selectedConfig.code}</Text>
          </View>

          {/* Carousel View */}
          <ScrollView
            ref={carouselRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + 16}
            snapToAlignment="center"
            contentContainerStyle={styles.carouselContainer}
          >
            {/* Card 1: Details */}
            <View style={styles.carouselCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.carouselCardTitle}>Details</Text>
              </View>
              <ScrollView style={styles.carouselCardScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.relationSection}>
                  <View style={styles.itemCard}>
                    <Text style={{ color: Colors.muted, fontSize: 12, marginBottom: 2 }}>Code</Text>
                    <Text style={styles.itemName}>{selectedConfig.code}</Text>
                  </View>
                  <View style={styles.itemCard}>
                    <Text style={{ color: Colors.muted, fontSize: 12, marginBottom: 2 }}>Version</Text>
                    <Text style={styles.itemName}>{selectedConfig.version}</Text>
                  </View>
                  <View style={{ ...styles.itemCard, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={{ color: Colors.muted, fontSize: 12, marginBottom: 2 }}>Valid From</Text>
                      <Text style={styles.itemName}>{parseDbDateToDisplay(selectedConfig.fromDate)}</Text>
                    </View>
                    {selectedConfig.toDate && (
                      <View>
                        <Text style={{ color: Colors.muted, fontSize: 12, marginBottom: 2 }}>Valid To</Text>
                        <Text style={styles.itemName}>{parseDbDateToDisplay(selectedConfig.toDate)}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.itemCard}>
                    <Text style={{ color: Colors.muted, fontSize: 12, marginBottom: 2 }}>Recipe Quantity</Text>
                    <Text style={styles.itemName}>{selectedConfig.productQuantityByRecipe || '1'}</Text>
                  </View>
                  <View style={styles.itemCard}>
                    <Text style={{ color: Colors.muted, fontSize: 12, marginBottom: 2 }}>Status</Text>
                    <View style={[
                      styles.statusBadge,
                      selectedConfig.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive,
                      { marginTop: 4, alignSelf: 'flex-start' }
                    ]}>
                      <Text style={styles.statusText}>{selectedConfig.status}</Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.addButtonMini, { width: '100%', height: 44, borderRadius: 12, marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }]}
                    onPress={() => {
                      carouselRef.current?.scrollTo({ x: CARD_WIDTH + 16, animated: true });
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Configure Children</Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>

            {/* Card 2: Items */}
            <View style={styles.carouselCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.carouselCardTitle}>Items</Text>
                <TouchableOpacity 
                  style={styles.addButtonMini} 
                  onPress={() => {
                    setEditingItem(null);
                    setItemCode(warehouseItems[0]?.CODE || warehouseItems[0]?.code || '');
                    setItemQty('');
                    setItemUnit(unitMeasures[0]?.CODE || unitMeasures[0]?.code || '');
                    setItemNotes('');
                    setItemModalVisible(true);
                  }}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.carouselCardScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.relationSection}>
                  {(!selectedConfig.items || selectedConfig.items.length === 0) ? (
                    <Text style={styles.noDataText}>No items configured.</Text>
                  ) : (
                    selectedConfig.items.map((item, idx) => (
                      <View key={item.id || idx} style={styles.itemCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                            <Ionicons name="basket-outline" size={20} color={Colors.primary} />
                            <Text style={styles.itemName}>{getParamLabel(warehouseItems, item.itemCode)}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                            <TouchableOpacity onPress={() => openEditItemModal(item)}>
                              <Ionicons name="create-outline" size={18} color={Colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
                              <Ionicons name="trash-outline" size={18} color={Colors.destructive} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <Text style={styles.itemQty}>
                          Qty: {item.quantity} {getParamLabel(unitMeasures, item.unitMeasureCode || '')}
                        </Text>
                        {item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>
            </View>

            {/* Card 3: Tasks */}
            <View style={styles.carouselCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.carouselCardTitle}>Tasks</Text>
                <TouchableOpacity 
                  style={styles.addButtonMini} 
                  onPress={() => {
                    setEditingTask(null);
                    setTaskOrder('');
                    setTaskName('');
                    setTaskHours('');
                    setTaskDesc('');
                    setTaskModalVisible(true);
                  }}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.carouselCardScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.relationSection}>
                  {(!selectedConfig.tasks || selectedConfig.tasks.length === 0) ? (
                    <Text style={styles.noDataText}>No tasks configured.</Text>
                  ) : (
                    selectedConfig.tasks
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((task, idx) => (
                         <View key={task.id || idx} style={styles.itemCard}>
                           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                             <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                               <View style={styles.orderBadge}>
                                 <Text style={styles.orderText}>{task.order}</Text>
                               </View>
                               <Text style={styles.itemName}>{task.name}</Text>
                             </View>
                             <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                               <TouchableOpacity onPress={() => openEditTaskModal(task)}>
                                 <Ionicons name="create-outline" size={18} color={Colors.primary} />
                               </TouchableOpacity>
                               <TouchableOpacity onPress={() => handleDeleteTask(task.id)}>
                                 <Ionicons name="trash-outline" size={18} color={Colors.destructive} />
                               </TouchableOpacity>
                             </View>
                           </View>
                           {task.estimatedHours !== undefined && (
                             <Text style={styles.itemQty}>
                               Est. Hours: {task.estimatedHours}h
                             </Text>
                           )}
                           {task.description && <Text style={styles.itemNotes}>{task.description}</Text>}
                         </View>
                      ))
                  )}
                </View>
              </ScrollView>
            </View>

            {/* Card 4: Variables */}
            <View style={styles.carouselCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.carouselCardTitle}>Variables</Text>
                <TouchableOpacity 
                  style={styles.addButtonMini} 
                  onPress={() => {
                    setEditingVar(null);
                    setVarOrder('');
                    setVarName('');
                    setVarType('text');
                    setVarValue('');
                    setVarBusinessRuleCode('');
                    setVarModalVisible(true);
                  }}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.carouselCardScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.relationSection}>
                  {(!selectedConfig.variables || selectedConfig.variables.length === 0) ? (
                    <Text style={styles.noDataText}>No variables configured.</Text>
                  ) : (
                    selectedConfig.variables
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((variable, idx) => (
                         <View key={variable.id || idx} style={styles.itemCard}>
                           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                             <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                               <Ionicons name="code-working-outline" size={20} color={Colors.primary} />
                               <Text style={styles.itemName}>{variable.name}</Text>
                             </View>
                             <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                               <TouchableOpacity onPress={() => openEditVarModal(variable)}>
                                 <Ionicons name="create-outline" size={18} color={Colors.primary} />
                               </TouchableOpacity>
                               <TouchableOpacity onPress={() => handleDeleteVar(variable.id)}>
                                 <Ionicons name="trash-outline" size={18} color={Colors.destructive} />
                               </TouchableOpacity>
                             </View>
                           </View>
                           <Text style={styles.itemQty}>Type: {variable.type}</Text>
                           {variable.value && <Text style={styles.itemNotes}>Value: {variable.value}</Text>}
                           {variable.businessRuleCode && <Text style={styles.itemNotes}>Rule: {getParamLabel(businessRules, variable.businessRuleCode)}</Text>}
                         </View>
                      ))
                  )}
                </View>
              </ScrollView>
            </View>

            {/* Card 5: Skills */}
            <View style={styles.carouselCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.carouselCardTitle}>Skills</Text>
                <TouchableOpacity 
                  style={styles.addButtonMini} 
                  onPress={() => {
                    setEditingSkill(null);
                    setSkillCode(operatorSkills[0]?.CODE || operatorSkills[0]?.code || '');
                    setSkillQty('');
                    setSkillModalVisible(true);
                  }}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.carouselCardScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.relationSection}>
                  {(!selectedConfig.productOperatorSkills || selectedConfig.productOperatorSkills.length === 0) ? (
                    <Text style={styles.noDataText}>No operator skills configured.</Text>
                  ) : (
                    selectedConfig.productOperatorSkills.map((skill, idx) => (
                      <View key={skill.id || idx} style={styles.itemCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
                            <Text style={styles.itemName}>{getParamLabel(operatorSkills, skill.skillCode)}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                            <TouchableOpacity onPress={() => openEditSkillModal(skill)}>
                              <Ionicons name="create-outline" size={18} color={Colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteSkill(skill.id)}>
                              <Ionicons name="trash-outline" size={18} color={Colors.destructive} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <Text style={styles.itemQty}>Required Operators: {skill.quantity}</Text>
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Create Configuration Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <SafeAreaWrapper style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
              <Ionicons name="close" size={28} color={Colors.muted} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingConfig ? 'Edit Configuration' : 'New Configuration'}</Text>
            <TouchableOpacity onPress={handleSaveConfig}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalFormContent} contentContainerStyle={{ paddingBottom: 60 }}>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Code</Text>
              <TextInput 
                style={styles.textInput}
                value={formCode}
                onChangeText={setFormCode}
                placeholder="Configuration Code (e.g. CONFIG-01)"
                placeholderTextColor={Colors.muted}
              />

              <Text style={styles.inputLabel}>Version</Text>
              <TextInput 
                style={styles.textInput}
                value={formVersion}
                onChangeText={setFormVersion}
                placeholder="e.g. 1.0.0"
                placeholderTextColor={Colors.muted}
              />

              <Text style={styles.inputLabel}>Valid From Date (DD/MM/YYYY)</Text>
              <TextInput 
                style={styles.textInput}
                value={formFromDate}
                onChangeText={setFormFromDate}
                placeholder="e.g. 18/06/2026"
                placeholderTextColor={Colors.muted}
              />

              <Text style={styles.inputLabel}>Valid To Date (DD/MM/YYYY - Optional)</Text>
              <TextInput 
                style={styles.textInput}
                value={formToDate}
                onChangeText={setFormToDate}
                placeholder="e.g. 31/12/2026"
                placeholderTextColor={Colors.muted}
              />

              <Text style={styles.inputLabel}>Product Quantity by Recipe</Text>
              <TextInput 
                style={styles.textInput}
                value={formQty}
                onChangeText={(val) => setFormQty(val.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 1"
                placeholderTextColor={Colors.muted}
                keyboardType="numeric"
              />
            </View>
          </ScrollView>
        </SafeAreaWrapper>
      </Modal>

      {/* Create Item Modal */}
      <Modal
        visible={itemModalVisible}
        animationType="slide"
        onRequestClose={() => {
          setItemModalVisible(false);
          setPickerModal(p => ({ ...p, visible: false }));
        }}
      >
        <SafeAreaWrapper style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setItemModalVisible(false);
              setPickerModal(p => ({ ...p, visible: false }));
            }}>
              <Ionicons name="close" size={28} color={Colors.muted} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingItem ? 'Edit Product Item' : 'New Product Item'}</Text>
            <TouchableOpacity onPress={handleSaveItem}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalFormContent} contentContainerStyle={{ paddingBottom: 60 }}>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Item Code</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => openDropdownPicker('Select Item', warehouseItems, itemCode, setItemCode)}
              >
                <Text style={styles.dropdownValue}>
                  {getParamLabel(warehouseItems, itemCode) || 'Select Item...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.muted} />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Quantity</Text>
              <TextInput 
                style={styles.textInput}
                value={itemQty}
                onChangeText={setItemQty}
                placeholder="e.g. 10.5"
                placeholderTextColor={Colors.muted}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Unit of Measure</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => openDropdownPicker('Select Unit', unitMeasures, itemUnit, setItemUnit)}
              >
                <Text style={styles.dropdownValue}>
                  {getParamLabel(unitMeasures, itemUnit) || 'Select Unit...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.muted} />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput 
                style={[styles.textInput, styles.textArea]}
                value={itemNotes}
                onChangeText={setItemNotes}
                placeholder="Additional notes"
                placeholderTextColor={Colors.muted}
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>

          {/* Dynamic Selector Modal for Dropdowns nested inside to display on top on iOS */}
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
                    const name = item.NAME || item.name || item.description || code;
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
        </SafeAreaWrapper>
      </Modal>

      {/* Create Task Modal */}
      <Modal
        visible={taskModalVisible}
        animationType="slide"
        onRequestClose={() => setTaskModalVisible(false)}
      >
        <SafeAreaWrapper style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setTaskModalVisible(false)}>
              <Ionicons name="close" size={28} color={Colors.muted} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingTask ? 'Edit Product Task' : 'New Product Task'}</Text>
            <TouchableOpacity onPress={handleSaveTask}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalFormContent} contentContainerStyle={{ paddingBottom: 60 }}>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Order</Text>
              <TextInput 
                style={styles.textInput}
                value={taskOrder}
                onChangeText={(val) => setTaskOrder(val.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 10"
                placeholderTextColor={Colors.muted}
                keyboardType="numeric"
              />
              <Text style={styles.inputLabel}>Task Name</Text>
              <TextInput 
                style={styles.textInput}
                value={taskName}
                onChangeText={setTaskName}
                placeholder="e.g. Initial Prep"
                placeholderTextColor={Colors.muted}
              />
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput 
                style={[styles.textInput, styles.textArea]}
                value={taskDesc}
                onChangeText={setTaskDesc}
                placeholder="Task description"
                placeholderTextColor={Colors.muted}
                multiline
                numberOfLines={4}
              />
              <Text style={styles.inputLabel}>Estimated Hours</Text>
              <TextInput 
                style={styles.textInput}
                value={taskHours}
                onChangeText={setTaskHours}
                placeholder="e.g. 1.5"
                placeholderTextColor={Colors.muted}
                keyboardType="numeric"
              />
            </View>
          </ScrollView>
        </SafeAreaWrapper>
      </Modal>

      {/* Create Variable Modal */}
      <Modal
        visible={varModalVisible}
        animationType="slide"
        onRequestClose={() => {
          setVarModalVisible(false);
          setPickerModal(p => ({ ...p, visible: false }));
        }}
      >
        <SafeAreaWrapper style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setVarModalVisible(false);
              setPickerModal(p => ({ ...p, visible: false }));
            }}>
              <Ionicons name="close" size={28} color={Colors.muted} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingVar ? 'Edit Product Variable' : 'New Product Variable'}</Text>
            <TouchableOpacity onPress={handleSaveVar}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalFormContent} contentContainerStyle={{ paddingBottom: 60 }}>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Order</Text>
              <TextInput 
                style={styles.textInput}
                value={varOrder}
                onChangeText={setVarOrder}
                placeholder="e.g. 10"
                placeholderTextColor={Colors.muted}
                keyboardType="numeric"
              />
              <Text style={styles.inputLabel}>Variable Name</Text>
              <TextInput 
                style={styles.textInput}
                value={varName}
                onChangeText={setVarName}
                placeholder="e.g. Temperature"
                placeholderTextColor={Colors.muted}
              />
              <Text style={styles.inputLabel}>Type</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginVertical: 8 }}>
                {['text', 'integer', 'parameter'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: varType.toLowerCase() === t ? Colors.primary : Colors.border,
                      backgroundColor: varType.toLowerCase() === t ? `${Colors.primary}20` : Colors.card,
                      alignItems: 'center',
                    }}
                    onPress={() => setVarType(t)}
                  >
                    <Text style={{
                      color: varType.toLowerCase() === t ? Colors.primary : Colors.foreground,
                      fontWeight: 'bold',
                      textTransform: 'capitalize'
                    }}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>Value</Text>
              <TextInput 
                style={styles.textInput}
                value={varValue}
                onChangeText={setVarValue}
                placeholder="e.g. 180"
                placeholderTextColor={Colors.muted}
              />

              <Text style={styles.inputLabel}>Business Rule</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => openDropdownPicker('Select Business Rule', businessRules, varBusinessRuleCode, setVarBusinessRuleCode)}
              >
                <Text style={styles.dropdownValue}>
                  {getParamLabel(businessRules, varBusinessRuleCode) || 'Select Business Rule...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.muted} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Dynamic Selector Modal for Dropdowns nested inside to display on top on iOS */}
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
                    const name = item.NAME || item.name || item.description || code;
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
        </SafeAreaWrapper>
      </Modal>

      {/* Create Skill Modal */}
      <Modal
        visible={skillModalVisible}
        animationType="slide"
        onRequestClose={() => {
          setSkillModalVisible(false);
          setPickerModal(p => ({ ...p, visible: false }));
        }}
      >
        <SafeAreaWrapper style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setSkillModalVisible(false);
              setPickerModal(p => ({ ...p, visible: false }));
            }}>
              <Ionicons name="close" size={28} color={Colors.muted} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingSkill ? 'Edit Operator Skill' : 'New Operator Skill'}</Text>
            <TouchableOpacity onPress={handleSaveSkill}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalFormContent} contentContainerStyle={{ paddingBottom: 60 }}>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Skill Code</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => openDropdownPicker('Select Skill', operatorSkills, skillCode, setSkillCode)}
              >
                <Text style={styles.dropdownValue}>
                  {getParamLabel(operatorSkills, skillCode) || 'Select Skill...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.muted} />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Required Operator Quantity</Text>
              <TextInput 
                style={styles.textInput}
                value={skillQty}
                onChangeText={(val) => setSkillQty(val.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 2"
                placeholderTextColor={Colors.muted}
                keyboardType="numeric"
              />
            </View>
          </ScrollView>

          {/* Dynamic Selector Modal for Dropdowns nested inside to display on top on iOS */}
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
                    const name = item.NAME || item.name || item.description || code;
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
        </SafeAreaWrapper>
      </Modal>
    </MainLayout>
  );
}

// Wrapper to prevent iOS top notches overlaps
const SafeAreaWrapper = ({ children, style }: { children: React.ReactNode; style?: any }) => {
  return <View style={[{ flex: 1, backgroundColor: Colors.background, paddingTop: 40 }, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: 4,
  },
  backLinkText: {
    color: Colors.muted,
    fontSize: Typography.sizes.md,
    fontWeight: 'medium',
  },
  productBanner: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  productLabel: {
    color: Colors.primary,
    fontSize: Typography.sizes.xs,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  productName: {
    color: Colors.foreground,
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    marginTop: 2,
  },
  productCode: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
    marginTop: 2,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    color: Colors.muted,
    marginTop: 12,
    fontSize: Typography.sizes.md,
  },
  scroll: {
    flex: 1,
  },
  configCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  versionLabel: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
  },
  versionText: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  statusText: {
    color: Colors.foreground,
    fontSize: Typography.sizes.xs,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
    width: 60,
  },
  infoValue: {
    color: Colors.foreground,
    fontSize: Typography.sizes.sm,
    fontWeight: 'medium',
  },
  // Details wrapper styles
  detailWrapper: {
    flex: 1,
  },
  configHeader: {
    marginBottom: Spacing.md,
  },
  configTitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
  },
  configSubtitle: {
    color: Colors.muted,
    fontSize: Typography.sizes.md,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.md,
    maxHeight: 44,
  },
  tabButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: Spacing.sm,
  },
  activeTabButton: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: Colors.primary,
  },
  detailScrollContent: {
    flex: 1,
  },
  detailCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  detailRow: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
  },
  detailLabel: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
  },
  detailValue: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: 'bold',
    marginTop: 2,
  },
  // Relations styles
  relationSection: {
    gap: Spacing.sm,
  },
  noDataText: {
    color: Colors.muted,
    fontSize: Typography.sizes.md,
    textAlign: 'center',
    marginTop: 20,
  },
  itemCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  itemName: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: 'bold',
  },
  itemQty: {
    color: Colors.primary,
    fontSize: Typography.sizes.sm,
    fontWeight: 'medium',
  },
  itemNotes: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
    marginTop: 4,
    fontStyle: 'italic',
  },
  orderBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderText: {
    color: Colors.primary,
    fontSize: Typography.sizes.xs,
    fontWeight: 'bold',
  },
  // Modal layout
  modalRoot: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
  },
  saveText: {
    color: Colors.primary,
    fontSize: Typography.sizes.md,
    fontWeight: 'bold',
  },
  modalFormContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  formGroup: {
    gap: Spacing.md,
  },
  inputLabel: {
    color: Colors.foreground,
    fontSize: Typography.sizes.sm,
    fontWeight: 'bold',
    marginTop: Spacing.xs,
  },
  textInput: {
    backgroundColor: Colors.card,
    color: Colors.foreground,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: Typography.sizes.md,
    height: 48,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  carouselCard: {
    width: CARD_WIDTH,
    height: 450,
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  carouselCardTitle: {
    color: '#fff',
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.9,
  },
  carouselCardScroll: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  addButtonMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 48,
  },
  dropdownValue: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  pickerContent: {
    width: '100%',
    maxHeight: '60%',
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerTitle: {
    color: '#fff',
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
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.xs,
  },
  activePickerItem: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  pickerLabel: {
    color: Colors.muted,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
  },
  activePickerLabel: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
