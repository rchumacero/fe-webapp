import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, TextInput } from 'react-native';
import { useTranslation } from '@kplian/i18n';
import { MainLayout } from '../../../../../../shared/layout/MainLayout';
import { Colors, Spacing, Typography } from '../../../../../../shared/theme/constants';
import { 
  CommercialProductRepositoryImpl, 
  ScheduleRepositoryImpl,
  CampaignRepositoryImpl,
  CollaboratorRepositoryImpl,
  createApiClient,
} from '@kplian/infrastructure';
import { 
  CommercialProduct, 
  Schedule,
  Campaign,
  Collaborator,
} from '@kplian/core';
import { CUSTOMER_SERVICE_CONSTANTS } from '../../constants/customer-service-constants';
import { Ionicons } from '@expo/vector-icons';
import { useVendor } from '../../../../../../shared/auth/AuthContext';

// Repositorios
const productRepo = new CommercialProductRepositoryImpl();
const scheduleRepo = new ScheduleRepositoryImpl();
const campaignRepo = new CampaignRepositoryImpl();
const collaboratorRepo = new CollaboratorRepositoryImpl();
const crmApi = createApiClient('crm');

type WizardStep = 'CATEGORY' | 'PRODUCT' | 'VENDOR' | 'SCHEDULE' | 'CONFIRM';

interface MobileSchedule extends Schedule {
  fromTime?: string;
  toTime?: string;
  dayCode?: string;
}

