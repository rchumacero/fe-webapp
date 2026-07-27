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
  OperationOrderRepositoryImpl,
  ProductRepositoryImpl,
  OperationRepositoryImpl,
  OperationOrderProductRepositoryImpl,
  OperationDetailRepositoryImpl,
  OperationUnitRepositoryImpl
} from '@kplian/infrastructure';
import { 
  OperationOrder,
  Product,
  Operation,
  OperationOrderProduct,
  OperationDetail,
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

const orderRepo = new OperationOrderRepositoryImpl();
const productRepo = new ProductRepositoryImpl();
const operationRepo = new OperationRepositoryImpl();
const orderProductRepo = new OperationOrderProductRepositoryImpl();
const orderDetailRepo = new OperationDetailRepositoryImpl();
const opUnitRepo = new OperationUnitRepositoryImpl();

interface OperationOrderScreenProps {
  onBack: () => void;
  onNavigate?: (route: string) => void;
}

export default function OperationOrderScreen({ onBack, onNavigate }: OperationOrderScreenProps) {
  const { t } = useTranslation();
  const { vendor: vendorId } = useVendor();
  const carouselRef = useRef<ScrollView>(null);

  const [orders, setOrders] = useState<OperationOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdowns
  const [customers, setCustomers] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [operationsList, setOperationsList] = useState<Operation[]>([]);
  const [unitMeasures, setUnitMeasures] = useState<any[]>([]);

  // Selection states
  const [selectedOrder, setSelectedOrder] = useState<OperationOrder | null>(null);
  const [orderProducts, setOrderProducts] = useState<OperationOrderProduct[]>([]);
  const [orderDetails, setOrderDetails] = useState<OperationDetail[]>([]);

  // Main Form Modal State
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [formCustomerCode, setFormCustomerCode] = useState('');
  const [formOrderDate, setFormOrderDate] = useState('');
  const [formDeliveryDate, setFormDeliveryDate] = useState('');
  const [formStatus, setFormStatus] = useState('DRAFT');

  // Relation Modals States
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<OperationOrderProduct | null>(null);
  const [formProductUnitId, setFormProductUnitId] = useState('');
  const [formReqQty, setFormReqQty] = useState('');
  const [formProdQty, setFormProdQty] = useState('');
  const [formDefQty, setFormDefQty] = useState('');
  const [formUnitMeasure, setFormUnitMeasure] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formOperationId, setFormOperationId] = useState('');

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

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      let data = await orderRepo.getAll();
      if (vendorId) {
        data = data.filter(o => o.vendorCode === vendorId);
      }
      if (searchQuery.trim()) {
        data = data.filter(o => 
          o.customerCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.status.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      setOrders(data);
    } catch (error) {
      console.error('Error loading operation orders:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, vendorId]);

  // Load Dropdowns & Parameters Data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [personsData, productsData, operationsData, paramsMapped] = await Promise.all([
          opUnitRepo.getPersonsByVendorId(vendorId || 'SYSTEM'),
          productRepo.getAll(),
          operationRepo.getAll(),
          loadDomainParameters(
            getBatchParameters,
            [
              { fullCode: 'GEN/MAIN/MEA' }
            ]
          )
        ]);
        setCustomers(personsData);
        setProductsList(productsData);
        setOperationsList(operationsData);

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
    fetchOrders();
  }, [fetchOrders]);

  const selectOrder = async (order: OperationOrder) => {
    console.log('[DEBUG] selectOrder called with order:', JSON.stringify(order));
    setLoading(true);
    setSelectedOrder(order);
    try {
      console.log(`[DEBUG] Requesting products from endpoint: GET /v1/operation-order/${order.id}/product`);
      console.log(`[DEBUG] Requesting details from endpoint: GET /v1/operation-order/${order.id}/operation/detail`);
      const [prods, details] = await Promise.all([
        orderRepo.getProductsByOrderId(order.id),
        orderRepo.getDetailsByOrderId(order.id)
      ]);
      console.log('[DEBUG] Products response:', JSON.stringify(prods));
      console.log('[DEBUG] Details response:', JSON.stringify(details));
      setOrderProducts(prods);
      setOrderDetails(details);
    } catch (error: any) {
      console.error('Failed to load order relations:', error);
      if (error.response) {
        console.error('[DEBUG] Error response status:', error.response.status);
        console.error('[DEBUG] Error response data:', JSON.stringify(error.response.data));
      }
    } finally {
      setLoading(false);
    }
  };

  const reloadRelations = async () => {
    if (!selectedOrder) return;
    console.log('[DEBUG] reloadRelations called for order ID:', selectedOrder.id);
    try {
      console.log(`[DEBUG] Requesting products from endpoint: GET /v1/operation-order/${selectedOrder.id}/product`);
      console.log(`[DEBUG] Requesting details from endpoint: GET /v1/operation-order/${selectedOrder.id}/operation/detail`);
      const [prods, details] = await Promise.all([
        orderRepo.getProductsByOrderId(selectedOrder.id),
        orderRepo.getDetailsByOrderId(selectedOrder.id)
      ]);
      console.log('[DEBUG] Products response:', JSON.stringify(prods));
      console.log('[DEBUG] Details response:', JSON.stringify(details));
      setOrderProducts(prods);
      setOrderDetails(details);
    } catch (error: any) {
      console.error('Failed to reload order relations:', error);
      if (error.response) {
        console.error('[DEBUG] Error response status:', error.response.status);
        console.error('[DEBUG] Error response data:', JSON.stringify(error.response.data));
      }
    }
  };

  const openCreateModal = () => {
    setFormCustomerCode(customers[0]?.code || customers[0]?.id || '');
    setFormOrderDate(new Date().toISOString().split('T')[0]);
    setFormDeliveryDate('');
    setFormStatus('DRAFT');
    setModalMode('create');
  };

  const openEditModal = (order: OperationOrder) => {
    setFormCustomerCode(order.customerCode);
    setFormOrderDate(order.orderDate);
    setFormDeliveryDate(order.deliveryDate || '');
    setFormStatus(order.status || 'DRAFT');
    setModalMode('edit');
  };

  const handleSave = async () => {
    if (!formCustomerCode || !formOrderDate) {
      Alert.alert('Error', 'Customer and Order Date are required.');
      return;
    }
    setLoading(true);
    try {
      const isEdit = modalMode === 'edit';
      if (isEdit && selectedOrder) {
        await orderRepo.update({
          id: selectedOrder.id,
          vendorCode: selectedOrder.vendorCode,
          customerCode: formCustomerCode,
          orderDate: formOrderDate,
          deliveryDate: formDeliveryDate || undefined,
          status: formStatus
        });
      } else {
        await orderRepo.create({
          vendorCode: vendorId || 'SYSTEM',
          customerCode: formCustomerCode,
          orderDate: formOrderDate,
          deliveryDate: formDeliveryDate || undefined,
          status: formStatus
        });
      }
      setModalMode(null);
      fetchOrders();
      setSelectedOrder(null);
      
      setTimeout(() => {
        Alert.alert(
          'Success',
          isEdit ? 'Operation Order updated successfully.' : 'Operation Order created successfully.'
        );
      }, typeof jest !== 'undefined' ? 10 : 500);
    } catch (error) {
      console.error('Failed to save order:', error);
      Alert.alert('Error', 'Failed to save order.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Operation Order', 'Are you sure you want to delete this order?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await orderRepo.delete(id);
            fetchOrders();
            setSelectedOrder(null);
            setTimeout(() => {
              Alert.alert('Success', 'Operation Order deleted successfully.');
            }, typeof jest !== 'undefined' ? 10 : 500);
          } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to delete order.');
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
    setFormReqQty('');
    setFormProdQty('');
    setFormDefQty('');
    setFormUnitMeasure(unitMeasures[0]?.CODE || unitMeasures[0]?.code || '');
    setFormNotes('');
    setProductModalVisible(true);
  };

  const openEditProduct = (item: OperationOrderProduct) => {
    setEditingProduct(item);
    setFormProductUnitId(item.productId);
    setFormReqQty(String(item.requestedQuantity));
    setFormProdQty(item.producedQuantity ? String(item.producedQuantity) : '');
    setFormDefQty(item.defectedQuantity ? String(item.defectedQuantity) : '');
    setFormUnitMeasure(item.unitMeasureCode || '');
    setFormNotes(item.notes || '');
    setProductModalVisible(true);
  };

  const handleSaveProduct = async () => {
    if (!selectedOrder) return;
    if (!formProductUnitId || !formReqQty) {
      Alert.alert('Error', 'Product and Requested Quantity are required.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        operationOrderId: selectedOrder.id,
        productId: formProductUnitId,
        requestedQuantity: parseFloat(formReqQty),
        producedQuantity: formProdQty ? parseFloat(formProdQty) : undefined,
        defectedQuantity: formDefQty ? parseFloat(formDefQty) : undefined,
        unitMeasureCode: formUnitMeasure || undefined,
        notes: formNotes || undefined
      };

      const isEdit = !!editingProduct;
      console.log(`[DEBUG] Saving product. isEdit=${isEdit}. Endpoint: ${isEdit ? `PUT /v1/operation-order/product/${editingProduct.id}` : 'POST /v1/operation-order/product'}`);
      console.log('[DEBUG] Product Payload:', JSON.stringify(payload));

      if (editingProduct) {
        await orderProductRepo.update({
          id: editingProduct.id,
          ...payload
        });
      } else {
        await orderProductRepo.create(payload);
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
            await orderProductRepo.delete(id);
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

  // Operations Relations Actions
  const openAddDetail = () => {
    setFormOperationId(operationsList[0]?.id || '');
    setDetailModalVisible(true);
  };

  const handleSaveDetail = async () => {
    if (!selectedOrder) return;
    if (!formOperationId) {
      Alert.alert('Error', 'Operation is required.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        operationOrderId: selectedOrder.id,
        operationId: formOperationId
      };
      console.log(`[DEBUG] Saving details. Endpoint: POST /v1/operation/detail`);
      console.log('[DEBUG] Detail Payload:', JSON.stringify(payload));
      await orderDetailRepo.create(payload);
      setDetailModalVisible(false);
      reloadRelations();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save operation mapping.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDetail = (id: string) => {
    Alert.alert('Delete Operation relation', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await orderDetailRepo.delete(id);
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

  const getCustomerLabel = (code: string) => {
    const match = customers.find(c => (c.code || c.id) === code);
    if (!match) return code;
    const name = match.firstName || match.name || match.code || match.id;
    const lastName = match.lastName || '';
    return `${name} ${lastName}`.trim();
  };

  const getProductLabel = (id: string) => {
    const match = productsList.find(p => p.id === id);
    return match ? match.name : id;
  };

  const getOperationLabel = (id: string) => {
    const match = operationsList.find(op => op.id === id);
    return match ? match.code : id;
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

  const orderStatuses = [
    { CODE: 'DRAFT', name: 'Draft' },
    { CODE: 'PLANNED', name: 'Planned' },
    { CODE: 'CONFIRMED', name: 'Confirmed' },
    { CODE: 'IN_PROGRESS', name: 'In Progress' },
    { CODE: 'COMPLETED', name: 'Completed' },
    { CODE: 'CANCELLED', name: 'Cancelled' }
  ];

  return (
    <MainLayout headerTitle={t('production.operation_order.title', 'Operation Orders')}>
      <TouchableOpacity style={styles.backLink} onPress={selectedOrder ? () => setSelectedOrder(null) : onBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.muted} />
        <Text style={styles.backLinkText}>Volver</Text>
      </TouchableOpacity>

      {loading && !selectedOrder && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {!selectedOrder ? (
        // List View
        <View style={{ flex: 1 }}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Operation Orders</Text>
            <TouchableOpacity testID="add-order-button" style={styles.addButton} onPress={openCreateModal}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.muted} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search by customer or status..."
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

          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="documents-outline" size={48} color={Colors.muted} />
              <Text style={styles.emptyText}>No operation orders found.</Text>
            </View>
          ) : (
            <ScrollView style={styles.scroll}>
              {orders.map(order => (
                <View key={order.id} style={styles.unitCard}>
                  <View style={styles.unitIcon}>
                    <Ionicons name="document-text" size={24} color={Colors.primary} />
                  </View>
                  <View style={styles.unitInfo}>
                    <Text style={styles.unitName}>Customer: {getCustomerLabel(order.customerCode)}</Text>
                    <Text style={styles.unitDesc}>Order Date: {order.orderDate}</Text>
                    <Text style={styles.unitDesc}>Delivery Date: {order.deliveryDate || 'N/A'}</Text>
                    <View style={[
                      styles.statusBadge,
                      order.status === 'COMPLETED' ? styles.statusActive : styles.statusInactive
                    ]}>
                      <Text style={styles.statusText}>{order.status}</Text>
                    </View>
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => selectOrder(order)}>
                      <Ionicons name="eye-outline" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openEditModal(order)}>
                      <Ionicons name="create-outline" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(order.id)}>
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
            <Text style={styles.configTitle}>Order details</Text>
            <Text style={styles.configSubtitle}>Customer: {getCustomerLabel(selectedOrder.customerCode)}</Text>
            <Text style={styles.configSubtitle}>Order Date: {selectedOrder.orderDate}</Text>
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
                  {orderProducts.length === 0 ? (
                    <Text style={styles.noDataText}>No products mapped.</Text>
                  ) : (
                    orderProducts.map((p, idx) => (
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
                          Req Qty: {p.requestedQuantity} {p.unitMeasureCode ? getParamLabel(unitMeasures, p.unitMeasureCode) : ''}
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

            {/* Card 2: Operations */}
            <View style={styles.carouselCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.carouselCardTitle}>Operations</Text>
                <TouchableOpacity style={styles.addButtonMini} onPress={openAddDetail}>
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.carouselCardScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.relationSection}>
                  {orderDetails.length === 0 ? (
                    <Text style={styles.noDataText}>No operations mapped.</Text>
                  ) : (
                    orderDetails.map((d, idx) => (
                      <View key={d.id || idx} style={styles.itemCard}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                            <Ionicons name="construct-outline" size={20} color={Colors.primary} />
                            <Text style={styles.itemName}>{getOperationLabel(d.operationId)}</Text>
                          </View>
                          <TouchableOpacity onPress={() => handleDeleteDetail(d.id)}>
                            <Ionicons name="trash-outline" size={18} color={Colors.destructive} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Main Order Form Modal */}
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
              {modalMode === 'create' ? 'Create Operation Order' : 'Edit Operation Order'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalFormContent} contentContainerStyle={{ paddingBottom: 60 }}>
            {/* Customer Dropdown */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Customer</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => openDropdownPicker(
                  'Select Customer', 
                  customers.map(c => ({
                    CODE: c.code || c.id,
                    name: `${c.firstName || c.name || c.code || c.id} ${c.lastName || ''}`.trim()
                  })), 
                  formCustomerCode, 
                  setFormCustomerCode
                )}
              >
                <Text style={styles.dropdownValue}>
                  {getCustomerLabel(formCustomerCode) || 'Select Customer...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.muted} />
              </TouchableOpacity>
            </View>

            {/* Order Date */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Order Date (YYYY-MM-DD)</Text>
              <TextInput 
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.muted}
                value={formOrderDate}
                onChangeText={setFormOrderDate}
              />
            </View>

            {/* Delivery Date */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Delivery Date (YYYY-MM-DD, Optional)</Text>
              <TextInput 
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.muted}
                value={formDeliveryDate}
                onChangeText={setFormDeliveryDate}
              />
            </View>

            {/* Status Dropdown */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Status</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => openDropdownPicker(
                  'Select Status', 
                  orderStatuses, 
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

            {/* Requested Quantity */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Requested Quantity</Text>
              <TextInput 
                style={styles.input}
                keyboardType="numeric"
                placeholder="0.0"
                placeholderTextColor={Colors.muted}
                value={formReqQty}
                onChangeText={setFormReqQty}
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
        </SafeAreaWrapper>
      </Modal>

      {/* Operation Detail Relation Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <SafeAreaWrapper style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.muted} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Map Operation</Text>
            <TouchableOpacity onPress={handleSaveDetail}>
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalFormContent} contentContainerStyle={{ paddingBottom: 60 }}>
            {/* Operation Selector */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Operation</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => openDropdownPicker(
                  'Select Operation', 
                  operationsList.map(op => ({ CODE: op.id, name: op.code })), 
                  formOperationId, 
                  setFormOperationId
                )}
              >
                <Text style={styles.dropdownValue}>
                  {getOperationLabel(formOperationId) || 'Select Operation...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.muted} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Selector Modal inside Operation Modal */}
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
