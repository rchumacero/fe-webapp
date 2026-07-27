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
  Alert
} from 'react-native';
import { useTranslation } from '@kplian/i18n';
import { MainLayout } from '../../../../shared/layout/MainLayout';
import { Colors, Spacing, Typography } from '../../../../shared/theme/constants';
import {
  ParameterRepositoryImpl,
  StructureVendorRepositoryImpl,
  VariableRepositoryImpl,
  ParameterValueRepositoryImpl
} from '@kplian/infrastructure';
import { Parameter, Variable } from '@kplian/core';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../../shared/auth/AuthContext';

const parameterRepo = new ParameterRepositoryImpl();
const structureVendorRepo = new StructureVendorRepositoryImpl();
const variableRepo = new VariableRepositoryImpl();
const parameterValueRepo = new ParameterValueRepositoryImpl();

interface ParameterCRMValuesScreenProps {
  onBack: () => void;
  onNavigate?: (route: string) => void;
}

export default function ParameterCRMValuesScreen({ onBack, onNavigate }: ParameterCRMValuesScreenProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userCode = user?.username || user?.email || 'rodrychm@gmail.com';

  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Selection/Values details modal states
  const [selectedParam, setSelectedParam] = useState<Parameter | null>(null);
  const [showValuesModal, setShowValuesModal] = useState(false);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [transposedRows, setTransposedRows] = useState<any[]>([]);

  // CRUD states inside modal
  const [isValuesFormActive, setIsValuesFormActive] = useState(false);
  const [valuesModalMode, setValuesModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedRowNumber, setSelectedRowNumber] = useState<number | null>(null);
  const [valuesFormFields, setValuesFormFields] = useState<Record<string | number, string>>({});

  const fetchAllowedParameters = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Get all structure vendor relationships for this vendor
      const allRelations = await structureVendorRepo.getAll();
      const allowedStructureIds = allRelations
        .filter(sv => sv.vendorCode === userCode && sv.status?.toLowerCase() === 'active')
        .map(sv => sv.structureId);

      // 2. Fetch all parameters and filter by allowed structures
      const allParams = await parameterRepo.getAll();
      const filtered = allParams.filter(p => allowedStructureIds.includes(p.structureId));
      setParameters(filtered);
    } catch (error) {
      console.error('Error fetching allowed parameters:', error);
      Alert.alert('Error', 'No se pudieron cargar los parámetros autorizados.');
    } finally {
      setLoading(false);
    }
  }, [userCode]);

  useEffect(() => {
    fetchAllowedParameters();
  }, [fetchAllowedParameters]);

  const handleParamClick = async (param: Parameter) => {
    setSelectedParam(param);
    setLoading(true);
    try {
      // Load variables
      const vars = await variableRepo.getByParameterId(param.id);
      setVariables(vars || []);

      // Load transposed values filtered by userCode
      const batchData = (await parameterValueRepo.getTransposedBatch(param.fullCode, userCode)) as any;
      
      let rows: any[] = [];
      if (Array.isArray(batchData)) {
        rows = batchData;
      } else if (batchData && typeof batchData === 'object') {
        if (Array.isArray(batchData[param.fullCode])) {
          rows = batchData[param.fullCode];
        } else {
          const values = Object.values(batchData);
          if (values.length > 0 && Array.isArray(values[0])) {
            rows = values[0] as any[];
          }
        }
      }
      setTransposedRows(rows);
      setIsValuesFormActive(false);
      setShowValuesModal(true);
    } catch (error) {
      console.error('Error loading transposed variables and values:', error);
      Alert.alert('Error', 'No se pudieron cargar los valores del parámetro.');
    } finally {
      setLoading(false);
    }
  };

  const handleReloadTransposedValues = async (param: Parameter) => {
    try {
      const batchData = (await parameterValueRepo.getTransposedBatch(param.fullCode, userCode)) as any;
      let rows: any[] = [];
      if (Array.isArray(batchData)) {
        rows = batchData;
      } else if (batchData && typeof batchData === 'object') {
        if (Array.isArray(batchData[param.fullCode])) {
          rows = batchData[param.fullCode];
        } else {
          const values = Object.values(batchData);
          if (values.length > 0 && Array.isArray(values[0])) {
            rows = values[0] as any[];
          }
        }
      }
      setTransposedRows(rows);
    } catch (error) {
      console.error('Error reloading transposed rows:', error);
    }
  };

  const openCreateValuesRowModal = () => {
    setValuesModalMode('create');
    setSelectedRowNumber(null);
    const initialFields: Record<string | number, string> = {};
    for (const v of variables) {
      initialFields[v.id] = '';
    }
    setValuesFormFields(initialFields);
    setIsValuesFormActive(true);
  };

  const openEditValuesRowModal = async (rowNum: number) => {
    setValuesModalMode('edit');
    setSelectedRowNumber(rowNum);
    setLoading(true);
    try {
      const fields: Record<string | number, string> = {};
      for (const v of variables) {
        const vals = await parameterValueRepo.getByVariableId(v.id);
        const match = vals.find(val => val.row === rowNum && val.vendorCode === userCode);
        fields[v.id] = match ? match.value : '';
      }
      setValuesFormFields(fields);
      setIsValuesFormActive(true);
    } catch (error) {
      console.error('Error preparing values edit form:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del registro.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveValuesRow = async () => {
    if (!selectedParam) return;
    setLoading(true);
    try {
      if (valuesModalMode === 'create') {
        const dataset = variables.map(v => ({
          [v.code]: valuesFormFields[v.id] || ""
        }));
        console.log('[API Request] POST /parameter/api/value/transpose', {
          parameterId: selectedParam.id,
          vendorCode: userCode,
          viewRoute: '/crm/parameter',
          dataset
        });
        await parameterValueRepo.createTransposedRow(String(selectedParam.id), userCode, dataset, "/crm/parameter");
        Alert.alert('Éxito', 'Registro creado correctamente.');
      } else if (valuesModalMode === 'edit' && selectedRowNumber !== null) {
        const rowObj: any = { row: selectedRowNumber };
        variables.forEach(v => {
          rowObj[v.code] = valuesFormFields[v.id] || "";
        });
        const dataset = [rowObj];
        console.log('[API Request] PUT /parameter/api/value/transpose', {
          parameterId: selectedParam.id,
          vendorCode: userCode,
          viewRoute: '/crm/parameter',
          dataset
        });
        await parameterValueRepo.updateTransposedRow(String(selectedParam.id), userCode, dataset, "/crm/parameter");
        Alert.alert('Éxito', 'Registro actualizado correctamente.');
      }

      setIsValuesFormActive(false);
      handleReloadTransposedValues(selectedParam);
    } catch (error: any) {
      console.error('Error saving transposed row:', error);
      Alert.alert('Error', 'No se pudieron guardar los valores.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteValuesRow = (rowNum: number) => {
    if (!selectedParam) return;
    Alert.alert(
      'Eliminar Registro',
      `¿Está seguro de que desea eliminar todos los valores de la fila ${rowNum}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              console.log(`[API Request] DELETE /parameter/api/value/transpose/${selectedParam.id}/${userCode}/${rowNum}`);
              await parameterValueRepo.deleteTransposedRow(String(selectedParam.id), userCode, rowNum);
              Alert.alert('Éxito', 'Registro eliminado correctamente.');
              handleReloadTransposedValues(selectedParam);
            } catch (error: any) {
              console.error('Error deleting values row:', error);
              Alert.alert('Error', 'No se pudo eliminar el registro.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <MainLayout headerTitle="Valores de Parámetros" onNavigate={onNavigate}>
      {/* Back link */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity style={styles.backLink} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={Colors.muted} />
          <Text style={styles.backLinkText}>Volver</Text>
        </TouchableOpacity>
      </View>

      {loading && parameters.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : parameters.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="settings-outline" size={48} color={Colors.muted} />
          <Text style={styles.emptyText}>No hay parámetros autorizados para su cuenta.</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll}>
          <View style={{ gap: Spacing.sm }}>
            {parameters.map(param => (
              <TouchableOpacity
                key={param.id}
                style={styles.card}
                onPress={() => handleParamClick(param)}
              >
                <View style={styles.iconWrapper}>
                  <Ionicons name="settings-outline" size={24} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.cardTitle}>{param.name}</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{param.type}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardSubtitle}>{param.fullCode}</Text>
                  {param.description && (
                    <Text style={styles.cardDescription}>{param.description}</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Values Details Modal */}
      <Modal
        visible={showValuesModal}
        animationType="slide"
        onRequestClose={() => {
          if (isValuesFormActive) {
            setIsValuesFormActive(false);
          } else {
            setShowValuesModal(false);
          }
        }}
      >
        <View style={styles.modalRoot}>
          {isValuesFormActive ? (
            /* Values Create/Edit Form */
            <>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setIsValuesFormActive(false)}>
                  <Ionicons name="close" size={28} color={Colors.muted} />
                </TouchableOpacity>
                <Text style={styles.modalHeaderTitle}>
                  {valuesModalMode === 'create' ? 'Agregar Fila' : 'Editar Fila'}
                </Text>
                <TouchableOpacity onPress={handleSaveValuesRow}>
                  <Text style={styles.saveText}>Guardar</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={{ padding: Spacing.lg }}>
                {variables.map(v => (
                  <View key={v.id}>
                    <Text style={styles.inputLabel}>{v.name} ({v.code})</Text>
                    <TextInput
                      style={styles.textInput}
                      value={valuesFormFields[v.id] || ''}
                      onChangeText={(txt) => setValuesFormFields(prev => ({ ...prev, [v.id]: txt }))}
                      placeholder={`Configure ${v.name}`}
                      placeholderTextColor={Colors.muted}
                    />
                  </View>
                ))}
              </ScrollView>
            </>
          ) : (
            /* Values List */
            <>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowValuesModal(false)}>
                  <Ionicons name="close" size={28} color={Colors.muted} />
                </TouchableOpacity>
                <Text style={styles.modalHeaderTitle}>Mis Registros</Text>
                {selectedParam && variables.length > 0 && (
                  <TouchableOpacity onPress={openCreateValuesRowModal}>
                    <Ionicons name="add" size={28} color={Colors.primary} />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView style={{ flex: 1, padding: Spacing.lg }}>
                <Text style={styles.modalSubtitle}>
                  Valores para: <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>{selectedParam?.name}</Text>
                </Text>

                {transposedRows.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="options-outline" size={48} color={Colors.muted} />
                    <Text style={styles.emptyText}>No tiene valores registrados.</Text>
                    {variables.length > 0 && (
                      <TouchableOpacity
                        style={[styles.addButton, { width: 'auto', paddingHorizontal: 16, marginTop: 12, flexDirection: 'row', gap: 6 }]}
                        onPress={openCreateValuesRowModal}
                      >
                        <Ionicons name="add" size={18} color="#fff" />
                        <Text style={{ color: '#fff', fontSize: Typography.sizes.sm, fontWeight: 'bold' }}>Agregar Registro</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  transposedRows.map((row, idx) => (
                    <View key={idx} style={styles.card}>
                      <View style={styles.iconWrapper}>
                        <Ionicons name="list-circle-outline" size={24} color={Colors.primary} />
                      </View>
                      
                      <View style={{ flex: 1, marginRight: Spacing.sm }}>
                        <Text style={styles.cardTitle}>Fila {row.row || (idx + 1)}</Text>
                        <Text style={styles.cardSubtitle} numberOfLines={2}>
                          {Object.entries(row)
                            .filter(([key]) => key !== 'row' && key !== 'vendorCode')
                            .map(([key, val]) => {
                              const v = variables.find(x => x.code === key);
                              const displayName = v ? v.name : key;
                              return `${displayName}: ${val}`;
                            })
                            .join(' | ')}
                        </Text>
                      </View>

                      <View style={styles.actionColumn}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => openEditValuesRowModal(row.row)}>
                          <Ionicons name="create-outline" size={20} color={Colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteValuesRow(row.row)}>
                          <Ionicons name="trash-outline" size={20} color={Colors.destructive} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </>
          )}
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
  addButton: {
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
    marginTop: Spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
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
  cardDescription: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
    marginTop: 4,
    opacity: 0.8,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: Colors.muted,
    fontSize: Typography.sizes.xs,
    fontWeight: 'bold',
  },
  actionColumn: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionButton: {
    padding: 6,
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
  modalSubtitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    marginBottom: Spacing.md,
  },
  saveText: {
    color: Colors.primary,
    fontSize: Typography.sizes.md,
    fontWeight: 'bold',
  },
  inputLabel: {
    color: Colors.foreground,
    fontSize: Typography.sizes.sm,
    fontWeight: 'bold',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
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
});
