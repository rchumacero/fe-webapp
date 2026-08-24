import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { useTranslation } from '@kplian/i18n';
import { MainLayout } from '../../../../shared/layout/MainLayout';
import { Colors, Spacing, Typography } from '../../../../shared/theme/constants';
import { StructureVendorRepositoryImpl, StructureRepositoryImpl, createApiClient } from '@kplian/infrastructure';
import { StructureVendor, Structure } from '@kplian/core';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useVendor } from '../../../../shared/auth/AuthContext';

const structureVendorRepo = new StructureVendorRepositoryImpl();
const structureRepo = new StructureRepositoryImpl();
const crmApi = createApiClient('crm');

interface ParameterStructureVendorScreenProps {
  onBack: () => void;
  onNavigate?: (route: string) => void;
}

export default function ParameterStructureVendorScreen({ onBack, onNavigate }: ParameterStructureVendorScreenProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { vendor: vendorId } = useVendor();

  const [structures, setStructures] = useState<Structure[]>([]);
  const [structureVendors, setStructureVendors] = useState<StructureVendor[]>([]);
  const [currentParentId, setCurrentParentId] = useState<string | number | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Structure[]>([]);
  const [loading, setLoading] = useState(false);

  // CRM Persons State
  const [persons, setPersons] = useState<any[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
  const [selectedPersonCode, setSelectedPersonCode] = useState<string>('');
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPersons = useCallback(async () => {
    try {
      let data: any[] = [];
      if (vendorId) {
        const response = await crmApi.get<any>(`/v1/persons/by-vendor-id/${vendorId}`);
        const resData = response.data;
        data = Array.isArray(resData) ? resData : resData.data || resData.content || resData.results || [];
      } else {
        const response = await crmApi.get<any>('/v1/persons');
        const resData = response.data;
        data = Array.isArray(resData) ? resData : resData.data || resData.content || resData.results || [];
      }
      setPersons(data);

      // Default selected person to active user matching code or first person
      const userCode = user?.username || user?.email || 'rodrychm@gmail.com';
      const match = data.find((p: any) => p.code === userCode || p.email === userCode);
      if (match) {
        setSelectedPerson(match);
        setSelectedPersonCode(match.code);
      } else if (data.length > 0) {
        setSelectedPerson(data[0]);
        setSelectedPersonCode(data[0].code);
      } else {
        setSelectedPersonCode(userCode);
      }
    } catch (error) {
      console.error('Error fetching CRM persons:', error);
      const userCode = user?.username || user?.email || 'rodrychm@gmail.com';
      setSelectedPersonCode(userCode);
    }
  }, [vendorId, user]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const structData = await structureRepo.getAll();
      setStructures(structData || []);

      const vendorsData = await structureVendorRepo.getAll();
      setStructureVendors(vendorsData || []);
    } catch (error) {
      console.error('Error loading structures or vendors relations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPersons();
    fetchData();
  }, [fetchPersons, fetchData]);

  // Current level structures (folders)
  const currentStructures = structures.filter(s => s.parentId === currentParentId);

  const handleStructureClick = (structure: Structure) => {
    setBreadcrumbs(prev => [...prev, structure]);
    setCurrentParentId(structure.id);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setBreadcrumbs([]);
      setCurrentParentId(null);
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      const target = breadcrumbs[index];
      setBreadcrumbs(newBreadcrumbs);
      setCurrentParentId(target.id);
    }
  };

  // Toggle Structure-Vendor relationship
  const handleToggleRelation = async (structureId: number | string) => {
    if (!selectedPersonCode) {
      Alert.alert('Error', 'Debe seleccionar un proveedor.');
      return;
    }
    setLoading(true);
    try {
      const existing = structureVendors.find(
        sv => sv.structureId === structureId && sv.vendorCode === selectedPersonCode
      );

      if (existing) {
        console.log(`[API Request] DELETE /parameter/api/structure-vendor/${existing.id}`);
        await structureVendorRepo.delete(existing.id);
        Alert.alert('Éxito', 'Relación de proveedor eliminada.');
      } else {
        const payload = {
          structureId,
          vendorCode: selectedPersonCode,
          status: 'active'
        };
        console.log('[API Request] POST /parameter/api/structure-vendor', payload);
        await structureVendorRepo.create(payload);
        Alert.alert('Éxito', 'Relación de proveedor asignada.');
      }
      
      const vendorsData = await structureVendorRepo.getAll();
      setStructureVendors(vendorsData || []);
    } catch (error: any) {
      console.error('Error toggling structure-vendor relation:', error);
      Alert.alert('Error', 'No se pudo cambiar la asignación de la estructura.');
    } finally {
      setLoading(false);
    }
  };

  // Filter persons list by search query
  const filteredPersons = useMemo(() => {
    if (!searchQuery.trim()) return persons;
    return persons.filter(p => {
      const name = (p.completeName || `${p.name1 ?? ''} ${p.surname1 ?? ''}`).toLowerCase();
      const code = (p.code || '').toLowerCase();
      const query = searchQuery.toLowerCase();
      return name.includes(query) || code.includes(query);
    });
  }, [persons, searchQuery]);

  const handleSelectPerson = (person: any) => {
    setSelectedPerson(person);
    setSelectedPersonCode(person.code);
    setShowPersonModal(false);
  };

  return (
    <MainLayout headerTitle="Estructuras por Proveedor" onNavigate={onNavigate}>
      {/* Back button */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity style={styles.backLink} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={Colors.muted} />
          <Text style={styles.backLinkText}>Volver</Text>
        </TouchableOpacity>
      </View>

      {/* Vendor dropdown selector */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Seleccionar Proveedor:</Text>
        <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowPersonModal(true)}>
          <Text style={styles.dropdownButtonText}>
            {selectedPerson ? (selectedPerson.completeName || `${selectedPerson.name1 ?? ''} ${selectedPerson.surname1 ?? ''}`.trim() || selectedPerson.code) : selectedPersonCode || 'Cargando proveedor...'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={Colors.muted} />
        </TouchableOpacity>
      </View>

      {/* Breadcrumbs */}
      <View style={styles.breadcrumbContainer}>
        <TouchableOpacity onPress={() => handleBreadcrumbClick(-1)}>
          <Text style={[styles.breadcrumbText, breadcrumbs.length === 0 && styles.activeBreadcrumb]}>
            Root
          </Text>
        </TouchableOpacity>
        {breadcrumbs.map((crumb, idx) => (
          <View key={crumb.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="chevron-forward" size={12} color={Colors.muted} style={{ marginHorizontal: 4 }} />
            <TouchableOpacity onPress={() => handleBreadcrumbClick(idx)}>
              <Text style={[styles.breadcrumbText, idx === breadcrumbs.length - 1 && styles.activeBreadcrumb]}>
                {crumb.name}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {loading && currentStructures.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.scroll}>
          {currentStructures.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={48} color={Colors.muted} />
              <Text style={styles.emptyText}>No hay carpetas en este nivel.</Text>
            </View>
          ) : (
            <View style={{ gap: Spacing.sm }}>
              {currentStructures.map(structure => {
                const isChecked = structureVendors.some(
                  sv => sv.structureId === structure.id && sv.vendorCode === selectedPersonCode
                );

                return (
                  <View key={structure.id} style={styles.card}>
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => handleToggleRelation(structure.id)}
                    >
                      <Ionicons
                        name={isChecked ? "checkbox" : "square-outline"}
                        size={24}
                        color={isChecked ? Colors.primary : Colors.muted}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cardContent}
                      onPress={() => handleStructureClick(structure)}
                    >
                      <View style={styles.iconWrapper}>
                        <Ionicons name="folder" size={24} color={Colors.primary} />
                      </View>
                      
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{structure.name}</Text>
                        <Text style={styles.cardSubtitle}>{structure.code}</Text>
                      </View>
                      
                      <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* Person Selection Modal */}
      <Modal
        visible={showPersonModal}
        animationType="slide"
        onRequestClose={() => setShowPersonModal(false)}
      >
        <View style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPersonModal(false)}>
              <Ionicons name="close" size={28} color={Colors.muted} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Seleccionar Proveedor</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Search Input */}
          <View style={{ padding: Spacing.md }}>
            <TextInput
              style={styles.textInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por nombre o código..."
              placeholderTextColor={Colors.muted}
            />
          </View>

          <ScrollView style={{ flex: 1, paddingHorizontal: Spacing.md }}>
            {filteredPersons.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color={Colors.muted} />
                <Text style={styles.emptyText}>No se encontraron personas.</Text>
              </View>
            ) : (
              filteredPersons.map(p => {
                const name = p.completeName || `${p.name1 ?? ''} ${p.surname1 ?? ''}`.trim() || p.code;
                const isSelected = selectedPersonCode === p.code;
                return (
                  <TouchableOpacity
                    key={p.id || p.code}
                    style={[styles.selectorItem, isSelected && styles.selectedSelectorItem]}
                    onPress={() => handleSelectPerson(p)}
                  >
                    <Ionicons
                      name={isSelected ? "radio-button-on" : "radio-button-off"}
                      size={18}
                      color={isSelected ? Colors.primary : Colors.muted}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.selectorItemText, isSelected && styles.selectedSelectorItemText]}>
                        {name}
                      </Text>
                      <Text style={{ color: Colors.muted, fontSize: Typography.sizes.xs }}>
                        Código: {p.code}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </Modal>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backLinkText: {
    color: Colors.muted,
    fontSize: Typography.sizes.md,
    fontWeight: 'medium',
  },
  dropdownContainer: {
    marginTop: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dropdownLabel: {
    color: Colors.muted,
    fontSize: Typography.sizes.xs,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  dropdownButtonText: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: 'bold',
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  breadcrumbText: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
  },
  activeBreadcrumb: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkboxContainer: {
    paddingRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  cardTitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
    marginTop: 2,
  },
  // Modal layout
  modalRoot: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 40,
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
  modalHeaderTitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
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
  },
  selectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  selectedSelectorItem: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  selectorItemText: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: 'bold',
  },
  selectedSelectorItemText: {
    color: Colors.primary,
  },
});