export default function CreateAppointmentScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { vendor: vendorId } = useVendor();
  const [step, setStep] = useState<WizardStep>('CATEGORY');
  const [loading, setLoading] = useState(false);
  
  // Datos de selección
  const [categories, setCategories] = useState<{ code: string; description: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<{ code: string; description: string } | null>(null);
  const [products, setProducts] = useState<CommercialProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CommercialProduct | null>(null);
  const [schedules, setSchedules] = useState<MobileSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<MobileSchedule | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  const [persons, setPersons] = useState<any[]>([]);

  // Carga de personas para mostrar nombres de colaboradores
  useEffect(() => {
    if (!vendorId) return;
    const fetchPersons = async () => {
      try {
        const response = await crmApi.get<any>(`/v1/persons/by-vendor-id/${vendorId}`);
        const data = response.data;
        setPersons(Array.isArray(data) ? data : data.data || data.content || data.results || []);
      } catch (error) {
        console.error("Error fetching persons on mobile wizard:", error);
      }
    };
    fetchPersons();
  }, [vendorId]);

  const getCollaboratorName = useCallback((employeeId: string) => {
    const person = persons.find(p => p.id === employeeId);
    if (!person) return employeeId;
    return person.completeName || `${person.name1 ?? ''} ${person.surname1 ?? ''}`.trim() || person.code || employeeId;
  }, [persons]);
  const [admitNewRecordAnyTime, setAdmitNewRecordAnyTime] = useState(false);
  const [useCustomSchedule, setUseCustomSchedule] = useState(false);
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [customTime, setCustomTime] = useState('10:00 - 11:00');
  const [selectedWeekDate, setSelectedWeekDate] = useState<Date>(new Date());

  const filteredSchedules = useMemo(() => {
    const base = new Date(selectedWeekDate);
    const day = base.getDay();
    const diff = base.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(base.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return schedules.filter(item => {
      const itemDate = new Date(item.fromDate);
      return itemDate >= monday && itemDate <= sunday;
    });
  }, [schedules, selectedWeekDate]);

  // Carga inicial de categorías
  useEffect(() => {
    if (!vendorId) return;
    
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const dateStr = selectedWeekDate.toISOString().split('T')[0];
        const data = await campaignRepo.getAvailable(dateStr);
        setCategories(data as any);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [vendorId, selectedWeekDate]);

  // Carga de productos por categoría al seleccionar categoría
  const handleCategorySelect = async (category: { code: string; description: string }) => {
    setSelectedCategory(category);
    setLoading(true);
    try {
      const dateStr = selectedWeekDate.toISOString().split('T')[0];
      const data = await productRepo.getByCategoryCode(category.code, dateStr);
      setProducts(data);
      setStep('PRODUCT');
    } catch (error) {
      console.error("Error fetching products for category:", error);
    } finally {
      setLoading(false);
    }
  };

  // Recargar productos si cambia la fecha seleccionada y estamos en el paso PRODUCT
  useEffect(() => {
    if (step !== 'PRODUCT' || !selectedCategory) return;
    const refetchProducts = async () => {
      setLoading(true);
      try {
        const dateStr = selectedWeekDate.toISOString().split('T')[0];
        const data = await productRepo.getByCategoryCode(selectedCategory.code, dateStr);
        setProducts(data);
      } catch (error) {
        console.error("Error refetching products for category on week change:", error);
      } finally {
        setLoading(false);
      }
    };
    refetchProducts();
  }, [selectedWeekDate, step, selectedCategory]);

  const mapSchedules = (data: Schedule[]): MobileSchedule[] => {
    return (data || []).map((s: any) => {
      const fromD = new Date(s.fromDate);
      const toD = new Date(s.toDate);
      
      const agendaDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
      const mappedDayCode = agendaDays[fromD.getDay() === 0 ? 6 : fromD.getDay() - 1];

      const fromTime = `${fromD.getHours().toString().padStart(2, '0')}:${fromD.getMinutes().toString().padStart(2, '0')}`;
      const toTime = `${toD.getHours().toString().padStart(2, '0')}:${toD.getMinutes().toString().padStart(2, '0')}`;

      return {
        ...s,
        dayCode: mappedDayCode,
        fromTime,
        toTime
      };
    });
  };

  // Carga de horarios o colaboradores al seleccionar producto
  const handleProductSelect = async (product: CommercialProduct) => {
    setSelectedProduct(product);
    setLoading(true);
    
    const planSchedule = product.planScheduleCode?.toUpperCase();
    const isPlanScheduleYes = planSchedule === 'YES' || planSchedule === 'Y';
    const scheduleTypeCode = product.scheduleTypeCode?.toLowerCase();

    try {
      if (isPlanScheduleYes) {
        if (scheduleTypeCode === 'close') {
          // Open Collaborator view
          const data = await collaboratorRepo.getByCommercialProductId(product.id);
          setCollaborators(data);
          setStep('VENDOR');
        } else { // open
          // Open Schedule turning off constant to admit new record in any date and time
          setAdmitNewRecordAnyTime(false);
          setUseCustomSchedule(false);
          const data = await scheduleRepo.getByCommercialProductId(product.id);
          setSchedules(mapSchedules(data));
          setStep('SCHEDULE');
        }
      } else { // NO
        // Open Schedule turning on constant to admit new record in any date and time
        setAdmitNewRecordAnyTime(true);
        setUseCustomSchedule(false);
        const data = await scheduleRepo.getByCommercialProductId(product.id);
        setSchedules(mapSchedules(data));
        setStep('SCHEDULE');
      }
    } catch (error) {
      console.error("Error fetching schedules/collaborators:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCollaboratorSelect = async (collaborator: Collaborator) => {
    setSelectedCollaborator(collaborator);
    setLoading(true);
    try {
      const data = await scheduleRepo.getByCollaboratorId(collaborator.id);
      setSchedules(mapSchedules(data));
      setStep('SCHEDULE');
    } catch (error) {
      console.error("Error fetching schedules for collaborator:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomScheduleSubmit = () => {
    const fromTime = customTime.split(' - ')[0] || '10:00';
    const toTime = customTime.split(' - ')[1] || '11:00';
    const mockSchedule: MobileSchedule = {
      id: 'custom',
      fromDate: `${customDate}T${fromTime}:00`,
      toDate: `${customDate}T${toTime}:00`,
      fromTime,
      toTime,
      dayCode: new Date(customDate).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      status: 'ACTIVE',
      commercialProductId: selectedProduct?.id || '',
      employeeId: selectedCollaborator?.id || '',
    } as any;
    setSelectedSchedule(mockSchedule);
    setStep('CONFIRM');
  };

  const handleBack = () => {
    if (step === 'CONFIRM') {
      setStep('SCHEDULE');
    } else if (step === 'SCHEDULE') {
      const planSchedule = selectedProduct?.planScheduleCode?.toUpperCase();
      const isPlanScheduleYes = planSchedule === 'YES' || planSchedule === 'Y';
      const scheduleTypeCode = selectedProduct?.scheduleTypeCode?.toLowerCase();
      if (isPlanScheduleYes && scheduleTypeCode === 'close') {
        setStep('VENDOR');
      } else {
        setStep('PRODUCT');
      }
    } else if (step === 'VENDOR') {
      setStep('PRODUCT');
    } else if (step === 'PRODUCT') {
      setStep('CATEGORY');
    } else {
      onBack();
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
      {['CATEGORY', 'PRODUCT', 'SCHEDULE', 'CONFIRM'].map((s, idx) => (
        <View key={s} style={styles.stepWrapper}>
          <View style={[
            styles.stepCircle, 
            step === s && styles.stepActive,
            idx < ['CATEGORY', 'PRODUCT', 'SCHEDULE', 'CONFIRM'].indexOf(step) && styles.stepCompleted
          ]}>
            {idx < ['CATEGORY', 'PRODUCT', 'SCHEDULE', 'CONFIRM'].indexOf(step) ? (
              <Ionicons name="checkmark" size={16} color="#fff" />
            ) : (
              <Text style={styles.stepNumber}>{idx + 1}</Text>
            )}
          </View>
          {idx < 3 && <View style={styles.stepLine} />}
        </View>
      ))}
    </View>
  );

  const getWeekRangeLabel = (date: Date) => {
    const base = new Date(date);
    const day = base.getDay();
    const diff = base.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(base.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return `${monday.toLocaleDateString(undefined, options)} - ${sunday.toLocaleDateString(undefined, options)}`;
  };

  const renderWeekSelector = () => {
    if (step === 'CONFIRM') return null;

    const isEditable = step === 'CATEGORY' || step === 'PRODUCT';

    return (
      <View style={[styles.wizardWeekSelector, !isEditable && styles.wizardWeekSelectorDisabled]}>
        <TouchableOpacity 
          style={[styles.wizardWeekButton, !isEditable && styles.disabledButton]}
          disabled={!isEditable}
          onPress={() => {
            const prev = new Date(selectedWeekDate);
            prev.setDate(selectedWeekDate.getDate() - 7);
            setSelectedWeekDate(prev);
          }}
        >
          <Ionicons name="chevron-back" size={18} color={isEditable ? Colors.primary : Colors.muted} />
        </TouchableOpacity>

        <View style={styles.wizardWeekLabelContainer}>
          <Ionicons name="calendar-outline" size={16} color={Colors.muted} />
          <Text style={[styles.wizardWeekLabel, !isEditable && styles.disabledText]}>
            Semana: {getWeekRangeLabel(selectedWeekDate)}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.wizardWeekButton, !isEditable && styles.disabledButton]}
          disabled={!isEditable}
          onPress={() => {
            const next = new Date(selectedWeekDate);
            next.setDate(selectedWeekDate.getDate() + 7);
            setSelectedWeekDate(next);
          }}
        >
          <Ionicons name="chevron-forward" size={18} color={isEditable ? Colors.primary : Colors.muted} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderCategoryStep = () => (
    <View style={styles.scroll}>
      <Text style={styles.sectionTitle}>{t(CUSTOMER_SERVICE_CONSTANTS.SELECT_CATEGORY)}</Text>
      {categories.map(category => (
        <TouchableOpacity 
          key={category.code} 
          style={styles.productCard}
          onPress={() => handleCategorySelect(category)}
        >
          <View style={styles.productIcon}>
            <Ionicons name="pricetag-outline" size={24} color={Colors.primary} />
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{category.description}</Text>
            <Text style={styles.productDesc} numberOfLines={1}>{category.code}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderProductStep = () => (
    <View style={styles.scroll}>
      <Text style={styles.sectionTitle}>{t(CUSTOMER_SERVICE_CONSTANTS.SELECT_PRODUCT)}</Text>
      {products.map(product => (
        <TouchableOpacity 
          key={product.id} 
          style={styles.productCard}
          onPress={() => handleProductSelect(product)}
        >
          <View style={styles.productIcon}>
            <Ionicons name="briefcase-outline" size={24} color={Colors.primary} />
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productDesc} numberOfLines={1}>{product.description}</Text>
          </View>
          <Text style={styles.productPrice}>${product.totalCost}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderVendorStep = () => (
    <View style={styles.scroll}>
      <Text style={styles.sectionTitle}>{t(CUSTOMER_SERVICE_CONSTANTS.SELECT_VENDOR, 'Select Collaborator')}</Text>
      {collaborators.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color={Colors.muted} />
          <Text style={styles.emptyText}>No hay profesionales disponibles</Text>
        </View>
      ) : (
        collaborators.map(collab => (
          <TouchableOpacity 
            key={collab.id} 
            style={[styles.productCard, selectedCollaborator?.id === collab.id && styles.selectedCard]}
            onPress={() => handleCollaboratorSelect(collab)}
          >
            <View style={styles.productIcon}>
              <Ionicons name="person-outline" size={24} color={Colors.primary} />
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{getCollaboratorName(collab.employeeId)}</Text>
              <Text style={styles.productDesc} numberOfLines={1}>Colaborador</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderScheduleStep = () => (
    <View style={styles.scroll}>
      <Text style={styles.sectionTitle}>{t(CUSTOMER_SERVICE_CONSTANTS.SELECT_SCHEDULE)}</Text>
      
      {!useCustomSchedule && filteredSchedules.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color={Colors.muted} />
          <Text style={styles.emptyText}>No hay horarios disponibles para esta semana</Text>
        </View>
      )}

      {!useCustomSchedule && filteredSchedules.length > 0 && filteredSchedules.map(item => (
        <TouchableOpacity 
          key={item.id} 
          style={[styles.scheduleCard, selectedSchedule?.id === item.id && !useCustomSchedule && styles.selectedCard]}
          onPress={() => {
            setSelectedSchedule(item);
            setUseCustomSchedule(false);
          }}
        >
          <View style={styles.scheduleTime}>
            <Text style={styles.timeText}>{item.fromTime} - {item.toTime}</Text>
            <Text style={styles.dayText}>
              {new Date(item.fromDate).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
          </View>
          <Ionicons 
            name={selectedSchedule?.id === item.id && !useCustomSchedule ? "radio-button-on" : "radio-button-off"} 
            size={24} 
            color={selectedSchedule?.id === item.id && !useCustomSchedule ? Colors.primary : Colors.muted} 
          />
        </TouchableOpacity>
      ))}

      {admitNewRecordAnyTime && (
        <View style={styles.customScheduleContainer}>
          <TouchableOpacity 
            style={[styles.scheduleCard, useCustomSchedule && styles.selectedCard]}
            onPress={() => {
              setUseCustomSchedule(true);
              setSelectedSchedule(null);
            }}
          >
            <View style={styles.scheduleTime}>
              <Text style={styles.timeText}>Agregar horario personalizado</Text>
              <Text style={styles.dayText}>Cualquier fecha y hora</Text>
            </View>
            <Ionicons 
              name={useCustomSchedule ? "radio-button-on" : "radio-button-off"} 
              size={24} 
              color={useCustomSchedule ? Colors.primary : Colors.muted} 
            />
          </TouchableOpacity>

          {useCustomSchedule && (
            <View style={styles.customForm}>
              <Text style={styles.formLabel}>Fecha (AAAA-MM-DD):</Text>
              <TextInput 
                style={styles.textInput}
                value={customDate}
                onChangeText={setCustomDate}
                placeholder="2026-06-06"
                placeholderTextColor={Colors.muted}
              />
              <Text style={styles.formLabel}>Horario (HH:MM - HH:MM):</Text>
              <TextInput 
                style={styles.textInput}
                value={customTime}
                onChangeText={setCustomTime}
                placeholder="10:00 - 11:00"
                placeholderTextColor={Colors.muted}
              />
              <TouchableOpacity style={styles.nextButton} onPress={handleCustomScheduleSubmit}>
                <Text style={styles.nextButtonText}>Continuar con personalizado</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      
      {selectedSchedule && !useCustomSchedule && (
        <TouchableOpacity style={styles.nextButton} onPress={() => setStep('CONFIRM')}>
          <Text style={styles.nextButtonText}>Continuar</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const handleConfirmAppointment = async () => {
    if (selectedSchedule && selectedSchedule.id !== 'custom') {
      setLoading(true);
      try {
        await scheduleRepo.transitionNext(selectedSchedule.id);
        alert(t('crm.customer_service.success_message') || '¡Cita agendada con éxito!');
        onBack();
      } catch (error) {
        console.error("Error transitioning schedule:", error);
        alert(t('crm.customer_service.error_message') || 'Error al agendar la cita');
      } finally {
        setLoading(false);
      }
    } else {
      alert(t('crm.customer_service.success_message') || '¡Cita agendada con éxito!');
      onBack();
    }
  };

  const renderConfirmStep = () => (
    <View style={styles.confirmContainer}>
      <View style={styles.confirmCard}>
        <Ionicons name="checkmark-circle" size={64} color={Colors.success} style={{ alignSelf: 'center', marginBottom: 20 }} />
        <Text style={styles.confirmTitle}>Resumen de la Cita</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Servicio:</Text>
          <Text style={styles.detailValue}>{selectedProduct?.name}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Horario:</Text>
          <Text style={styles.detailValue}>{selectedSchedule?.dayCode} {selectedSchedule?.fromTime}</Text>
        </View>
 
        <TouchableOpacity style={styles.finishButton} onPress={handleConfirmAppointment}>
          <Text style={styles.finishButtonText}>{t(CUSTOMER_SERVICE_CONSTANTS.CONFIRM_APPOINTMENT)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <MainLayout headerTitle={t(CUSTOMER_SERVICE_CONSTANTS.TITLE)}>
      <TouchableOpacity style={styles.backLink} onPress={handleBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.muted} />
        <Text style={styles.backLinkText}>Volver</Text>
      </TouchableOpacity>

      {renderStepIndicator()}
      {renderWeekSelector()}
      
      {loading || !vendorId ? (
        <View style={styles.loader}>
          {!vendorId ? (
            <>
              <Ionicons name="alert-circle-outline" size={48} color={Colors.destructive} />
              <Text style={{color: Colors.destructive, marginTop: Spacing.md, textAlign: 'center'}}>
                La sesión no está completamente configurada (Vendor ID faltante).
              </Text>
            </>
          ) : (
            <ActivityIndicator size="large" color={Colors.primary} />
          )}
        </View>
      ) : (
        <>
          {step === 'CATEGORY' && renderCategoryStep()}
          {step === 'PRODUCT' && renderProductStep()}
          {step === 'VENDOR' && renderVendorStep()}
          {step === 'SCHEDULE' && renderScheduleStep()}
          {step === 'CONFIRM' && renderConfirmStep()}
        </>
      )}
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    marginBottom: Spacing.md,
  },
  stepWrapper: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  stepActive: { borderColor: Colors.primary, backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  stepCompleted: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stepNumber: { color: Colors.muted, fontWeight: 'bold' },
  stepLine: { width: 40, height: 2, backgroundColor: Colors.border, marginHorizontal: 8 },
  
  scroll: { flex: 1 },
  sectionTitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  productInfo: { flex: 1 },
  productName: { color: Colors.foreground, fontSize: Typography.sizes.md, fontWeight: 'bold' },
  productDesc: { color: Colors.muted, fontSize: Typography.sizes.sm },
  productPrice: { color: Colors.primary, fontWeight: 'bold', fontSize: Typography.sizes.md },

  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    borderRadius: 16,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedCard: { borderColor: Colors.primary, backgroundColor: 'rgba(16, 185, 129, 0.05)' },
  scheduleTime: { flex: 1 },
  timeText: { color: Colors.foreground, fontSize: Typography.sizes.lg, fontWeight: 'bold' },
  dayText: { color: Colors.muted, fontSize: Typography.sizes.sm, textTransform: 'uppercase' },

  nextButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  nextButtonText: { color: Colors.sidebar, fontWeight: 'bold', fontSize: Typography.sizes.md },

  confirmContainer: { flex: 1, justifyContent: 'center' },
  confirmCard: {
    backgroundColor: Colors.card,
    padding: Spacing.xl,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  confirmTitle: { 
    color: Colors.foreground, 
    fontSize: Typography.sizes.xl, 
    fontWeight: 'bold', 
    textAlign: 'center',
    marginBottom: 24 
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: { color: Colors.muted, fontSize: Typography.sizes.md },
  detailValue: { color: Colors.foreground, fontSize: Typography.sizes.md, fontWeight: 'bold' },
  finishButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  finishButtonText: { color: Colors.sidebar, fontWeight: 'bold', fontSize: Typography.sizes.md },
  
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: Colors.muted, marginTop: 12 },

  customScheduleContainer: {
    marginTop: Spacing.md,
  },
  customForm: {
    backgroundColor: Colors.sidebar,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  formLabel: {
    color: Colors.foreground,
    fontSize: Typography.sizes.sm,
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: Colors.card,
    color: Colors.foreground,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: Typography.sizes.md,
  },
  wizardWeekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  wizardWeekButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  wizardWeekLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wizardWeekLabel: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: 'bold',
  },
  wizardWeekSelectorDisabled: {
    opacity: 0.7,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  disabledButton: {
    opacity: 0.3,
  },
  disabledText: {
    color: Colors.muted,
  },
});
