import React, { useEffect, useState, useMemo } from 'react';
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
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@kplian/i18n';
import { Colors, Spacing, Typography } from '../../../../../shared/theme/constants';
import { useSales, SaleDraft } from '../hooks/useSales';
import { MainLayout } from '../../../../../shared/layout/MainLayout';
import { useVendor } from '../../../../../shared/auth/AuthContext';
import { loadDomainParameters, getBatchParameters, Sale, SaleDetail, ExtraCharge, Payment } from '@kplian/core';
import { SaleRepositoryImpl } from '@kplian/infrastructure';

interface SalesScreenProps {
  onBack: () => void;
  onNavigate?: (route: string) => void;
}

interface MockCustomer {
  id: string;
  name: string;
  documentNumber: string;
  nit: string;
}

const MOCK_CUSTOMERS: MockCustomer[] = [
  { id: '8f076c8c-68fd-4fb8-bfbd-74b88236cd0a', name: 'Empresa ABC S.R.L.', documentNumber: '123456789', nit: '123456789' },
  { id: 'acf92a4e-c4a1-4a21-a51b-cca2b8723fa2', name: 'Juan Mamani', documentNumber: '987654321', nit: '987654321' },
  { id: '7cf28b9c-48be-41bf-bbad-947bca882cd8', name: 'Distribuidora El Sol', documentNumber: '456789123', nit: '456789123' },
  { id: '3fb8826c-8cd2-4cf3-bfde-84bca8839cc8', name: 'Maria Quispe', documentNumber: '321654987', nit: '321654987' },
];

const saleRepo = new SaleRepositoryImpl();

