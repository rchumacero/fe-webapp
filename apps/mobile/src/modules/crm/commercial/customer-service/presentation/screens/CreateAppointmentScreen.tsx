import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useTranslation } from '@kplian/i18n';
import { MainLayout } from '../../../../../../shared/layout/MainLayout';
import { Colors, Spacing, Typography } from '../../../../../../shared/theme/constants';
import { 
  CommercialProductRepositoryImpl, 
  ScheduleRepositoryImpl,
} from '@kplian/infrastructure';
import { 
  CommercialProduct, 
  Schedule 
} from '@kplian/core';
import { CUSTOMER_SERVICE_CONSTANTS } from '../../constants/customer-service-constants';
import { Ionicons } from '@expo/vector-icons';
import { useVendor } from '../../../../../../shared/auth/AuthContext';

// Repositorios
const productRepo = new CommercialProductRepositoryImpl();
const scheduleRepo = new ScheduleRepositoryImpl();

type WizardStep = 'PRODUCT' | 'VENDOR' | 'SCHEDULE' | 'CONFIRM';

export default function CreateAppointmentScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { vendor: vendorId } = useVendor();
  
  const [step, setStep] = useState<WizardStep>('PRODUCT');
  const [loading, setLoading] = useState(false);
  
  // Datos de selección
  const [products, setProducts] = useState<CommercialProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CommercialProduct | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  // Carga inicial de productos
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await productRepo.getAll();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Carga de horarios al seleccionar producto
  const handleProductSelect = async (product: CommercialProduct) => {
    setSelectedProduct(product);
    setLoading(true);
    try {
      const data = await scheduleRepo.getByCommercialProductId(product.id);
      setSchedules(data);
      setStep('SCHEDULE'); // Saltamos a Schedule por ahora, ya que Vendor depende de tu lógica de Personas
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
      {['PRODUCT', 'SCHEDULE', 'CONFIRM'].map((s, idx) => (
        <View key={s} style={styles.stepWrapper}>
          <View style={[
            styles.stepCircle, 
            step === s && styles.stepActive,
            idx < ['PRODUCT', 'SCHEDULE', 'CONFIRM'].indexOf(step) && styles.stepCompleted
          ]}>
            {idx < ['PRODUCT', 'SCHEDULE', 'CONFIRM'].indexOf(step) ? (
              <Ionicons name="checkmark" size={16} color="#fff" />
            ) : (
              <Text style={styles.stepNumber}>{idx + 1}</Text>
            )}
          </View>
          {idx < 2 && <View style={styles.stepLine} />}
        </View>
      ))}
    </View>
  );

  const renderProductStep = () => (
    <ScrollView style={styles.scroll}>
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
    </ScrollView>
  );

  const renderScheduleStep = () => (
    <ScrollView style={styles.scroll}>
      <Text style={styles.sectionTitle}>{t(CUSTOMER_SERVICE_CONSTANTS.SELECT_SCHEDULE)}</Text>
      {schedules.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color={Colors.muted} />
          <Text style={styles.emptyText}>No hay horarios disponibles</Text>
        </View>
      ) : (
        schedules.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.scheduleCard, selectedSchedule?.id === item.id && styles.selectedCard]}
            onPress={() => setSelectedSchedule(item)}
          >
            <View style={styles.scheduleTime}>
              <Text style={styles.timeText}>{item.fromTime} - {item.toTime}</Text>
              <Text style={styles.dayText}>{item.dayCode}</Text>
            </View>
            <Ionicons 
              name={selectedSchedule?.id === item.id ? "radio-button-on" : "radio-button-off"} 
              size={24} 
              color={selectedSchedule?.id === item.id ? Colors.primary : Colors.muted} 
            />
          </TouchableOpacity>
        ))
      )}
      
      {selectedSchedule && (
        <TouchableOpacity style={styles.nextButton} onPress={() => setStep('CONFIRM')}>
          <Text style={styles.nextButtonText}>Continuar</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

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

        <TouchableOpacity style={styles.finishButton} onPress={() => alert('Cita Registrada')}>
          <Text style={styles.finishButtonText}>{t(CUSTOMER_SERVICE_CONSTANTS.CONFIRM_APPOINTMENT)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <MainLayout headerTitle={t(CUSTOMER_SERVICE_CONSTANTS.TITLE)}>
      <TouchableOpacity style={styles.backLink} onPress={onBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.muted} />
        <Text style={styles.backLinkText}>Volver</Text>
      </TouchableOpacity>

      {renderStepIndicator()}
      
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <>
          {step === 'PRODUCT' && renderProductStep()}
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
});
