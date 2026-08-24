import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Pressable
} from 'react-native';
import { MainLayout } from '../../../../shared/layout/MainLayout';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles/MovementReportScreenStyles';
import { Colors, Spacing } from '../../../../shared/theme/constants';
import { loadDomainParameters, getBatchParameters, MovementReportItem, Warehouse } from '@kplian/core';
import { MovementRepositoryImpl, WarehouseRepositoryImpl } from '@kplian/infrastructure';

const movementRepo = new MovementRepositoryImpl();
const warehouseRepo = new WarehouseRepositoryImpl();

type ReportType = 'rep_daily' | 'rep_kardex' | 'rep_stock';

interface MovementReportScreenProps {
  type: ReportType;
  onBack?: () => void;
  onNavigate?: (route: string) => void;
}

export default function MovementReportScreen({ type, onBack, onNavigate }: MovementReportScreenProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [itemCode, setItemCode] = useState('');

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [items, setItems] = useState<{ CODE: string; name: string }[]>([]);
  const [loadingForm, setLoadingForm] = useState(true);
  
  const [results, setResults] = useState<MovementReportItem[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Picker States
  const [pickerModal, setPickerModal] = useState<{
    visible: boolean;
    title: string;
    data: { CODE: string; name: string }[];
    selectedValue: string;
    onSelect: (val: string) => void;
  }>({ visible: false, title: '', data: [], selectedValue: '', onSelect: () => {} });

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [dateTargetSetter, setDateTargetSetter] = useState<((val: string) => void) | null>(null);
  const [pickerYear, setPickerYear] = useState('2026');
  const [pickerMonth, setPickerMonth] = useState('01');
  const [pickerDay, setPickerDay] = useState('01');

  useEffect(() => {
    loadFormData();
    setResults([]);
    setExpandedItemId(null);
  }, [type]);

  const loadFormData = async () => {
    setLoadingForm(true);
    try {
      const whList = await warehouseRepo.getAll();
      setWarehouses(whList);

      const mapped = await loadDomainParameters(getBatchParameters, [{ fullCode: 'WAR/MAIN/ITEM' }]);
      if (mapped['WAR/MAIN/ITEM']) {
        const list = mapped['WAR/MAIN/ITEM'].map((x: any) => ({
          CODE: x.CODE || x.code,
          name: x.NAME || x.name || x.description || x.CODE || x.code
        }));
        setItems(list);
      }
    } catch (err) {
      console.error('Failed to load form data', err);
    } finally {
      setLoadingForm(false);
    }
  };

  const getReportTitle = () => {
    switch (type) {
      case 'rep_daily': return 'Daily Report';
      case 'rep_kardex': return 'Kardex Report';
      case 'rep_stock': return 'Stock Report';
      default: return 'Movement Report';
    }
  };

  const isWarehouseRequired = type === 'rep_daily' || type === 'rep_stock';
  const isItemRequired = type === 'rep_kardex';
  const showMoneyValues = type !== 'rep_stock';

  const validate = () => {
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Start Date and End Date are required');
      return false;
    }
    if (new Date(startDate) > new Date(endDate)) {
      Alert.alert('Error', 'Start Date must be before or equal to End Date');
      return false;
    }
    if (isWarehouseRequired && !warehouseId) {
      Alert.alert('Error', 'Warehouse is required for this report');
      return false;
    }
    if (isItemRequired && !itemCode) {
      Alert.alert('Error', 'Item is required for this report');
      return false;
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!validate()) return;
    
    setLoadingResults(true);
    try {
      const filters: any = { startDate, endDate };
      
      // Warehouse is always visible in the current UI, send null if empty
      filters.warehouseId = warehouseId ? warehouseId : null;
      
      // Item is only visible for rep_kardex and rep_stock
      const isItemVisible = type === 'rep_kardex' || type === 'rep_stock';
      if (isItemVisible) {
        filters.itemCode = itemCode ? itemCode : null;
      } else {
        filters.itemCode = null; // Send null if hidden
      }

      const data = await movementRepo.getMovementsReport(filters);
      setResults(data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to generate report');
    } finally {
      setLoadingResults(false);
    }
  };

  const openDropdownPicker = (title: string, data: any[], selectedValue: string, onSelect: (val: string) => void) => {
    setPickerModal({ visible: true, title, data, selectedValue, onSelect });
  };

  const openDatePicker = (initialVal: string, setter: (val: string) => void) => {
    const today = new Date().toISOString().split('T')[0].split('-');
    let y = today[0];
    let m = today[1];
    let d = today[2];

    if (initialVal && initialVal.includes('-')) {
      const parts = initialVal.split('-');
      if (parts[0]) y = parts[0];
      if (parts[1]) m = parts[1];
      if (parts[2]) d = parts[2];
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

  const renderDropdownModal = () => {
    if (!pickerModal.visible) return null;
    return (
      <Modal visible transparent animationType="fade" onRequestClose={() => setPickerModal(p => ({ ...p, visible: false }))}>
        <Pressable style={styles.pickerOverlay} onPress={() => setPickerModal(p => ({ ...p, visible: false }))}>
          <Pressable style={styles.pickerContent} onPress={e => e.stopPropagation()}>
            <Text style={styles.pickerTitle}>{pickerModal.title}</Text>
            <View style={styles.pickerDivider} />
            <FlatList
              data={pickerModal.data}
              keyExtractor={item => item.CODE}
              renderItem={({ item }) => {
                const isSelected = pickerModal.selectedValue === item.CODE;
                return (
                  <TouchableOpacity
                    style={[styles.pickerItem, isSelected && styles.activePickerItem]}
                    onPress={() => {
                      pickerModal.onSelect(item.CODE);
                      setPickerModal(p => ({ ...p, visible: false }));
                    }}
                  >
                    <Text style={[styles.pickerLabel, isSelected && styles.activePickerLabel]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  const renderDatePickerModal = () => {
    if (!datePickerVisible) return null;
    
    const yearsList = ['2024', '2025', '2026', '2027', '2028', '2029', '2030'];
    const monthsList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const daysList = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

    const format = process.env.EXPO_PUBLIC_DATE_FORMAT || 'yyyy-mm-dd';

    const renderYearColumn = () => (
      <FlatList key="year" data={yearsList} keyExtractor={i => i} renderItem={({ item }) => (
        <TouchableOpacity style={styles.datePickerItem} onPress={() => setPickerYear(item)}>
          <Text style={[styles.datePickerItemText, item === pickerYear && styles.datePickerItemActive]}>{item}</Text>
        </TouchableOpacity>
      )} />
    );

    const renderMonthColumn = () => (
      <FlatList key="month" data={monthsList} keyExtractor={i => i} renderItem={({ item }) => (
        <TouchableOpacity style={styles.datePickerItem} onPress={() => setPickerMonth(item)}>
          <Text style={[styles.datePickerItemText, item === pickerMonth && styles.datePickerItemActive]}>{item}</Text>
        </TouchableOpacity>
      )} />
    );

    const renderDayColumn = () => (
      <FlatList key="day" data={daysList} keyExtractor={i => i} renderItem={({ item }) => (
        <TouchableOpacity style={styles.datePickerItem} onPress={() => setPickerDay(item)}>
          <Text style={[styles.datePickerItemText, item === pickerDay && styles.datePickerItemActive]}>{item}</Text>
        </TouchableOpacity>
      )} />
    );

    const getOrderedColumns = () => {
      switch (format.toLowerCase()) {
        case 'dd/mm/yyyy':
        case 'dd-mm-yyyy':
          return [renderDayColumn(), renderMonthColumn(), renderYearColumn()];
        case 'mm/dd/yyyy':
        case 'mm-dd-yyyy':
          return [renderMonthColumn(), renderDayColumn(), renderYearColumn()];
        default:
          return [renderYearColumn(), renderMonthColumn(), renderDayColumn()];
      }
    };

    return (
      <Modal visible transparent animationType="fade" onRequestClose={() => setDatePickerVisible(false)}>
        <Pressable style={styles.pickerOverlay} onPress={() => setDatePickerVisible(false)}>
          <Pressable style={styles.pickerContent} onPress={e => e.stopPropagation()}>
            <Text style={styles.pickerTitle}>Select Date</Text>
            <View style={styles.pickerDivider} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', height: 200 }}>
              {getOrderedColumns()}
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setDatePickerVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleConfirmDate}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  const renderResultItem = ({ item }: { item: MovementReportItem }) => {
    const isExpanded = expandedItemId === item.movementCode;
    const isOutbound = item.outbound > 0;
    const isInbound = item.inbound > 0;
    const typeIcon = isOutbound ? "arrow-up-circle" : (isInbound ? "arrow-down-circle" : "swap-horizontal");
    const typeColor = isOutbound ? Colors.destructive : (isInbound ? Colors.success : Colors.primary);
    const qtyText = isOutbound ? `-${item.outbound}` : (isInbound ? `+${item.inbound}` : '0');

    return (
      <TouchableOpacity style={styles.card} onPress={() => setExpandedItemId(isExpanded ? null : item.movementCode)}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <Ionicons name={typeIcon} size={28} color={typeColor} />
            <View>
              <Text style={styles.cardTitle}>{item.itemCode}</Text>
              <Text style={styles.cardDate}>{item.movementDate.split('T')[0]} • {item.movementCode}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.cardTitle, { color: typeColor }]}>{qtyText}</Text>
            <Text style={styles.cardDate}>Bal: {item.balance}</Text>
          </View>
        </View>

        {isExpanded && (
          <View style={{ marginTop: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border }}>
            <Text style={styles.cardLabel}>Warehouse: <Text style={styles.cardValue}>{item.warehouseName} ({item.warehouseCode})</Text></Text>
            
            {showMoneyValues && (
              <>
                <View style={styles.divider} />
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Unit Cost:</Text>
                  <Text style={styles.cardValue}>{item.unitCost}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Inbound Value:</Text>
                  <Text style={styles.cardValue}>{item.inboundValue}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Outbound Value:</Text>
                  <Text style={styles.cardValue}>{item.outboundValue}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Balance Cost:</Text>
                  <Text style={[styles.cardValue, styles.cardHighlightValue]}>{item.balanceCost}</Text>
                </View>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <MainLayout headerTitle={getReportTitle()} onNavigate={onNavigate}>
      <View style={styles.headerBar}>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="document-text-outline" size={24} color={Colors.primary} />
          <Text style={styles.headerTitleText}>{getReportTitle()}</Text>
        </View>
      </View>
      <View style={styles.content}>

        {loadingForm ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : (
          <View style={styles.formPadding}>
            <Text style={styles.formInputHeading}>WAREHOUSE {isWarehouseRequired && <Text style={styles.requiredLabel}>*</Text>}</Text>
            <TouchableOpacity 
              style={styles.customerSelectorTrigger} 
              onPress={() => openDropdownPicker('Select Warehouse', warehouses.map(w => ({ CODE: w.id, name: w.name })), warehouseId, setWarehouseId)}
            >
              <Ionicons name="business" size={20} color={Colors.muted} />
              <Text style={styles.customerSelectorValue}>
                {warehouseId ? warehouses.find(w => w.id === warehouseId)?.name : 'Select Warehouse...'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={Colors.muted} />
            </TouchableOpacity>

            {(type === 'rep_kardex' || type === 'rep_stock') && (
              <>
                <Text style={styles.formInputHeading}>ITEM {isItemRequired && <Text style={styles.requiredLabel}>*</Text>}</Text>
                <TouchableOpacity 
                  style={styles.customerSelectorTrigger} 
                  onPress={() => openDropdownPicker('Select Item', items, itemCode, setItemCode)}
                >
                  <Ionicons name="cube" size={20} color={Colors.muted} />
                  <Text style={styles.customerSelectorValue}>
                    {itemCode ? items.find(i => i.CODE === itemCode)?.name : 'Select Item...'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={Colors.muted} />
                </TouchableOpacity>
              </>
            )}

            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <Text style={styles.formFieldLabel}>START DATE <Text style={styles.requiredLabel}>*</Text></Text>
                <TouchableOpacity style={styles.formPickerSelectorButton} onPress={() => openDatePicker(startDate, setStartDate)}>
                  <Text style={startDate ? styles.formPickerSelectorValue : styles.pickerPlaceholder}>
                    {startDate || (process.env.EXPO_PUBLIC_DATE_FORMAT || 'yyyy-mm-dd').toUpperCase()}
                  </Text>
                  <Ionicons name="calendar-outline" size={18} color={Colors.mutedForeground} />
                </TouchableOpacity>
              </View>

              <View style={styles.gridCol}>
                <Text style={styles.formFieldLabel}>END DATE <Text style={styles.requiredLabel}>*</Text></Text>
                <TouchableOpacity style={styles.formPickerSelectorButton} onPress={() => openDatePicker(endDate, setEndDate)}>
                  <Text style={endDate ? styles.formPickerSelectorValue : styles.pickerPlaceholder}>
                    {endDate || (process.env.EXPO_PUBLIC_DATE_FORMAT || 'yyyy-mm-dd').toUpperCase()}
                  </Text>
                  <Ionicons name="calendar-outline" size={18} color={Colors.mutedForeground} />
                </TouchableOpacity>
              </View>
            </View>


            <TouchableOpacity 
              style={[styles.generateButton, loadingResults && styles.generateButtonDisabled]} 
              onPress={handleGenerate}
              disabled={loadingResults}
            >
              {loadingResults ? (
                <ActivityIndicator color={Colors.primaryForeground} />
              ) : (
                <>
                  <Ionicons name="analytics-outline" size={20} color={Colors.primaryForeground} />
                  <Text style={styles.generateButtonText}>Generate</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {results.length > 0 && (
          <Text style={styles.resultsHeader}>Results ({results.length})</Text>
        )}

        <FlatList
          data={results}
          keyExtractor={(item, index) => `${item.movementCode}-${index}`}
          renderItem={renderResultItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            !loadingResults && !loadingForm && results.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color={Colors.mutedForeground} />
                <Text style={styles.emptyStateText}>No movements found.</Text>
              </View>
            ) : null
          }
        />
      </View>
      {renderDropdownModal()}
      {renderDatePickerModal()}
    </MainLayout>
  );
}
