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
  StructureRepositoryImpl,
  ParameterRepositoryImpl,
  StructureVendorRepositoryImpl,
  VariableRepositoryImpl,
  ParameterValueRepositoryImpl
} from '@kplian/infrastructure';
import { Structure, Parameter, Variable } from '@kplian/core';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../../shared/auth/AuthContext';

const structureRepo = new StructureRepositoryImpl();
const parameterRepo = new ParameterRepositoryImpl();
const structureVendorRepo = new StructureVendorRepositoryImpl();
const variableRepo = new VariableRepositoryImpl();
const parameterValueRepo = new ParameterValueRepositoryImpl();

interface ParameterCustomScreenProps {
  moduleCode: string;
  onBack: () => void;
  onNavigate?: (route: string) => void;
}

export default function ParameterCustomScreen({ moduleCode, onBack, onNavigate }: ParameterCustomScreenProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userCode = user?.username || user?.email || 'rodrychm@gmail.com';

  const [structures, setStructures] = useState<Structure[]>([]);
  const [currentParentId, setCurrentParentId] = useState<string | number | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Structure[]>([]);
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

  // 1. Fetch authorized structures for the moduleCode & userCode
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Get all structure-vendor relations to find allowed structure IDs
      const allRelations = await structureVendorRepo.getAll();
      const allowedStructureIds = allRelations
        .filter(sv => sv.vendorCode === userCode && sv.status?.toLowerCase() === 'active')
        .map(sv => sv.structureId);

      // Get all structures and filter by moduleCode and allowance
      const allStructures = await structureRepo.getAll();
      const filteredStructures = allStructures.filter(s => 
        s.moduleCode?.toLowerCase() === moduleCode?.toLowerCase() && 
        allowedStructureIds.includes(s.id)
      );

      setStructures(filteredStructures);
    } catch (error) {
      console.error('Error fetching parameterized structure data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos de las estructuras.');
    } finally {
      setLoading(false);
    }
  }, [moduleCode, userCode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Current level structures (folders)
  const currentStructures = structures.filter(s => s.parentId === currentParentId);

  // Fetch parameters under selected structure (folder)
  const fetchParameters = useCallback(async (structureId: string | number) => {
    setLoading(true);
    try {
      const data = await parameterRepo.getByStructureId(structureId);
      setParameters(data || []);
    } catch (error) {
      console.error('Error loading parameters:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStructureClick = (structure: Structure) => {
    setBreadcrumbs(prev => [...prev, structure]);
    setCurrentParentId(structure.id);
    setParameters([]);
    fetchParameters(structure.id);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setBreadcrumbs([]);
      setCurrentParentId(null);
      setParameters([]);
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      const target = breadcrumbs[index];
      setBreadcrumbs(newBreadcrumbs);
      setCurrentParentId(target.id);
      setParameters([]);
      fetchParameters(target.id);
    }
  };

  // Reload transposed values row details
  const reloadTransposedRows = async (fullCode: string) => {
    try {
      const batchData = await parameterValueRepo.getTransposedBatch(fullCode, userCode);
      const rows = (batchData && batchData[0] && batchData[0].values) ? batchData[0].values : [];
      setTransposedRows(rows);
    } catch (error) {
      console.error('Error reloading transposed rows:', error);
    }
  };

  const handleParamClick = async (param: Parameter) => {
    setSelectedParam(param);
    setLoading(true);
    try {
      // Load variables
      const vars = await variableRepo.getByParameterId(param.id);
      setVariables(vars || []);

      // Load transposed values filtered by userCode
      const batchData = await parameterValueRepo.getTransposedBatch(param.fullCode, userCode);
      const rows = (batchData && batchData[0] && batchData[0].values) ? batchData[0].values : [];
      setTransposedRows(rows);

      setShowValuesModal(true);
    } catch (error) {
      console.error('Error loading parameter values detail:', error);
      Alert.alert('Error', 'No se pudieron cargar los detalles del parámetro.');
    } finally {
      setLoading(false);
    }
  };

  // Prepare and open Values Creation Form
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

  // Prepare and open Values Edit Form
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

  // Create or Update Values Row
  const handleSaveValuesRow = async () => {
    if (!selectedParam) return;
    setLoading(true);
    try {
      const viewRoute = `/parameter/custom/${moduleCode}`;
      let dataset: any[] = [];

      if (valuesModalMode === 'create') {
        dataset = variables.map(v => ({
          [v.code]: valuesFormFields[v.id] || ""
        }));
        console.log(`[API Request] POST /value/transpose for ${selectedParam.id}`);
        await parameterValueRepo.createTransposedRow(String(selectedParam.id), userCode, dataset, viewRoute);
        Alert.alert('Éxito', 'Registro creado correctamente.');
      } else if (valuesModalMode === 'edit' && selectedRowNumber !== null) {
        const rowObj: any = { row: selectedRowNumber };
        variables.forEach(v => {
          rowObj[v.code] = valuesFormFields[v.id] || "";
        });
        dataset = [rowObj];
        console.log(`[API Request] PUT /value/transpose for ${selectedParam.id}`);
        await parameterValueRepo.updateTransposedRow(String(selectedParam.id), userCode, dataset, viewRoute);
        Alert.alert('Éxito', 'Registro actualizado correctamente.');
      }

      setIsValuesFormActive(false);
      setValuesModalMode(null);
      setSelectedRowNumber(null);
      await reloadTransposedRows(selectedParam.fullCode);
    } catch (error) {
      console.error('Error saving transposed row:', error);
      Alert.alert('Error', 'No se pudo guardar el registro.');
    } finally {
      setLoading(false);
    }
  };

  // Delete Transposed Values Row
  const handleDeleteValuesRow = (rowNum: number) => {
    if (!selectedParam) return;
    Alert.alert(
      'Eliminar Registro',
      '¿Está seguro de que desea eliminar este registro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              console.log(`[API Request] DELETE /value/transpose/${selectedParam.id}/${userCode}/${rowNum}`);
              await parameterValueRepo.deleteTransposedRow(String(selectedParam.id), userCode, rowNum);
              Alert.alert('Éxito', 'Registro eliminado correctamente.');
              await reloadTransposedRows(selectedParam.fullCode);
            } catch (error) {
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
    <MainLayout headerTitle={`${moduleCode.toUpperCase()} Parameters`} onNavigate={onNavigate}>
      {/* Back link */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingTop: Spacing.md }}>
        <TouchableOpacity style={styles.backLink} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={Colors.muted} style={{ marginRight: Spacing.xs }} />
          <Text style={styles.backLinkText}>Volver</Text>
        </TouchableOpacity>
      </View>
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {/* Breadcrumb Navigation Header */}
      <View style={styles.breadcrumbHeader}>
        <TouchableOpacity onPress={() => handleBreadcrumbClick(-1)}>
          <Text style={[styles.breadcrumbText, currentParentId === null && styles.breadcrumbActive]}>
            Root
          </Text>
        </TouchableOpacity>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.id}>
            <Text style={styles.breadcrumbSeparator}>/</Text>
            <TouchableOpacity onPress={() => handleBreadcrumbClick(idx)}>
              <Text style={[styles.breadcrumbText, idx === breadcrumbs.length - 1 && styles.breadcrumbActive]}>
                {crumb.name}
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>

      <ScrollView style={styles.container}>
        {/* Render Folder Nodes */}
        {currentStructures.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Carpetas</Text>
            {currentStructures.map(structure => (
              <TouchableOpacity
                key={structure.id}
                style={styles.card}
                onPress={() => handleStructureClick(structure)}
              >
                <View style={styles.folderRow}>
                  <Ionicons name="folder-outline" size={24} color={Colors.primary} style={{ marginRight: Spacing.sm }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{structure.name}</Text>
                    <Text style={styles.cardSubtitle}>Código: {structure.code}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Render Parameter cards in current directory */}
        {parameters.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Parámetros</Text>
            {parameters.map(param => (
              <TouchableOpacity
                key={param.id}
                style={styles.card}
                onPress={() => handleParamClick(param)}
              >
                <View style={styles.paramRow}>
                  <Ionicons name="document-text-outline" size={24} color={Colors.primary} style={{ marginRight: Spacing.sm }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{param.name}</Text>
                    <Text style={styles.cardSubtitle}>Código: {param.code}</Text>
                    {param.description && (
                      <Text style={styles.cardDescription}>{param.description}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {currentStructures.length === 0 && parameters.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={48} color={Colors.muted} />
            <Text style={styles.emptyText}>No se encontraron elementos disponibles.</Text>
          </View>
        )}
      </ScrollView>

      {/* Values details list modal */}
      <Modal
        visible={showValuesModal}
        animationType="slide"
        onRequestClose={() => setShowValuesModal(false)}
      >
        <View style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowValuesModal(false)}>
              <Ionicons name="close" size={28} color={Colors.muted} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle} numberOfLines={1}>
              {selectedParam?.name || "Valores"}
            </Text>
            <TouchableOpacity onPress={openCreateValuesRowModal}>
              <Ionicons name="add" size={28} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {isValuesFormActive ? (
            <ScrollView style={{ padding: Spacing.lg }}>
              <Text style={styles.sectionHeader}>
                {valuesModalMode === 'create' ? "Nuevo Registro" : `Editar Fila ${selectedRowNumber}`}
              </Text>
              {variables.map(v => (
                <View key={v.id} style={{ marginBottom: Spacing.md }}>
                  <Text style={styles.inputLabel}>{v.name} ({v.code})</Text>
                  <TextInput
                    style={styles.textInput}
                    value={valuesFormFields[v.id] || ''}
                    onChangeText={(val) => setValuesFormFields(prev => ({ ...prev, [v.id]: val }))}
                    placeholder={`Ingrese ${v.name}`}
                    placeholderTextColor={Colors.muted}
                  />
                </View>
              ))}
              <View style={styles.formActions}>
                <TouchableOpacity
                  style={[styles.formButton, { backgroundColor: Colors.muted }]}
                  onPress={() => setIsValuesFormActive(false)}
                >
                  <Text style={styles.formButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.formButton, { backgroundColor: Colors.primary }]}
                  onPress={handleSaveValuesRow}
                >
                  <Text style={styles.formButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <ScrollView style={{ padding: Spacing.lg }}>
              {transposedRows.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No hay valores registrados.</Text>
                </View>
              ) : (
                transposedRows.map((row, idx) => (
                  <View key={idx} style={styles.valueRowCard}>
                    <View style={styles.valueRowHeader}>
                      <Text style={styles.valueRowTitle}>Fila {row.row}</Text>
                      <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity
                          style={styles.rowActionButton}
                          onPress={() => openEditValuesRowModal(row.row)}
                        >
                          <Ionicons name="create-outline" size={20} color={Colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.rowActionButton}
                          onPress={() => handleDeleteValuesRow(row.row)}
                        >
                          <Ionicons name="trash-outline" size={20} color={Colors.destructive} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.valueFieldsGrid}>
                      {variables.map(v => (
                        <View key={v.id} style={styles.gridField}>
                          <Text style={styles.gridLabel}>{v.name}:</Text>
                          <Text style={styles.gridValue}>{row[v.code] || '-'}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    zIndex: 999
  },
  breadcrumbHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  breadcrumbText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: '500'
  },
  breadcrumbSeparator: {
    marginHorizontal: Spacing.xs,
    color: Colors.muted
  },
  breadcrumbActive: {
    color: Colors.foreground,
    fontWeight: 'bold'
  },
  section: {
    marginBottom: Spacing.lg
  },
  sectionHeader: {
    fontSize: Typography.sizes.sm,
    fontWeight: 'bold',
    color: Colors.muted,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase'
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border
  },
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  paramRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: 'bold',
    color: Colors.foreground
  },
  cardSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
    marginTop: 2
  },
  cardDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.foreground,
    marginTop: Spacing.xs
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },
  emptyText: {
    color: Colors.muted,
    marginTop: Spacing.sm,
    fontSize: Typography.sizes.sm
  },
  modalRoot: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 40
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  modalHeaderTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: 'bold',
    color: Colors.foreground,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.md
  },
  inputLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: 'bold',
    color: Colors.foreground,
    marginBottom: Spacing.xs
  },
  textInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    padding: Spacing.sm,
    color: Colors.foreground,
    fontSize: Typography.sizes.sm
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    gap: Spacing.md
  },
  formButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 6,
    alignItems: 'center'
  },
  formButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: Typography.sizes.sm
  },
  valueRowCard: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md
  },
  valueRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.xs,
    marginBottom: Spacing.sm
  },
  valueRowTitle: {
    fontWeight: 'bold',
    fontSize: Typography.sizes.sm,
    color: Colors.foreground
  },
  rowActionButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm
  },
  valueFieldsGrid: {
    gap: Spacing.xs
  },
  gridField: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  gridLabel: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm
  },
  gridValue: {
    fontWeight: '500',
    color: Colors.foreground,
    fontSize: Typography.sizes.sm
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md
  },
  backLinkText: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
    fontWeight: '600'
  }
});
