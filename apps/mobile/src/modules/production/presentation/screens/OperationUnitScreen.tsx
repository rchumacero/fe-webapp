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
  OperationUnitRepositoryImpl, 
  WarehouseRepositoryImpl,
  ProductRepositoryImpl,
  OperationUnitOperatorRepositoryImpl,
  OperationUnitProductRepositoryImpl
} from '@kplian/infrastructure';
import { 
  OperationUnit, 
  Warehouse, 
  Product, 
  OperationUnitOperator, 
  OperationUnitProduct,
  loadDomainParameters,
  getBatchParameters 
} from '@kplian/core';
import { Ionicons } from '@expo/vector-icons';
import { useVendor } from '../../../../shared/auth/AuthContext';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 48;

const opUnitRepo = new OperationUnitRepositoryImpl();
const warehouseRepo = new WarehouseRepositoryImpl();
const productRepo = new ProductRepositoryImpl();
const opOperatorRepo = new OperationUnitOperatorRepositoryImpl();
const opProductRepo = new OperationUnitProductRepositoryImpl();

interface OperationUnitScreenProps {
  onBack: () => void;
  onNavigate?: (route: string) => void;
}

export default function OperationUnitScreen({ onBack, onNavigate }: OperationUnitScreenProps) {
  const { t } = useTranslation();
  const { vendor: vendorId } = useVendor();
  const carouselRef = useRef<ScrollView>(null);

  const [units, setUnits] = useState<OperationUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown options loaded from repositories
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [persons, setPersons] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [unitMeasures, setUnitMeasures] = useState<any[]>([]);

  // Selection states
  const [selectedUnit, setSelectedUnit] = useState<OperationUnit | null>(null);
  const [operators, setOperators] = useState<OperationUnitOperator[]>([]);
  const [unitProducts, setUnitProducts] = useState<OperationUnitProduct[]>([]);

  // Main Form Modal State
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  
  const [formCode, setFormCode] = useState('');
  const [formStatus, setFormStatus] = useState('ACTIVE');
  const [formOrganizationCode, setFormOrganizationCode] = useState('');
  const [formMaterialWarehouse, setFormMaterialWarehouse] = useState('');
  const [formProductWarehouse, setFormProductWarehouse] = useState('');

  // Relation Modals States
  const [operatorModalVisible, setOperatorModalVisible] = useState(false);
  const [editingOperator, setEditingOperator] = useState<OperationUnitOperator | null>(null);
  const [formOperatorPersonCode, setFormOperatorPersonCode] = useState('');
  const [formOperatorSkillCode, setFormOperatorSkillCode] = useState('');

  const [productModalVisible, setProductModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<OperationUnitProduct | null>(null);
  const [formProductUnitId, setFormProductUnitId] = useState('');
  const [formMaxQty, setFormMaxQty] = useState('');
  const [formMinQty, setFormMinQty] = useState('');
  const [formUnitMeasure, setFormUnitMeasure] = useState('');
  const [formEstHours, setFormEstHours] = useState('');

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

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    try {
      let data = await opUnitRepo.getAll();
      if (vendorId) {
        data = data.filter(u => u.vendorCode === vendorId);
      }
      if (searchQuery.trim()) {
        data = data.filter(u => 
          u.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.organizationCode.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      setUnits(data);
    } catch (error) {
      console.error('Error loading operation units:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, vendorId]);

  // Load Dropdowns & Parameters Data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [orgsData, warehousesData, personsData, productsData, paramsMapped] = await Promise.all([
          opUnitRepo.getOrganizations(),
          warehouseRepo.getAll(),
          opUnitRepo.getPersonsByVendorId(vendorId || 'SYSTEM'),
          productRepo.getAll(),
          loadDomainParameters(
            getBatchParameters,
            [
              { fullCode: 'TM/SPE/SPE' },
              { fullCode: 'GEN/MAIN/MEA' }
            ]
          )
        ]);
        setOrganizations(orgsData);
        setWarehouses(warehousesData);
        setPersons(personsData);
        setProductsList(productsData);

        if (paramsMapped['TM/SPE/SPE']) {
          setSkills(paramsMapped['TM/SPE/SPE']);
        }
        if (paramsMapped['GEN/MAIN/MEA']) {
          setUnitMeasures(paramsMapped['GEN/MAIN/MEA']);
        }
      } catch (error) {
        console.error('Failed to load dropdown source data:', error);
      }
    };
    loadDropdownData();
  }, [vendorId]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const selectUnit = async (unit: OperationUnit) => {
    console.log('[DEBUG] selectUnit called with unit:', JSON.stringify(unit));
    setLoading(true);
    setSelectedUnit(unit);
    try {
      console.log(`[DEBUG] Requesting operators from endpoint: GET /v1/operation-unit/${unit.id}/operator`);
      console.log(`[DEBUG] Requesting products from endpoint: GET /v1/operation-unit/${unit.id}/product`);
      const [ops, prods] = await Promise.all([
        opUnitRepo.getOperatorsByUnitId(unit.id),
        opUnitRepo.getProductsByUnitId(unit.id)
      ]);
      console.log('[DEBUG] Operators response:', JSON.stringify(ops));
      console.log('[DEBUG] Products response:', JSON.stringify(prods));
      setOperators(ops);
      setUnitProducts(prods);
    } catch (error: any) {
      console.error('Failed to load unit relations:', error);
      if (error.response) {
        console.error('[DEBUG] Error response status:', error.response.status);
        console.error('[DEBUG] Error response data:', JSON.stringify(error.response.data));
      }
    } finally {
      setLoading(false);
    }
  };

  const reloadRelations = async () => {
    if (!selectedUnit) return;
    console.log('[DEBUG] reloadRelations called for unit ID:', selectedUnit.id);
    try {
      console.log(`[DEBUG] Requesting operators from endpoint: GET /v1/operation-unit/${selectedUnit.id}/operator`);
      console.log(`[DEBUG] Requesting products from endpoint: GET /v1/operation-unit/${selectedUnit.id}/product`);
      const [ops, prods] = await Promise.all([
        opUnitRepo.getOperatorsByUnitId(selectedUnit.id),
        opUnitRepo.getProductsByUnitId(selectedUnit.id)
      ]);
      console.log('[DEBUG] Operators response:', JSON.stringify(ops));
      console.log('[DEBUG] Products response:', JSON.stringify(prods));
      setOperators(ops);
      setUnitProducts(prods);
    } catch (error: any) {
      console.error('Failed to reload unit relations:', error);
      if (error.response) {
        console.error('[DEBUG] Error response status:', error.response.status);
        console.error('[DEBUG] Error response data:', JSON.stringify(error.response.data));
      }
    }
  };

  const openCreateModal = () => {
    setFormCode('');
    setFormStatus('ACTIVE');
    setFormOrganizationCode(organizations[0]?.code || organizations[0]?.id || '');
    setFormMaterialWarehouse(warehouses[0]?.code || '');
    setFormProductWarehouse(warehouses[0]?.code || '');
    setModalMode('create');
  };

  const openEditModal = (unit: OperationUnit) => {
    setFormCode(unit.code);
    setFormStatus(unit.status || 'ACTIVE');
    setFormOrganizationCode(unit.organizationCode || '');
    setFormMaterialWarehouse(unit.warehouseMaterialCode || '');
    setFormProductWarehouse(unit.warehouseProductCode || '');
    setModalMode('edit');
  };

  const handleSave = async () => {
    if (!formCode.trim() || !formOrganizationCode || !formMaterialWarehouse || !formProductWarehouse) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    const mode = modalMode;
    setLoading(true);
    try {
      if (mode === 'create') {
        await opUnitRepo.create({
          vendorCode: vendorId || 'SYSTEM',
          code: formCode,
          status: formStatus,
          organizationCode: formOrganizationCode,
          warehouseMaterialCode: formMaterialWarehouse,
          warehouseProductCode: formProductWarehouse
        });
      } else if (mode === 'edit' && selectedUnit) {
        await opUnitRepo.update({
          id: selectedUnit.id,
          vendorCode: selectedUnit.vendorCode,
          code: formCode,
          status: formStatus,
          organizationCode: formOrganizationCode,
          warehouseMaterialCode: formMaterialWarehouse,
          warehouseProductCode: formProductWarehouse
        });
      }
      setModalMode(null);
      fetchUnits();
      
      setTimeout(() => {
        Alert.alert(
          'Success',
          mode === 'create' 
            ? 'Operation unit created successfully.' 
            : 'Operation unit updated successfully.'
        );
      }, typeof jest !== 'undefined' ? 10 : 500);
    } catch (error) {
      console.error('Error saving operation unit:', error);
      Alert.alert('Error', 'Failed to save operation unit.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Operation Unit',
      'Are you sure you want to delete this operation unit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await opUnitRepo.delete(id);
              Alert.alert('Success', 'Operation unit deleted successfully.');
              setSelectedUnit(null);
              fetchUnits();
            } catch (error) {
              console.error('Error deleting operation unit:', error);
              Alert.alert('Error', 'Failed to delete operation unit.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // --- Relation Operators ---
  const openAddOperator = () => {
    setEditingOperator(null);
    setFormOperatorPersonCode(persons[0]?.code || persons[0]?.id || '');
    setFormOperatorSkillCode(skills[0]?.CODE || skills[0]?.code || '');
    setOperatorModalVisible(true);
  };

  const openEditOperator = (op: OperationUnitOperator) => {
    setEditingOperator(op);
    setFormOperatorPersonCode(op.personCode || '');
    setFormOperatorSkillCode(op.skillCode || '');
    setOperatorModalVisible(true);
  };

  const handleSaveOperator = async () => {
    if (!selectedUnit) return;
    if (!formOperatorPersonCode || !formOperatorSkillCode) {
      Alert.alert('Error', 'Please select both collaborator and skill.');
      return;
    }
    setLoading(true);
    try {
      const isEdit = !!editingOperator;
      const payload = {
        operationUnitId: selectedUnit.id,
        personCode: formOperatorPersonCode,
        skillCode: formOperatorSkillCode
      };
      console.log(`[DEBUG] Saving operator. isEdit=${isEdit}. Endpoint: ${isEdit ? `PUT /v1/operation-unit/operator/${editingOperator.id}` : 'POST /v1/operation-unit/operator'}`);
      console.log('[DEBUG] Operator Payload:', JSON.stringify(payload));
      
      if (editingOperator) {
        await opOperatorRepo.update({
          id: editingOperator.id,
          ...payload
        });
      } else {
        await opOperatorRepo.create(payload);
      }
      setOperatorModalVisible(false);
      reloadRelations();
    } catch (error) {
      console.error('Failed to save operator:', error);
      Alert.alert('Error', 'Failed to save operator.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOperator = (id: string) => {
    Alert.alert('Delete Operator', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await opOperatorRepo.delete(id);
            Alert.alert('Success', 'Operator removed.');
            reloadRelations();
          } catch (error) {
            console.error(error);
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  // --- Relation Products ---
  const openAddProduct = () => {
    setEditingProduct(null);
    setFormProductUnitId(productsList[0]?.id || '');
    setFormMinQty('');
    setFormMaxQty('');
    setFormUnitMeasure(unitMeasures[0]?.CODE || unitMeasures[0]?.code || '');
    setFormEstHours('');
    setProductModalVisible(true);
  };

  const openEditProduct = (p: OperationUnitProduct) => {
    setEditingProduct(p);
    setFormProductUnitId(p.productId || '');
    setFormMinQty(String(p.minRecipeQuantity || ''));
    setFormMaxQty(String(p.maxRecipeQuantity || ''));
    setFormUnitMeasure(p.unitMeasureCode || '');
    setFormEstHours(String(p.estimatedHours || ''));
    setProductModalVisible(true);
  };

  const handleSaveProduct = async () => {
    if (!selectedUnit) return;
    if (!formProductUnitId || !formMinQty || !formMaxQty || !formUnitMeasure || !formEstHours) {
      Alert.alert('Error', 'All product fields are required.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        operationUnitId: selectedUnit.id,
        productId: formProductUnitId,
        minRecipeQuantity: parseFloat(formMinQty),
        maxRecipeQuantity: parseFloat(formMaxQty),
        unitMeasureCode: formUnitMeasure,
        estimatedHours: parseFloat(formEstHours)
      };

      const isEdit = !!editingProduct;
      console.log(`[DEBUG] Saving product. isEdit=${isEdit}. Endpoint: ${isEdit ? `PUT /v1/operation-unit/product/${editingProduct.id}` : 'POST /v1/operation-unit/product'}`);
      console.log('[DEBUG] Product Payload:', JSON.stringify(payload));

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
            Alert.alert('Success', 'Product relation removed.');
            reloadRelations();
          } catch (error) {
            console.error(error);
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  // --- Helpers ---
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

  const getOrganizationLabel = (code: string) => {
    const match = organizations.find(o => (o.code || o.id) === code);
    return match ? (match.name || match.code) : code;
  };

  const getWarehouseLabel = (code: string) => {
    const match = warehouses.find(w => w.code === code);
    return match ? match.name : code;
  };

  const getCollaboratorLabel = (code: string) => {
    const match = persons.find(p => (p.code || p.id) === code);
    if (!match) return code;
    const name = match.firstName || match.name || match.code || match.id;
    const lastName = match.lastName || '';
    return `${name} ${lastName}`.trim();
  };

  const getProductLabel = (id: string) => {
    const match = productsList.find(p => p.id === id);
    return match ? match.name : id;
  };

  const getParamLabel = (data: any[], val: string) => {
    const item = data.find(
      i => (i.CODE || i.code) === val
    );
    return item ? (item.NAME || item.name || item.description || val) : val;
  };

  const statusOptions = [
    { CODE: 'ACTIVE', name: 'Active' },
    { CODE: 'INACTIVE', name: 'Inactive' }
  ];

  return (
    <MainLayout headerTitle={t('production.operation_unit.title', 'Operation Units')}>
      <TouchableOpacity style={styles.backLink} onPress={selectedUnit ? () => setSelectedUnit(null) : onBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.muted} />
        <Text style={styles.backLinkText}>Volver</Text>
      </TouchableOpacity>

      {loading && !selectedUnit && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {!selectedUnit ? (
        // List View
        <View style={{ flex: 1 }}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Operation Units</Text>
            <TouchableOpacity testID="add-unit-button" style={styles.addButton} onPress={openCreateModal}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.muted} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search by code or organization..."
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

          {units.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="construct-outline" size={48} color={Colors.muted} />
              <Text style={styles.emptyText}>No operation units found.</Text>
            </View>
          ) : (
            <ScrollView style={styles.scroll}>
              {units.map(unit => (
                <View key={unit.id} style={styles.unitCard}>
                  <View style={styles.unitIcon}>
                    <Ionicons name="construct" size={24} color={Colors.primary} />
                  </View>
                  <View style={styles.unitInfo}>
                    <Text style={styles.unitName}>Unit Code: {unit.code}</Text>
                    <Text style={styles.unitDesc}>Organization: {getOrganizationLabel(unit.organizationCode)}</Text>
                    <View style={[
                      styles.statusBadge,
                      unit.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive
                    ]}>
                      <Text style={styles.statusText}>{unit.status}</Text>
                    </View>
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => selectUnit(unit)}>
                      <Ionicons name="eye-outline" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openEditModal(unit)}>
                      <Ionicons name="create-outline" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(unit.id)}>
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
            <Text style={styles.configTitle}>Unit: {selectedUnit.code}</Text>
            <Text style={styles.configSubtitle}>Organization: {getOrganizationLabel(selectedUnit.organizationCode)}</Text>
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


            {/* Card 2: Operators */}
            <View style={styles.carouselCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.carouselCardTitle}>Operators</Text>
                <TouchableOpacity style={styles.addButtonMini} onPress={openAddOperator}>
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.carouselCardScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.relationSection}>
                  {operators.length === 0 ? (
                    <Text style={styles.noDataText}>No operators assigned.</Text>
                  ) : (
                    operators.map((op, idx) => (
                      <View key={op.id || idx} style={styles.itemCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                            <Ionicons name="people-outline" size={20} color={Colors.primary} />
                            <Text style={styles.itemName}>{getCollaboratorLabel(op.personCode)}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                            <TouchableOpacity onPress={() => openEditOperator(op)}>
                              <Ionicons name="create-outline" size={18} color={Colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteOperator(op.id)}>
                              <Ionicons name="trash-outline" size={18} color={Colors.destructive} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <Text style={styles.itemQty}>Skill: {getParamLabel(skills, op.skillCode)}</Text>
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>
            </View>

            {/* Card 3: Products */}
            <View style={styles.carouselCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.carouselCardTitle}>Products</Text>
                <TouchableOpacity style={styles.addButtonMini} onPress={openAddProduct}>
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.carouselCardScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.relationSection}>
                  {unitProducts.length === 0 ? (
                    <Text style={styles.noDataText}>No products mapped.</Text>
                  ) : (
                    unitProducts.map((p, idx) => (
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
                          Recipe Qty: {p.minRecipeQuantity} - {p.maxRecipeQuantity} {getParamLabel(unitMeasures, p.unitMeasureCode)}
                        </Text>
                        <Text style={styles.itemNotes}>Est. Hours: {p.estimatedHours}h</Text>
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Main Unit Form Modal */}
      <Modal
        visible={modalMode !== null}
        animationType="slide"
        onRequestClose={() => setModalMode(null)}
      >
        <View style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalMode(null)}>
              <Ionicons name="close" size={28} color={Colors.muted} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {modalMode === 'create' && 'Create Operation Unit'}
              {modalMode === 'edit' && 'Edit Operation Unit'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
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
                placeholder="Unit Code (e.g. OPU-01)"
                placeholderTextColor={Colors.muted}
              />

              <Text style={styles.inputLabel}>Organization</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => openDropdownPicker(
                  'Select Organization', 
                  organizations.map(o => ({ CODE: o.code || o.id, name: o.name || o.code })), 
                  formOrganizationCode, 
                  setFormOrganizationCode
                )}
              >
                <Text style={styles.dropdownValue}>
                  {getOrganizationLabel(formOrganizationCode) || 'Select Organization...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.muted} />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Material Warehouse</Text>
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
                  {getWarehouseLabel(formMaterialWarehouse) || 'Select Material Warehouse...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.muted} />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Product Warehouse</Text>
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
                  {getWarehouseLabel(formProductWarehouse) || 'Select Product Warehouse...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.muted} />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Status</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => openDropdownPicker(
                  'Select Status', 
                  statusOptions, 
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
          </ScrollView>
          {/* Selector Modal inside Main Modal */}
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
        </View>
      </Modal>

      {/* Operator Relation Modal */}
      <Modal
        visible={operatorModalVisible}
        animationType="slide"
        onRequestClose={() => setOperatorModalVisible(false)}
      >
        <View style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setOperatorModalVisible(false)}>
              <Ionicons name="close" size={28} color={Colors.muted} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingOperator ? 'Edit Operator' : 'Add Operator'}</Text>
            <TouchableOpacity onPress={handleSaveOperator}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalFormContent}>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Operator (Collaborator)</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => openDropdownPicker(
                  'Select Collaborator', 
                  persons.map(p => ({
                    CODE: p.code || p.id,
                    name: `${p.firstName || p.name || p.code || p.id} ${p.lastName || ''}`.trim()
                  })), 
                  formOperatorPersonCode, 
                  setFormOperatorPersonCode
                )}
              >
                <Text style={styles.dropdownValue}>
                  {getCollaboratorLabel(formOperatorPersonCode) || 'Select Collaborator...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.muted} />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Skill Required</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => openDropdownPicker(
                  'Select Skill', 
                  skills, 
                  formOperatorSkillCode, 
                  setFormOperatorSkillCode
                )}
              >
                <Text style={styles.dropdownValue}>
                  {getParamLabel(skills, formOperatorSkillCode) || 'Select Skill...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.muted} />
              </TouchableOpacity>
            </View>
          </ScrollView>
          {/* Selector Modal inside Operator Modal */}
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
        </View>
      </Modal>

      {/* Product Relation Modal */}
      <Modal
        visible={productModalVisible}
        animationType="slide"
        onRequestClose={() => setProductModalVisible(false)}
      >
        <View style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setProductModalVisible(false)}>
              <Ionicons name="close" size={28} color={Colors.muted} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingProduct ? 'Edit Product Configuration' : 'Add Product Configuration'}</Text>
            <TouchableOpacity onPress={handleSaveProduct}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalFormContent}>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Product</Text>
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

              <Text style={styles.inputLabel}>Min Recipe Qty</Text>
              <TextInput 
                style={styles.textInput}
                value={formMinQty}
                onChangeText={setFormMinQty}
                placeholder="e.g. 1"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Max Recipe Qty</Text>
              <TextInput 
                style={styles.textInput}
                value={formMaxQty}
                onChangeText={setFormMaxQty}
                placeholder="e.g. 100"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Unit of Measure</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => openDropdownPicker(
                  'Select Unit', 
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

              <Text style={styles.inputLabel}>Estimated Hours</Text>
              <TextInput 
                style={styles.textInput}
                value={formEstHours}
                onChangeText={setFormEstHours}
                placeholder="e.g. 1.5"
                keyboardType="numeric"
              />
            </View>
          </ScrollView>
          {/* Selector Modal inside Product Modal */}
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
        </View>
      </Modal>

      {/* Global Picker Modal */}
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
    </MainLayout>
  );
}

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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonMini: {
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    marginLeft: Spacing.sm,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: Colors.muted,
    fontSize: Typography.sizes.md,
    marginTop: Spacing.md,
  },
  scroll: {
    flex: 1,
  },
  unitCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
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
    fontSize: Typography.sizes.sm,
    marginTop: 2,
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
  },
  statusInactive: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
  statusText: {
    color: Colors.foreground,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  modalRoot: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderColor: Colors.border,
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
  carouselCardScroll: {
    flex: 1,
  },
  relationSection: {
    gap: Spacing.md,
  },
  noDataText: {
    color: Colors.muted,
    fontSize: Typography.sizes.md,
    textAlign: 'center',
    marginTop: 40,
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
  detailCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailRow: {
    marginBottom: Spacing.md,
  },
  detailLabel: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
    marginBottom: 2,
  },
  detailValue: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    color: Colors.foreground,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  textInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.foreground,
    paddingHorizontal: Spacing.md,
    height: 48,
    fontSize: Typography.sizes.md,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  dropdownValue: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContent: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    width: '80%',
    maxHeight: '50%',
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerTitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  pickerDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  pickerItem: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
  },
  activePickerItem: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  pickerLabel: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
  },
  activePickerLabel: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
});