export default function SalesScreen({ onBack, onNavigate }: SalesScreenProps) {
  const { t } = useTranslation();
  const { vendor } = useVendor();
  const {
    sales,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    saleDraft,
    setSaleDraft,
    details,
    extraCharges,
    payments,
    subtotal,
    totalDiscount,
    totalExtraCharges,
    grandTotal,
    totalPayments,
    paymentDifference,
    fetchSales,
    resetForm,
    addDetail,
    removeDetail,
    addExtraCharge,
    removeExtraCharge,
    addPayment,
    removePayment,
    saveSale,
    selectedSale,
    setSelectedSale,
    selectedDetails,
    selectedCharges,
    selectedPayments,
    loadSaleRelations,
  } = useSales();

  // Screen Modals Visibility
  const [editorVisible, setEditorVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [customerPickerVisible, setCustomerPickerVisible] = useState(false);

  // Detail Tab state
  const [detailTab, setDetailTab] = useState<'items' | 'payments' | 'charges'>('items');

  // Sub-forms visibility & local state
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [localItem, setLocalItem] = useState({
    description: '',
    quantity: '1',
    priceAmount: '0',
    discountAmount: '0',
    unitMeasureCode: 'UNIT',
    expenseIncomeCode: 'FIN/MAIN/EXPINC/REV',
    status: 'ACTIVE'
  });

  const [chargeModalVisible, setChargeModalVisible] = useState(false);
  const [localCharge, setLocalCharge] = useState({
    description: '',
    chargeAmount: '0',
    expenseIncomeCode: 'FIN/MAIN/EXPINC/OTH'
  });

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [localPayment, setLocalPayment] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    order: '1',
    priceAmount: '0',
    interestAmount: '0',
    status: 'PENDING'
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
  const [customerSearchText, setCustomerSearchText] = useState('');

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
        }
      } catch (err) {
        console.error('Failed to load item parameters:', err);
      }
    };
    fetchParams();
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Statistics calculation matching Pantalla 1
  const stats = useMemo(() => {
    let completedTotal = 0;
    let collectedTotal = 0;
    let pendingTotal = 0;

    sales.forEach(s => {
      const isCompleted = s.status === 'COMPLETED' || s.status === 'PAGADO';
      
      // Calculate Sale Grand Total
      const sub = s.details?.reduce((sum, d) => sum + (d.priceAmount * d.quantity), 0) || 0;
      const disc = s.details?.reduce((sum, d) => sum + (d.discountAmount || 0), 0) || 0;
      const chg = s.extraCharges?.reduce((sum, c) => sum + c.chargeAmount, 0) || 0;
      const totalAmount = sub + chg - disc;

      if (isCompleted) {
        completedTotal += totalAmount;
      }

      // Sum collected installments
      const collected = s.payments?.filter(p => p.status === 'COMPLETED' || p.status === 'PAGADO')
        .reduce((sum, p) => sum + p.priceAmount + (p.interestAmount || 0), 0) || 0;

      // Sum pending installments
      const pending = s.payments?.filter(p => p.status === 'PENDING' || p.status === 'PENDIENTE')
        .reduce((sum, p) => sum + p.priceAmount + (p.interestAmount || 0), 0) || 0;

      collectedTotal += collected;
      pendingTotal += pending;
    });

    // Default mock stats if database is empty
    return {
      totalVentas: completedTotal > 0 ? completedTotal : 4820,
      cobrado: collectedTotal > 0 ? collectedTotal : 3200,
      pendiente: pendingTotal > 0 ? pendingTotal : 1620,
    };
  }, [sales]);

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

  const handleOpenCreateForm = () => {
    resetForm();
    setEditorVisible(true);
  };

  const handleSaveItem = () => {
    if (!localItem.description.trim() || parseFloat(localItem.quantity) <= 0 || parseFloat(localItem.priceAmount) < 0) {
      Alert.alert('Error', 'Please fill item description, valid quantity, and price.');
      return;
    }
    const qty = parseFloat(localItem.quantity);
    const price = parseFloat(localItem.priceAmount);
    addDetail({
      notes: localItem.description,
      quantity: qty,
      priceAmount: price,
      discountAmount: parseFloat(localItem.discountAmount) || 0,
      unitMeasureCode: localItem.unitMeasureCode,
      expenseIncomeCode: localItem.expenseIncomeCode,
      status: localItem.status,
      costAmount: 0,
      revenueAmount: qty * price
    });
    setItemModalVisible(false);
    setLocalItem({
      description: '',
      quantity: '1',
      priceAmount: '0',
      discountAmount: '0',
      unitMeasureCode: 'UNIT',
      expenseIncomeCode: 'FIN/MAIN/EXPINC/REV',
      status: 'ACTIVE'
    });
  };

  const handleSaveCharge = () => {
    if (!localCharge.description.trim() || parseFloat(localCharge.chargeAmount) <= 0) {
      Alert.alert('Error', 'Please provide charge description and valid amount.');
      return;
    }
    addExtraCharge({
      description: localCharge.description,
      chargeAmount: parseFloat(localCharge.chargeAmount),
      expenseIncomeCode: localCharge.expenseIncomeCode,
    });
    setChargeModalVisible(false);
    setLocalCharge({
      description: '',
      chargeAmount: '0',
      expenseIncomeCode: 'FIN/MAIN/EXPINC/OTH'
    });
  };

  const handleSelectCustomer = (customer: MockCustomer) => {
    setSaleDraft((p: SaleDraft) => ({
      ...p,
      customerId: customer.id,
      customerName: customer.name,
      customerDocumentNumber: customer.nit,
    }));
    setCustomerPickerVisible(false);
    setCustomerSearchText('');
  };

  const handleCustomCustomer = () => {
    if (!customerSearchText.trim()) return;
    const generatedId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    setSaleDraft((p: SaleDraft) => ({
      ...p,
      customerId: generatedId,
      customerName: customerSearchText,
      customerDocumentNumber: '999999999',
    }));
    setCustomerPickerVisible(false);
    setCustomerSearchText('');
  };

  const handleConfirmSale = async () => {
    try {
      if (!saleDraft.customerName) {
        Alert.alert('Error', 'Debe seleccionar o buscar un cliente.');
        return;
      }
      if (details.length === 0) {
        Alert.alert('Error', 'Debe agregar al menos un ítem a la venta.');
        return;
      }

      // Auto configure single payment if payment list is empty
      if (payments.length === 0) {
        addPayment({
          paymentDate: saleDraft.saleDate,
          order: 1,
          priceAmount: grandTotal,
          interestAmount: 0,
          status: 'COMPLETED'
        });
      }

      await saveSale();
      setEditorVisible(false);
      Alert.alert('Éxito', 'Venta registrada con éxito.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al guardar la venta.');
    }
  };

  const handleCardPress = async (sale: Sale) => {
    setSelectedSale(sale);
    setDetailTab('items');
    await loadSaleRelations(sale.id);
    setDetailVisible(true);
  };

  const handleAnularSale = async () => {
    if (!selectedSale) return;
    Alert.alert(
      'Confirmar anulación',
      '¿Está seguro de que desea anular esta venta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Anular', 
          style: 'destructive',
          onPress: async () => {
            try {
              await saleRepo.delete(selectedSale.id);
              setDetailVisible(false);
              setSelectedSale(null);
              fetchSales();
              Alert.alert('Éxito', 'Venta anulada correctamente.');
            } catch (err) {
              Alert.alert('Error', 'No se pudo anular la venta.');
            }
          }
        }
      ]
    );
  };

  const filteredCustomers = useMemo(() => {
    if (!customerSearchText.trim()) return MOCK_CUSTOMERS;
    const query = customerSearchText.toLowerCase();
    return MOCK_CUSTOMERS.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.nit.toLowerCase().includes(query)
    );
  }, [customerSearchText]);

  // UI mapping helpers
  const getStatusLabelAndStyles = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'Pagado':
        return { label: 'Pagado', textStyle: styles.badgeTextSuccess, badgeStyle: styles.badgeSuccess };
      case 'PENDING':
      case 'Pendiente':
        return { label: 'Pendiente', textStyle: styles.badgeTextWarning, badgeStyle: styles.badgeWarning };
      case 'PARTIAL':
      case 'Parcial':
        return { label: 'Parcial', textStyle: styles.badgeTextInfo, badgeStyle: styles.badgeInfo };
      default:
        return { label: status, textStyle: styles.badgeTextMuted, badgeStyle: styles.badgeMuted };
    }
  };

  const renderSaleItem = ({ item }: { item: Sale }) => {
    const { label, textStyle, badgeStyle } = getStatusLabelAndStyles(item.status);
    
    // Calculate total amount from items and charges
    const sub = item.details?.reduce((sum, d) => sum + (d.priceAmount * d.quantity), 0) || 0;
    const disc = item.details?.reduce((sum, d) => sum + (d.discountAmount || 0), 0) || 0;
    const chg = item.extraCharges?.reduce((sum, c) => sum + c.chargeAmount, 0) || 0;
    const total = sub + chg - disc;

    // Display ven code
    const displayCode = `#VEN-${item.id.slice(0, 4).toUpperCase()}`;
    const displayDate = item.saleDate;

    return (
      <TouchableOpacity style={styles.saleCard} onPress={() => handleCardPress(item)}>
        <View style={styles.cardHeader}>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <View style={[styles.badge, badgeStyle]}>
            <Text style={[styles.badgeText, textStyle]}>
              {label}
            </Text>
          </View>
        </View>

        <Text style={styles.dateAndCodeText}>
          {`📅 ${displayDate} · ${displayCode}`}
        </Text>

        <View style={styles.cardDivider} />
        
        <View style={styles.cardFooter}>
          <Text style={styles.footerTotal}>
            {`Bs ${total.toFixed(2)}`}
          </Text>
          <View style={styles.footerRight}>
            <Text style={styles.paymentMethodLabel}>
              {`${item.paymentMethodCode || 'Efectivo'} · ${item.currencyCode || 'BOB'}`}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <MainLayout headerTitle={t('crm.sales.title', 'Ventas')} onNavigate={onNavigate}>
      {/* Header bar matching Pantalla 1 */}
      <View style={styles.headerBar}>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="cart-outline" size={24} color={Colors.primary} />
          <Text style={styles.headerTitleText}>{t('crm.sales.title', 'Ventas')}</Text>
        </View>
        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.headerActionButton} onPress={() => {}}>
            <Ionicons name="search" size={20} color={Colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton} onPress={() => {}}>
            <Ionicons name="funnel" size={20} color={Colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.mainScroll} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        {/* RESUMEN DEL DÍA section matching Pantalla 1 */}
        <Text style={styles.subHeadingText}>RESUMEN DEL DÍA</Text>
        <View style={styles.analyticsContainer}>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsTitle}>Total ventas</Text>
            <Text style={styles.analyticsValue}>{`Bs ${stats.totalVentas.toLocaleString()}`}</Text>
            <Text style={styles.analyticsSubGreen}>↑ 12% hoy</Text>
          </View>
        </View>

        {/* RECIENTES list matching Pantalla 1 */}
        <Text style={styles.subHeadingText}>RECIENTES</Text>

        {loading && sales.length === 0 ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : sales.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={60} color={Colors.muted} />
            <Text style={styles.emptyText}>No se encontraron ventas.</Text>
            <Text style={styles.emptySubText}>Presione "Nueva venta" para registrar la primera.</Text>
          </View>
        ) : (
          sales.map(item => (
            <React.Fragment key={item.id}>
              {renderSaleItem({ item })}
            </React.Fragment>
          ))
        )}
      </ScrollView>

      {/* Floating Create button matching Pantalla 1 */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity style={styles.createButton} onPress={handleOpenCreateForm}>
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.createButtonText}>Nueva venta</Text>
        </TouchableOpacity>
      </View>

      {/* DETALLE VENTA MODAL matching Pantalla 3 */}
      {selectedSale && (
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
              <Text style={styles.modalTitle}>Detalle venta</Text>
              <View style={[
                styles.badge, 
                getStatusLabelAndStyles(selectedSale.status).badgeStyle
              ]}>
                <Text style={[
                  styles.badgeText, 
                  getStatusLabelAndStyles(selectedSale.status).textStyle
                ]}>
                  {getStatusLabelAndStyles(selectedSale.status).label}
                </Text>
              </View>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Sale Info Block */}
              <View style={styles.infoBlock}>
                <Text style={styles.infoCodeAndDate}>
                  {`#VEN-${selectedSale.id.slice(0, 4).toUpperCase()} • ${selectedSale.saleDate}`}
                </Text>
                <Text style={styles.infoCustomerName}>
                  {selectedSale.customerName}
                </Text>
                <Text style={styles.infoDocAndPayment}>
                  {`CI/NIT: ${selectedSale.customerDocumentNumber} • Bs • ${selectedSale.paymentMethodCode || 'Transferencia'}`}
                </Text>
              </View>

              {/* Tabs menu */}
              <View style={styles.tabsRow}>
                <TouchableOpacity 
                  style={[styles.tabButton, detailTab === 'items' && styles.tabButtonActive]}
                  onPress={() => setDetailTab('items')}
                >
                  <Text style={[styles.tabButtonText, detailTab === 'items' && styles.tabButtonTextActive]}>
                    Ítems
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.tabButton, detailTab === 'payments' && styles.tabButtonActive]}
                  onPress={() => setDetailTab('payments')}
                >
                  <Text style={[styles.tabButtonText, detailTab === 'payments' && styles.tabButtonTextActive]}>
                    Pagos
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.tabButton, detailTab === 'charges' && styles.tabButtonActive]}
                  onPress={() => setDetailTab('charges')}
                >
                  <Text style={[styles.tabButtonText, detailTab === 'charges' && styles.tabButtonTextActive]}>
                    Cargos
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tab contents */}
              {detailTab === 'items' && (
                <View style={styles.tabContentContainer}>
                  {selectedDetails.map((item, index) => (
                    <View key={item.id || index} style={styles.detailItemRow}>
                      <View style={styles.detailItemLeft}>
                        <View style={styles.numberCircle}>
                          <Text style={styles.numberCircleText}>{index + 1}</Text>
                        </View>
                        <View style={styles.detailItemInfo}>
                          <Text style={styles.detailItemName}>{item.notes}</Text>
                          <Text style={styles.detailItemSub}>
                            {item.discountAmount > 0 
                              ? `${item.quantity} und. · desc. Bs ${item.discountAmount.toFixed(2)}`
                              : `${item.quantity} und.`}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.detailItemPrice}>
                        {`Bs ${((item.priceAmount * item.quantity) - item.discountAmount).toFixed(2)}`}
                      </Text>
                    </View>
                  ))}

                  {/* Extra charges embedded */}
                  {selectedCharges.map((chg, index) => (
                    <View key={chg.id || index} style={styles.chargeRow}>
                      <Text style={styles.chargeLabel}>{chg.description || 'Cargo envío'}</Text>
                      <Text style={styles.chargeValue}>{`Bs ${chg.chargeAmount.toFixed(2)}`}</Text>
                    </View>
                  ))}

                  {/* Totals Summary */}
                  <View style={styles.detailTotalDivider} />
                  <View style={styles.detailTotalRow}>
                    <Text style={styles.detailTotalLabel}>Total</Text>
                    <Text style={styles.detailTotalValue}>
                      {`Bs ${(
                        selectedDetails.reduce((sum, d) => sum + (d.priceAmount * d.quantity) - d.discountAmount, 0) +
                        selectedCharges.reduce((sum, c) => sum + c.chargeAmount, 0)
                      ).toFixed(2)}`}
                    </Text>
                  </View>

                  {/* Installments in detail view */}
                  {selectedPayments.length > 0 && (
                    <View style={styles.installmentsWrapper}>
                      {selectedPayments.map((p, idx) => {
                        const isPaid = p.status === 'COMPLETED' || p.status === 'PAGADO';
                        return (
                          <View key={p.id || idx} style={styles.installmentRowCard}>
                            <View style={styles.installmentLeft}>
                              <View style={[
                                styles.bulletIndicator, 
                                isPaid ? styles.bulletGreen : styles.bulletOrange
                              ]} />
                              <View>
                                <Text style={styles.installmentTitle}>
                                  {`${p.paymentDate} • Cuota ${p.order}/${selectedPayments.length}`}
                                </Text>
                                <Text style={styles.installmentAmountText}>
                                  {`Bs ${(p.priceAmount + (p.interestAmount || 0)).toFixed(2)}`}
                                </Text>
                              </View>
                            </View>
                            <View style={[
                              styles.badge,
                              isPaid ? styles.badgeSuccess : styles.badgeWarning,
                            ]}>
                              <Text style={[
                                styles.badgeText,
                                isPaid ? styles.badgeTextSuccess : styles.badgeTextWarning,
                              ]}>
                                {isPaid ? 'Pagado' : 'Pendiente'}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}

              {detailTab === 'payments' && (
                <View style={styles.tabContentContainer}>
                  {selectedPayments.length === 0 ? (
                    <Text style={styles.emptySubText}>No hay cuotas programadas.</Text>
                  ) : (
                    selectedPayments.map((p, idx) => (
                      <View key={p.id || idx} style={styles.draftItemRow}>
                        <View style={styles.draftItemInfo}>
                          <Text style={styles.draftItemName}>{`Cuota #${p.order}`}</Text>
                          <Text style={styles.draftItemMeta}>{`Fecha vencimiento: ${p.paymentDate}`}</Text>
                          {p.interestAmount > 0 && (
                            <Text style={styles.draftItemMeta}>{`Interés: Bs ${p.interestAmount.toFixed(2)}`}</Text>
                          )}
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 6 }}>
                          <Text style={styles.draftItemTotal}>
                            {`Bs ${(p.priceAmount + (p.interestAmount || 0)).toFixed(2)}`}
                          </Text>
                          <Text style={[
                            styles.smallStatusText,
                            (p.status === 'COMPLETED' || p.status === 'PAGADO') ? { color: Colors.primary } : { color: Colors.warning }
                          ]}>
                            {p.status}
                          </Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )}

              {detailTab === 'charges' && (
                <View style={styles.tabContentContainer}>
                  {selectedCharges.length === 0 ? (
                    <Text style={styles.emptySubText}>No hay cargos adicionales registrados.</Text>
                  ) : (
                    selectedCharges.map((c, idx) => (
                      <View key={c.id || idx} style={styles.draftItemRow}>
                        <View style={styles.draftItemInfo}>
                          <Text style={styles.draftItemName}>{c.description}</Text>
                          <Text style={styles.draftItemMeta}>Cargo Adicional</Text>
                        </View>
                        <Text style={styles.draftItemTotal}>{`Bs ${c.chargeAmount.toFixed(2)}`}</Text>
                      </View>
                    ))
                  )}
                </View>
              )}
            </ScrollView>

            {/* Bottom action buttons matching Pantalla 3 */}
            <View style={styles.actionRowBar}>
              <TouchableOpacity style={styles.actionBarButton} onPress={() => Alert.alert('Imprimir', 'Simulando impresión...')}>
                <Ionicons name="print-outline" size={20} color={Colors.foreground} />
                <Text style={styles.actionBarText}>Imprimir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBarButton} onPress={() => Alert.alert('Compartir', 'Simulando compartir...')}>
                <Ionicons name="share-social-outline" size={20} color={Colors.foreground} />
                <Text style={styles.actionBarText}>Compartir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBarButton} onPress={() => {
                setDetailVisible(false);
                // Load details directly into draft
                setSaleDraft({
                  customerId: selectedSale.customerId,
                  customerName: selectedSale.customerName,
                  customerDocumentNumber: selectedSale.customerDocumentNumber,
                  saleDate: selectedSale.saleDate,
                  status: selectedSale.status,
                  paymentMethodCode: selectedSale.paymentMethodCode,
                  currencyCode: selectedSale.currencyCode
                });
                // Note: we can edit, but for simplicity of the prompt, we just let them open editing draft
                setEditorVisible(true);
              }}>
                <Ionicons name="create-outline" size={20} color={Colors.foreground} />
                <Text style={styles.actionBarText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBarButton} onPress={handleAnularSale}>
                <Ionicons name="trash-outline" size={20} color={Colors.destructive} />
                <Text style={[styles.actionBarText, { color: Colors.destructive }]}>Anular</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      )}

      {/* NUEVA VENTA FORM MODAL matching Pantalla 2 */}
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
            <Text style={styles.modalTitle}>Nueva venta</Text>
            <TouchableOpacity onPress={() => {}} style={styles.headerIconButton}>
              <Ionicons name="ellipsis-horizontal" size={24} color={Colors.foreground} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.formPadding}>
              {/* CLIENTE lookup input */}
              <Text style={styles.formInputHeading}>CLIENTE</Text>
              <TouchableOpacity 
                style={styles.customerSelectorTrigger}
                onPress={() => setCustomerPickerVisible(true)}
              >
                <Ionicons name="search" size={20} color={Colors.muted} />
                <Text style={styles.customerSelectorValue}>
                  {saleDraft.customerName || 'Buscar cliente...'}
                </Text>
                {saleDraft.customerName ? (
                  <TouchableOpacity onPress={(e) => {
                    e.stopPropagation();
                    setSaleDraft((p: SaleDraft) => ({ ...p, customerName: '', customerId: '', customerDocumentNumber: '' }));
                  }}>
                    <Ionicons name="close-circle" size={18} color={Colors.muted} />
                  </TouchableOpacity>
                ) : (
                  <Ionicons name="person-outline" size={18} color={Colors.muted} />
                )}
              </TouchableOpacity>

              <View style={styles.gridRow}>
                <View style={styles.gridCol}>
                  <Text style={styles.formFieldLabel}>Nombre cliente</Text>
                  <TextInput 
                    style={styles.formTextInputSmall}
                    value={saleDraft.customerName}
                    onChangeText={txt => setSaleDraft((p: SaleDraft) => ({ ...p, customerName: txt }))}
                    placeholder="Nombre"
                    placeholderTextColor={Colors.muted}
                  />
                </View>
                <View style={styles.gridCol}>
                  <Text style={styles.formFieldLabel}>Documento / NIT</Text>
                  <TextInput 
                    style={styles.formTextInputSmall}
                    value={saleDraft.customerDocumentNumber}
                    onChangeText={txt => setSaleDraft((p: SaleDraft) => ({ ...p, customerDocumentNumber: txt }))}
                    placeholder="NIT / Doc"
                    placeholderTextColor={Colors.muted}
                  />
                </View>
              </View>

              {/* MONEDA Y PAGO buttons side-by-side */}
              <Text style={styles.formInputHeading}>MONEDA Y PAGO</Text>
              <View style={styles.currencyAndPaymentRow}>
                <TouchableOpacity 
                  style={styles.pickerSelectorButton}
                  onPress={() => openDropdownPicker('Seleccionar Moneda', [
                    { CODE: 'BOB', name: '$ BOB' },
                    { CODE: 'USD', name: '$ USD' },
                    { CODE: 'EUR', name: '€ EUR' }
                  ], saleDraft.currencyCode, val => setSaleDraft((p: SaleDraft) => ({ ...p, currencyCode: val })))}
                >
                  <Text style={styles.pickerButtonIcon}>$</Text>
                  <Text style={styles.pickerButtonText}>{saleDraft.currencyCode}</Text>
                  <Ionicons name="chevron-down" size={16} color={Colors.muted} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.pickerSelectorButton}
                  onPress={() => openDropdownPicker('Método de Pago', [
                    { CODE: 'Transferencia', name: 'Transferencia' },
                    { CODE: 'Efectivo', name: 'Efectivo' },
                    { CODE: 'QR/Tarjeta', name: 'QR/Tarjeta' }
                  ], saleDraft.paymentMethodCode, val => setSaleDraft((p: SaleDraft) => ({ ...p, paymentMethodCode: val })))}
                >
                  <Ionicons name="card-outline" size={18} color={Colors.muted} />
                  <Text style={styles.pickerButtonText}>{saleDraft.paymentMethodCode}</Text>
                  <Ionicons name="chevron-down" size={16} color={Colors.muted} />
                </TouchableOpacity>
              </View>

              {/* ITEMS list section matching Pantalla 2 */}
              <Text style={styles.formInputHeading}>ÍTEMS</Text>
              <View style={styles.itemsFormContainer}>
                {details.map((item, index) => (
                  <View key={index} style={styles.detailItemFormRow}>
                    <View style={styles.detailItemFormLeft}>
                      <View style={styles.numberCircle}>
                        <Text style={styles.numberCircleText}>{index + 1}</Text>
                      </View>
                      <View style={styles.detailItemInfo}>
                        <Text style={styles.detailItemName}>{item.notes}</Text>
                        <Text style={styles.detailItemSub}>
                          {`${item.quantity} unid. x Bs ${item.priceAmount.toFixed(2)}`}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailItemFormRight}>
                      <Text style={styles.detailItemPrice}>
                        {`Bs ${(item.priceAmount * item.quantity).toFixed(2)}`}
                      </Text>
                      <TouchableOpacity onPress={() => removeDetail(index)}>
                        <Ionicons name="trash-outline" size={18} color={Colors.destructive} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {/* Dashed button to add item */}
                <TouchableOpacity 
                  style={styles.dashedAddButton}
                  onPress={() => setItemModalVisible(true)}
                >
                  <Ionicons name="add" size={18} color={Colors.muted} />
                  <Text style={styles.dashedAddButtonText}>Agregar ítem</Text>
                </TouchableOpacity>
              </View>

              {/* Extra charges trigger */}
              {extraCharges.length > 0 && (
                <View style={styles.formChargesWrapper}>
                  {extraCharges.map((chg, index) => (
                    <View key={index} style={styles.chargeRowForm}>
                      <Text style={styles.chargeFormLabel}>{chg.description}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                        <Text style={styles.chargeFormValue}>{`Bs ${chg.chargeAmount.toFixed(2)}`}</Text>
                        <TouchableOpacity onPress={() => removeExtraCharge(index)}>
                          <Ionicons name="close-circle" size={16} color={Colors.destructive} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Button to add extra charge if needed */}
              <TouchableOpacity 
                style={styles.addChargeLinkButton}
                onPress={() => setChargeModalVisible(true)}
              >
                <Ionicons name="add-circle-outline" size={16} color={Colors.primary} />
                <Text style={styles.addChargeLinkText}>Agregar cargo adicional</Text>
              </TouchableOpacity>

              {/* Summary table card matching Pantalla 2 */}
              <View style={styles.formSummaryCard}>
                <View style={styles.formSummaryRow}>
                  <Text style={styles.formSummaryLabel}>Subtotal</Text>
                  <Text style={styles.formSummaryValue}>{`Bs ${subtotal.toFixed(2)}`}</Text>
                </View>
                <View style={styles.formSummaryRow}>
                  <Text style={styles.formSummaryLabel}>Cargo adicional</Text>
                  <Text style={styles.formSummaryValue}>{`Bs ${totalExtraCharges.toFixed(2)}`}</Text>
                </View>
                <View style={styles.formSummaryRow}>
                  <Text style={styles.formSummaryLabel}>Descuento</Text>
                  <Text style={styles.formSummaryDiscountValue}>{`- Bs ${totalDiscount.toFixed(2)}`}</Text>
                </View>
                
                <View style={styles.summaryCardDivider} />
                
                <View style={styles.formSummaryRow}>
                  <Text style={styles.formSummaryTotalLabel}>Total</Text>
                  <Text style={styles.formSummaryTotalValue}>{`Bs ${grandTotal.toFixed(2)}`}</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Confirm Button matching Pantalla 2 */}
          <View style={styles.formFooterContainer}>
            <TouchableOpacity style={styles.confirmSaleButton} onPress={handleConfirmSale}>
              <Text style={styles.confirmSaleButtonText}>Confirmar venta</Text>
            </TouchableOpacity>
          </View>

          {/* CUSTOMER SEARCH MODAL */}
          {customerPickerVisible && (
            <View style={styles.subModalContainer}>
              <View style={styles.subModalContent}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md }}>
                  <Text style={styles.subModalTitle}>Buscar cliente</Text>
                  <TouchableOpacity onPress={() => setCustomerPickerVisible(false)}>
                    <Ionicons name="close" size={24} color={Colors.foreground} />
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.textInput}
                  placeholder="Escriba nombre o NIT/CI..."
                  placeholderTextColor={Colors.muted}
                  value={customerSearchText}
                  onChangeText={setCustomerSearchText}
                />

                <ScrollView style={{ maxHeight: 200 }} keyboardShouldPersistTaps="handled">
                  {filteredCustomers.map(customer => (
                    <TouchableOpacity 
                      key={customer.id} 
                      style={styles.customerListItem}
                      onPress={() => handleSelectCustomer(customer)}
                    >
                      <View>
                        <Text style={styles.customerItemName}>{customer.name}</Text>
                        <Text style={styles.customerItemSub}>{`NIT/CI: ${customer.nit}`}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {customerSearchText.trim().length > 0 && (
                  <TouchableOpacity 
                    style={styles.customCustomerButton} 
                    onPress={handleCustomCustomer}
                  >
                    <Ionicons name="person-add-outline" size={18} color="#fff" />
                    <Text style={styles.customCustomerButtonText}>
                      {`Usar "${customerSearchText}"`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Submodal: ADD ITEM */}
          {itemModalVisible && (
            <View style={styles.subModalContainer}>
              <View style={styles.subModalContent}>
                <Text style={styles.subModalTitle}>Agregar Ítem</Text>
                
                <Text style={styles.inputLabel}>Seleccionar Producto/Servicio</Text>
                <TouchableOpacity 
                  style={styles.dropdownTrigger}
                  onPress={() => openDropdownPicker('Seleccionar Ítem', itemOptions, localItem.description, val => {
                    const opt = itemOptions.find(i => i.CODE === val);
                    setLocalItem(p => ({ ...p, description: opt ? opt.name : val }));
                  })}
                >
                  <Text style={styles.dropdownValue}>{localItem.description || 'Seleccione un ítem...'}</Text>
                  <Ionicons name="chevron-down" size={16} color={Colors.muted} />
                </TouchableOpacity>

                <Text style={styles.inputLabel}>O escribir descripción personalizada</Text>
                <TextInput 
                  style={styles.textInput}
                  value={localItem.description}
                  onChangeText={txt => setLocalItem(p => ({ ...p, description: txt }))}
                  placeholder="Ej. Producto Alpha"
                  placeholderTextColor={Colors.muted}
                />

                <View style={styles.gridRow}>
                  <View style={styles.gridCol}>
                    <Text style={styles.inputLabel}>Cantidad</Text>
                    <TextInput 
                      style={styles.textInput}
                      value={localItem.quantity}
                      onChangeText={txt => setLocalItem(p => ({ ...p, quantity: txt }))}
                      keyboardType="numeric"
                      placeholder="1"
                      placeholderTextColor={Colors.muted}
                    />
                  </View>
                  <View style={styles.gridCol}>
                    <Text style={styles.inputLabel}>Precio Unitario</Text>
                    <TextInput 
                      style={styles.textInput}
                      value={localItem.priceAmount}
                      onChangeText={txt => setLocalItem(p => ({ ...p, priceAmount: txt }))}
                      keyboardType="numeric"
                      placeholder="0.00"
                      placeholderTextColor={Colors.muted}
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Descuento</Text>
                <TextInput 
                  style={styles.textInput}
                  value={localItem.discountAmount}
                  onChangeText={txt => setLocalItem(p => ({ ...p, discountAmount: txt }))}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={Colors.muted}
                />

                <View style={styles.subModalButtons}>
                  <TouchableOpacity style={styles.subCancel} onPress={() => setItemModalVisible(false)}>
                    <Text style={styles.subCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.subSave} onPress={handleSaveItem}>
                    <Text style={styles.subSaveText}>Agregar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Submodal: ADD CHARGE */}
          {chargeModalVisible && (
            <View style={styles.subModalContainer}>
              <View style={styles.subModalContent}>
                <Text style={styles.subModalTitle}>Agregar Cargo Adicional</Text>
                
                <Text style={styles.inputLabel}>Descripción del Cargo</Text>
                <TextInput 
                  style={styles.textInput}
                  value={localCharge.description}
                  onChangeText={txt => setLocalCharge(p => ({ ...p, description: txt }))}
                  placeholder="Ej. Envío / Delivery"
                  placeholderTextColor={Colors.muted}
                />

                <Text style={styles.inputLabel}>Monto</Text>
                <TextInput 
                  style={styles.textInput}
                  value={localCharge.chargeAmount}
                  onChangeText={txt => setLocalCharge(p => ({ ...p, chargeAmount: txt }))}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={Colors.muted}
                />

                <View style={styles.subModalButtons}>
                  <TouchableOpacity style={styles.subCancel} onPress={() => setChargeModalVisible(false)}>
                    <Text style={styles.subCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.subSave} onPress={handleSaveCharge}>
                    <Text style={styles.subSaveText}>Agregar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Global Dropdown Picker Modal */}
          {pickerModal.visible && (
            <Pressable 
              style={styles.pickerOverlay} 
              onPress={() => setPickerModal(p => ({ ...p, visible: false }))}
            >
              <View style={styles.pickerContent}>
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
              </View>
            </Pressable>
          )}
          </SafeAreaView>
      </Modal>

    </MainLayout>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitleText: {
    color: Colors.foreground,
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
  },
  mainScroll: {
    flex: 1,
  },
  subHeadingText: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  analyticsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  analyticsTitle: {
    color: Colors.muted,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  analyticsValue: {
    color: Colors.foreground,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  analyticsSubGreen: {
    color: Colors.primary,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    marginTop: 4,
  },
  analyticsSubOrange: {
    color: Colors.warning,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    marginTop: 4,
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: Spacing.sm,
  },
  emptyText: {
    color: Colors.foreground,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  emptySubText: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
  },
  saleCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  customerName: {
    color: Colors.foreground,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  dateAndCodeText: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
    marginBottom: Spacing.sm,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  footerTotal: {
    color: Colors.foreground,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paymentMethodLabel: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  badgeWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeInfo: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  badgeMuted: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  badgeTextSuccess: {
    color: Colors.primary,
  },
  badgeTextWarning: {
    color: Colors.warning,
  },
  badgeTextInfo: {
    color: '#3b82f6',
  },
  badgeTextMuted: {
    color: Colors.muted,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 90,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'transparent',
  },
  createButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    height: 52,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: '#fff',
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerIconButton: {
    padding: 4,
  },
  modalTitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  modalScroll: {
    flex: 1,
  },
  infoBlock: {
    padding: Spacing.md,
    backgroundColor: Colors.sidebar,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 4,
  },
  infoCodeAndDate: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
  },
  infoCustomerName: {
    color: Colors.foreground,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  infoDocAndPayment: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: Colors.primary,
  },
  tabButtonText: {
    color: Colors.muted,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
  },
  tabButtonTextActive: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  tabContentContainer: {
    padding: Spacing.md,
  },
  detailItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  numberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberCircleText: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  detailItemInfo: {
    flex: 1,
  },
  detailItemName: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  detailItemSub: {
    color: Colors.muted,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  detailItemPrice: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  chargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  chargeLabel: {
    color: Colors.muted,
    fontSize: Typography.sizes.md,
  },
  chargeValue: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  detailTotalDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  detailTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  detailTotalLabel: {
    color: Colors.foreground,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  detailTotalValue: {
    color: Colors.primary,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  installmentsWrapper: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  installmentRowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  installmentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bulletIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bulletGreen: {
    backgroundColor: Colors.primary,
  },
  bulletOrange: {
    backgroundColor: Colors.warning,
  },
  installmentTitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  installmentAmountText: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginTop: 2,
  },
  actionRowBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.sidebar,
    paddingVertical: 10,
  },
  actionBarButton: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  actionBarText: {
    color: Colors.foreground,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  formPadding: {
    padding: Spacing.md,
  },
  formInputHeading: {
    color: Colors.muted,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.md,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  customerSelectorTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  customerSelectorValue: {
    flex: 1,
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
  },
  currencyAndPaymentRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  pickerSelectorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.md,
  },
  pickerButtonIcon: {
    color: Colors.muted,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  pickerButtonText: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
  },
  itemsFormContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  detailItemFormRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.sm,
  },
  detailItemFormLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  detailItemFormRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dashedAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  dashedAddButtonText: {
    color: Colors.muted,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
  },
  formChargesWrapper: {
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  chargeRowForm: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chargeFormLabel: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
  },
  chargeFormValue: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  addChargeLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  addChargeLinkText: {
    color: Colors.primary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  formSummaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  formSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formSummaryLabel: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
  },
  formSummaryValue: {
    color: Colors.foreground,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  formSummaryDiscountValue: {
    color: Colors.primary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  summaryCardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  formSummaryTotalLabel: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  formSummaryTotalValue: {
    color: Colors.primary,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  formFooterContainer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.sidebar,
  },
  confirmSaleButton: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
  },
  confirmSaleButtonText: {
    color: '#fff',
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  customerListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  customerItemName: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  customerItemSub: {
    color: Colors.muted,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  customCustomerButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: Spacing.md,
  },
  customCustomerButtonText: {
    color: '#fff',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  inputLabel: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: 6,
    marginTop: Spacing.sm,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.sm,
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    marginBottom: Spacing.sm,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  dropdownValue: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
  },
  draftItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  draftItemInfo: {
    flex: 1,
  },
  draftItemName: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  draftItemMeta: {
    color: Colors.muted,
    fontSize: Typography.sizes.xs,
  },
  draftItemTotal: {
    color: Colors.foreground,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  smallStatusText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  subModalContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  subModalContent: {
    backgroundColor: Colors.sidebar,
    borderRadius: 20,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  subModalTitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  gridCol: {
    flex: 1,
  },
  subModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  subCancel: {
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
  },
  subCancelText: {
    color: Colors.muted,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  subSave: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
  },
  subSaveText: {
    color: '#fff',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  pickerContent: {
    backgroundColor: Colors.sidebar,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.md,
    maxHeight: '50%',
  },
  pickerTitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  pickerDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  pickerItem: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  activePickerItem: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 12,
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
  formFieldLabel: {
    color: Colors.muted,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  formTextInputSmall: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.sm,
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    marginBottom: Spacing.sm,
  },
});
