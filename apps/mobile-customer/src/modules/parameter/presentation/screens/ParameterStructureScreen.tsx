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
  Alert,
  Switch
} from 'react-native';
import { useTranslation } from '@kplian/i18n';
import { MainLayout } from '../../../../shared/layout/MainLayout';
import { Colors, Spacing, Typography } from '../../../../shared/theme/constants';
import {
  StructureRepositoryImpl,
  ParameterRepositoryImpl,
  VariableRepositoryImpl,
  ParameterValueRepositoryImpl
} from '@kplian/infrastructure';
import { Structure, Parameter, Variable, ParameterValue } from '@kplian/core';
import { Ionicons } from '@expo/vector-icons';
import { useVendor, useAuth } from '../../../../shared/auth/AuthContext';

const structureRepo = new StructureRepositoryImpl();
const parameterRepo = new ParameterRepositoryImpl();
const variableRepo = new VariableRepositoryImpl();
const parameterValueRepo = new ParameterValueRepositoryImpl();

interface ParameterStructureScreenProps {
  onBack: () => void;
  onNavigate?: (route: string) => void;
}

interface VariableWithValues {
  variable: Variable;
  values: ParameterValue[];
}

export default function ParameterStructureScreen({ onBack, onNavigate }: ParameterStructureScreenProps) {
  const { t } = useTranslation();
  const { vendor: vendorId } = useVendor();
  const { user } = useAuth();

  const [structures, setStructures] = useState<Structure[]>([]);
  const [currentParentId, setCurrentParentId] = useState<string | number | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Structure[]>([]);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);

  const [loading, setLoading] = useState(false);
  const [selectedParam, setSelectedParam] = useState<Parameter | null>(null);
  const [showValuesModal, setShowValuesModal] = useState(false);
  const [transposedRows, setTransposedRows] = useState<any[]>([]);
  const [showVariablesModal, setShowVariablesModal] = useState(false);

  // Structure Form Modal
  const [structureModalVisible, setStructureModalVisible] = useState(false);
  const [sCode, setSCode] = useState('');
  const [sName, setSName] = useState('');
  const [sIsPrivate, setSIsPrivate] = useState(false);
  const [sModuleCode, setSModuleCode] = useState('');

  // Parameter Form Modal
  const [parameterModalVisible, setParameterModalVisible] = useState(false);
  const [pCode, setPCode] = useState('');
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pType, setPType] = useState('list');

  // Variable Form Sub-state (inside variables list modal)
  const [isVariableFormActive, setIsVariableFormActive] = useState(false);
  const [varModalMode, setVarModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedVariable, setSelectedVariable] = useState<Variable | null>(null);
  const [varCode, setVarCode] = useState('');
  const [varName, setVarName] = useState('');
  const [varType, setVarType] = useState('string');
  const [varOrder, setVarOrder] = useState('');
  const [varPrimaryKey, setVarPrimaryKey] = useState(false);
  const [varDisplay, setVarDisplay] = useState(true);
  const [targetParameterId, setTargetParameterId] = useState<string | number | null>(null);

  // Values Form Sub-state (inside values details modal)
  const [isValuesFormActive, setIsValuesFormActive] = useState(false);
  const [valuesModalMode, setValuesModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedRowNumber, setSelectedRowNumber] = useState<number | null>(null);
  const [selectedRowVendorCode, setSelectedRowVendorCode] = useState<string>("null");
  const [valuesFormFields, setValuesFormFields] = useState<Record<string | number, string>>({});
  const [valuesFormValueIds, setValuesFormValueIds] = useState<Record<string | number, string | number>>({});

  const fetchStructures = useCallback(async () => {
    setLoading(true);
    try {
      const data = await structureRepo.getAll();
      setStructures(data || []);
    } catch (error) {
      console.error('Error loading structures:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const fetchVariables = async (parameterId: string | number) => {
    setLoading(true);
    try {
      const data = await variableRepo.getByParameterId(parameterId);
      setVariables(data || []);
    } catch (error) {
      console.error('Error loading variables:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

  useEffect(() => {
    if (currentParentId !== null) {
      fetchParameters(currentParentId);
    } else {
      setParameters([]);
    }
  }, [currentParentId, fetchParameters]);

  // Current level structures
  const currentStructures = structures.filter(s => s.parentId === currentParentId);

  const handleStructureClick = (structure: Structure) => {
    setBreadcrumbs(prev => [...prev, structure]);
    setCurrentParentId(structure.id);
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
      fetchParameters(target.id);
    }
  };

  // Fetch variables and transposed parameter values (right arrow click details)
  const handleParamClick = async (param: Parameter) => {
    setSelectedParam(param);
    setLoading(true);
    
    const requestPayload = [
      {
        fullCode: param.fullCode,
        vendorCode: ""
      }
    ];

    console.log('[API Request] POST /parameter/api/value/transpose/filter/batch', requestPayload);
    try {
      // 1. Fetch Variables to map dynamic column headers to names
      const vars = await variableRepo.getByParameterId(param.id);
      setVariables(vars || []);

      // 2. Fetch transposed values batch
      const batchData = (await parameterValueRepo.getTransposedBatch(param.fullCode, "")) as any;
      console.log('[API Response] getTransposedBatch:', batchData);
      
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
    } catch (error: any) {
      console.error('Error loading transposed variables and values:', error);
      console.error('[API Error Details] Requested Endpoint: POST /parameter/api/value/transpose/filter/batch');
      console.error('[API Error Details] Payload:', JSON.stringify(requestPayload));
      if (error.response) {
        console.error('[API Error Details] Server Response Status:', error.response.status);
        console.error('[API Error Details] Server Response Data:', JSON.stringify(error.response.data));
      }
      Alert.alert('Error', 'No se pudieron cargar los valores del parámetro.');
    } finally {
      setLoading(false);
    }
  };

  const handleReloadTransposedValues = async (param: Parameter) => {
    try {
      const batchData = (await parameterValueRepo.getTransposedBatch(param.fullCode, "")) as any;
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

  // Open Variables modal showing existing variables list
  const handleOpenVariablesList = (id: string | number, name: string) => {
    setTargetParameterId(id);
    setSelectedParam({ id, name, code: '', fullCode: '', type: '' } as Parameter);
    fetchVariables(id);
    setIsVariableFormActive(false);
    setShowVariablesModal(true);
  };

  // Add root or child structure
  const handleSaveStructure = async () => {
    if (!sCode.trim() || !sName.trim()) {
      Alert.alert('Error', 'Código y Nombre son requeridos.');
      return;
    }

    setLoading(true);
    try {
      const userCode = user?.username || user?.email || 'rodrychm@gmail.com';
      await structureRepo.create({
        code: sCode.toUpperCase(),
        name: sName,
        isPrivate: sIsPrivate ? 1 : 0,
        parentId: currentParentId,
        companyCode: userCode,
        moduleCode: sModuleCode || undefined
      });
      setStructureModalVisible(false);
      setSCode('');
      setSName('');
      setSIsPrivate(false);
      setSModuleCode('');
      fetchStructures();
      Alert.alert('Éxito', 'Estructura creada correctamente.');
    } catch (error) {
      console.error('Error saving structure:', error);
      Alert.alert('Error', 'No se pudo guardar la estructura.');
    } finally {
      setLoading(false);
    }
  };

  // Add parameter
  const handleSaveParameter = async () => {
    if (!pCode.trim() || !pName.trim()) {
      Alert.alert('Error', 'Código y Nombre son requeridos.');
      return;
    }
    if (currentParentId === null) return;

    setLoading(true);
    try {
      const parentStructure = structures.find(s => s.id === currentParentId);
      const parentCode = parentStructure ? parentStructure.code : '';
      const fullCode = parentCode ? `${parentCode}/${pCode.toUpperCase()}` : pCode.toUpperCase();

      await parameterRepo.create({
        code: pCode,
        name: pName,
        description: pDesc || undefined,
        type: pType,
        structureId: currentParentId,
        fullCode
      });
      setParameterModalVisible(false);
      setPCode('');
      setPName('');
      setPDesc('');
      setPType('list');
      fetchParameters(currentParentId);
      Alert.alert('Éxito', 'Parámetro creado correctamente.');
    } catch (error) {
      console.error('Error saving parameter:', error);
      Alert.alert('Error', 'No se pudo guardar el parámetro.');
    } finally {
      setLoading(false);
    }
  };

  // Open Variable Creation Modal
  const openCreateVariableModal = (paramId: string | number) => {
    setSelectedVariable(null);
    setVarCode('');
    setVarName('');
    setVarType('string');
    setVarOrder('');
    setVarPrimaryKey(false);
    setVarDisplay(true);
    setVarModalMode('create');
    setIsVariableFormActive(true);
  };

  // Open Variable Edit Modal
  const openEditVariableModal = (variable: Variable) => {
    setSelectedVariable(variable);
    setVarCode(variable.code);
    setVarName(variable.name);
    setVarType(variable.type);
    setVarOrder(variable.columnOrder || '');
    setVarPrimaryKey(variable.primaryKey === 1);
    setVarDisplay(variable.display === 1);
    setVarModalMode('edit');
    setIsVariableFormActive(true);
  };

  // Add Variable Logic
  const handleSaveVariable = async () => {
    if (!varCode.trim() || !varName.trim()) {
      Alert.alert('Error', 'Código y Nombre son requeridos.');
      return;
    }
    if (!targetParameterId) return;

    const payload = {
      code: varCode,
      name: varName,
      type: varType,
      columnOrder: varOrder || undefined,
      parameterId: targetParameterId,
      primaryKey: varPrimaryKey ? 1 : 0,
      display: varDisplay ? 1 : 0
    };

    setLoading(true);
    try {
      if (varModalMode === 'create') {
        console.log('[API Request] POST /parameter/api/variable', payload);
        await variableRepo.create(payload);
        Alert.alert('Éxito', 'Variable creada correctamente.');
      } else if (varModalMode === 'edit' && selectedVariable) {
        console.log(`[API Request] PUT /parameter/api/variable/${selectedVariable.id}`, payload);
        await variableRepo.update({
          ...payload,
          id: selectedVariable.id
        });
        Alert.alert('Éxito', 'Variable actualizada correctamente.');
      }
      setIsVariableFormActive(false);
      fetchVariables(targetParameterId);
    } catch (error: any) {
      console.error('Error saving variable:', error);
      if (error.response) {
        console.error('[API Error Details] Server Response Status:', error.response.status);
        console.error('[API Error Details] Server Response Data:', JSON.stringify(error.response.data));
      }
      Alert.alert('Error', 'No se pudo guardar la variable.');
    } finally {
      setLoading(false);
    }
  };

  // Delete Variable Logic
  const handleDeleteVariable = (id: number | string) => {
    Alert.alert(
      'Eliminar Variable',
      '¿Está seguro de que desea eliminar esta variable?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await variableRepo.delete(id);
              Alert.alert('Éxito', 'Variable eliminada correctamente.');
              if (targetParameterId) {
                fetchVariables(targetParameterId);
              }
            } catch (error) {
              console.error('Error deleting variable:', error);
              Alert.alert('Error', 'No se pudo eliminar la variable.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Prepare and open Values Creation Form
  const openCreateValuesRowModal = () => {
    setValuesModalMode('create');
    setSelectedRowNumber(null);
    setSelectedRowVendorCode("null");
    const initialFields: Record<string | number, string> = {};
    const initialValueIds: Record<string | number, number> = {};
    for (const v of variables) {
      initialFields[v.id] = '';
    }
    setValuesFormFields(initialFields);
    setValuesFormValueIds(initialValueIds);
    setIsValuesFormActive(true);
  };

  // Prepare and open Values Edit Form
  const openEditValuesRowModal = async (rowNum: number) => {
    setValuesModalMode('edit');
    setSelectedRowNumber(rowNum);
    setSelectedRowVendorCode("null");
    setLoading(true);
    try {
      const fields: Record<string | number, string> = {};
      const valueIds: Record<string | number, string | number> = {};
      let resolvedVendor = "null";
      
      for (const v of variables) {
        const vals = await parameterValueRepo.getByVariableId(v.id);
        const match = vals.find(val => val.row === rowNum);
        fields[v.id] = match ? match.value : '';
        if (match) {
          valueIds[v.id] = match.id;
          if (match.vendorCode) {
            resolvedVendor = match.vendorCode;
          }
        }
      }
      setSelectedRowVendorCode(resolvedVendor);
      setValuesFormFields(fields);
      setValuesFormValueIds(valueIds);
      setIsValuesFormActive(true);
    } catch (error) {
      console.error('Error preparing values edit form:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del registro.');
    } finally {
      setLoading(false);
    }
  };

  // Save Values Row logic (transposed values CRUD)
  const handleSaveValuesRow = async () => {
    if (!selectedParam) return;
    setLoading(true);
    try {
      const userCode = user?.username || user?.email || 'rodrychm@gmail.com';
      
      if (valuesModalMode === 'create') {
        const dataset = variables.map(v => ({
          [v.code]: valuesFormFields[v.id] || ""
        }));
        console.log('[API Request] POST /parameter/api/value/transpose', {
          parameterId: selectedParam.id,
          vendorCode: userCode,
          viewRoute: '/parameter/structure',
          dataset
        });
        await parameterValueRepo.createTransposedRow(String(selectedParam.id), userCode, dataset, "/parameter/structure");
        Alert.alert('Éxito', 'Registro creado correctamente.');
      } else if (valuesModalMode === 'edit' && selectedRowNumber !== null) {
        const rowObj: any = { row: selectedRowNumber };
        variables.forEach(v => {
          rowObj[v.code] = valuesFormFields[v.id] || "";
        });
        const dataset = [rowObj];
        const vCode = selectedRowVendorCode === "null" ? "" : selectedRowVendorCode;
        console.log('[API Request] PUT /parameter/api/value/transpose', {
          parameterId: selectedParam.id,
          vendorCode: vCode,
          viewRoute: '/parameter/structure',
          dataset
        });
        await parameterValueRepo.updateTransposedRow(String(selectedParam.id), vCode, dataset, "/parameter/structure");
        Alert.alert('Éxito', 'Registro actualizado correctamente.');
      }

      setIsValuesFormActive(false);
      handleReloadTransposedValues(selectedParam);
    } catch (error: any) {
      console.error('Error saving transposed row:', error);
      if (error.response) {
        console.error('[API Error Details] Server Response Status:', error.response.status);
        console.error('[API Error Details] Server Response Data:', JSON.stringify(error.response.data));
      }
      Alert.alert('Error', 'No se pudieron guardar los valores.');
    } finally {
      setLoading(false);
    }
  };

  // Delete values row logic
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
              let resolvedVendor = "null";
              if (variables.length > 0) {
                const vals = await parameterValueRepo.getByVariableId(variables[0].id);
                const match = vals.find(val => val.row === rowNum);
                if (match && match.vendorCode) {
                  resolvedVendor = match.vendorCode;
                }
              }
              console.log(`[API Request] DELETE /parameter/api/value/transpose/${selectedParam.id}/${resolvedVendor}/${rowNum}`);
              await parameterValueRepo.deleteTransposedRow(String(selectedParam.id), resolvedVendor, rowNum);
              Alert.alert('Éxito', 'Registro eliminado correctamente.');
              handleReloadTransposedValues(selectedParam);
            } catch (error: any) {
              console.error('Error deleting values row:', error);
              if (error.response) {
                console.error('[API Error Details] Server Response Status:', error.response.status);
                console.error('[API Error Details] Server Response Data:', JSON.stringify(error.response.data));
              }
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
    <MainLayout headerTitle="Parámetros" onNavigate={onNavigate}>
      {/* Back button to home */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity style={styles.backLink} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={Colors.muted} />
          <Text style={styles.backLinkText}>Volver</Text>
        </TouchableOpacity>

        {/* Plus Button */}
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          {currentParentId !== null && (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: 'rgba(255,255,255,0.08)' }]}
              onPress={() => setParameterModalVisible(true)}
            >
              <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setStructureModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
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

      {loading && currentStructures.length === 0 && parameters.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        /* Unified List (Structures & Parameters together) */
        <ScrollView style={styles.scroll}>
          {currentStructures.length === 0 && parameters.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={48} color={Colors.muted} />
              <Text style={styles.emptyText}>No hay elementos en este nivel.</Text>
            </View>
          ) : (
            <View style={{ gap: Spacing.sm }}>
              {/* Render structures (folders) */}
              {currentStructures.map(structure => (
                <View key={structure.id} style={styles.cardContainer}>
                  <TouchableOpacity
                    style={styles.card}
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

                  {/* Variables action button for structures */}
                  <View style={styles.cardActionRow}>
                    <TouchableOpacity
                      style={styles.cardActionButton}
                      onPress={() => handleOpenVariablesList(structure.id, structure.name)}
                    >
                      <Ionicons name="options-outline" size={16} color={Colors.primary} />
                      <Text style={styles.cardActionButtonText}>Variables</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Render parameters */}
              {parameters.map(param => (
                <View key={param.id} style={styles.cardContainer}>
                  <TouchableOpacity
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

                  {/* Variables action button for parameters */}
                  <View style={styles.cardActionRow}>
                    <TouchableOpacity
                      style={styles.cardActionButton}
                      onPress={() => handleOpenVariablesList(param.id, param.name)}
                    >
                      <Ionicons name="options-outline" size={16} color={Colors.primary} />
                      <Text style={styles.cardActionButtonText}>Variables</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Structure Form Modal */}
      <Modal
        visible={structureModalVisible}
        animationType="slide"
        onRequestClose={() => setStructureModalVisible(false)}
      >
        <View style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setStructureModalVisible(false)}>
              <Ionicons name="close" size={28} color={Colors.muted} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>
              {currentParentId === null ? "Agregar Estructura Raíz" : "Agregar Subestructura"}
            </Text>
            <TouchableOpacity onPress={handleSaveStructure}>
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: Spacing.lg }}>
            <Text style={styles.inputLabel}>Código</Text>
            <TextInput
              style={styles.textInput}
              value={sCode}
              onChangeText={setSCode}
              placeholder="e.g. GEN"
              placeholderTextColor={Colors.muted}
              autoCapitalize="characters"
            />
            <Text style={styles.inputLabel}>Nombre</Text>
            <TextInput
              style={styles.textInput}
              value={sName}
              onChangeText={setSName}
              placeholder="e.g. General"
              placeholderTextColor={Colors.muted}
            />
            <Text style={styles.inputLabel}>Código de Módulo</Text>
            <TextInput
              style={styles.textInput}
              value={sModuleCode}
              onChangeText={setSModuleCode}
              placeholder="e.g. CRM, warehouse"
              placeholderTextColor={Colors.muted}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.md }}>
              <Text style={{ color: Colors.foreground, fontSize: Typography.sizes.sm, fontWeight: 'bold' }}>¿Es privada?</Text>
              <Switch
                value={sIsPrivate}
                onValueChange={setSIsPrivate}
                trackColor={{ false: '#767577', true: Colors.primary }}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Parameter Form Modal */}
      <Modal
        visible={parameterModalVisible}
        animationType="slide"
        onRequestClose={() => setParameterModalVisible(false)}
      >
        <View style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setParameterModalVisible(false)}>
              <Ionicons name="close" size={28} color={Colors.muted} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Agregar Parámetro</Text>
            <TouchableOpacity onPress={handleSaveParameter}>
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: Spacing.lg }}>
            <Text style={styles.inputLabel}>Código</Text>
            <TextInput
              style={styles.textInput}
              value={pCode}
              onChangeText={setPCode}
              placeholder="e.g. max_length"
              placeholderTextColor={Colors.muted}
            />
            <Text style={styles.inputLabel}>Nombre</Text>
            <TextInput
              style={styles.textInput}
              value={pName}
              onChangeText={setPName}
              placeholder="e.g. Maximum Length"
              placeholderTextColor={Colors.muted}
            />
            <Text style={styles.inputLabel}>Tipo</Text>
            <TextInput
              style={styles.textInput}
              value={pType}
              onChangeText={setPType}
              placeholder="e.g. list, string"
              placeholderTextColor={Colors.muted}
            />
            <Text style={styles.inputLabel}>Descripción</Text>
            <TextInput
              style={[styles.textInput, { height: 80 }]}
              value={pDesc}
              onChangeText={setPDesc}
              placeholder="Descripción del parámetro"
              placeholderTextColor={Colors.muted}
              multiline
            />
          </ScrollView>
        </View>
      </Modal>

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
            /* Render Values Form inside modal */
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
            /* Render Values List */
            <>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowValuesModal(false)}>
                  <Ionicons name="close" size={28} color={Colors.muted} />
                </TouchableOpacity>
                <Text style={styles.modalHeaderTitle}>Valores del Parámetro</Text>
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
                    <Text style={styles.emptyText}>No hay valores registrados.</Text>
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

      {/* Variables List Modal (Grandchild Variable entities list) */}
      <Modal
        visible={showVariablesModal}
        animationType="slide"
        onRequestClose={() => {
          if (isVariableFormActive) {
            setIsVariableFormActive(false);
          } else {
            setShowVariablesModal(false);
          }
        }}
      >
        <View style={styles.modalRoot}>
          {isVariableFormActive ? (
            /* Render Variable Form inside single modal container */
            <>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setIsVariableFormActive(false)}>
                  <Ionicons name="close" size={28} color={Colors.muted} />
                </TouchableOpacity>
                <Text style={styles.modalHeaderTitle}>
                  {varModalMode === 'create' ? 'Agregar Variable' : 'Editar Variable'}
                </Text>
                <TouchableOpacity onPress={handleSaveVariable}>
                  <Text style={styles.saveText}>Guardar</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={{ padding: Spacing.lg }}>
                <Text style={styles.inputLabel}>Código</Text>
                <TextInput
                  style={styles.textInput}
                  value={varCode}
                  onChangeText={setVarCode}
                  placeholder="e.g. min_length"
                  placeholderTextColor={Colors.muted}
                  editable={varModalMode === 'create'}
                />
                <Text style={styles.inputLabel}>Nombre</Text>
                <TextInput
                  style={styles.textInput}
                  value={varName}
                  onChangeText={setVarName}
                  placeholder="e.g. Minimum Length"
                  placeholderTextColor={Colors.muted}
                />
                <Text style={styles.inputLabel}>Tipo</Text>
                <TextInput
                  style={styles.textInput}
                  value={varType}
                  onChangeText={setVarType}
                  placeholder="e.g. integer, string"
                  placeholderTextColor={Colors.muted}
                />
                <Text style={styles.inputLabel}>Orden columna</Text>
                <TextInput
                  style={styles.textInput}
                  value={varOrder}
                  onChangeText={setVarOrder}
                  placeholder="e.g. 1"
                  placeholderTextColor={Colors.muted}
                  keyboardType="numeric"
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.md }}>
                  <Text style={{ color: Colors.foreground, fontSize: Typography.sizes.sm, fontWeight: 'bold' }}>¿Es Llave Primaria?</Text>
                  <Switch
                    value={varPrimaryKey}
                    onValueChange={setVarPrimaryKey}
                    trackColor={{ false: '#767577', true: Colors.primary }}
                  />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.md }}>
                  <Text style={{ color: Colors.foreground, fontSize: Typography.sizes.sm, fontWeight: 'bold' }}>Mostrar en Lista</Text>
                  <Switch
                    value={varDisplay}
                    onValueChange={setVarDisplay}
                    trackColor={{ false: '#767577', true: Colors.primary }}
                  />
                </View>
              </ScrollView>
            </>
          ) : (
            /* Render Variables List inside single modal container */
            <>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowVariablesModal(false)}>
                  <Ionicons name="close" size={28} color={Colors.muted} />
                </TouchableOpacity>
                <Text style={styles.modalHeaderTitle}>Variables</Text>
                {targetParameterId && (
                  <TouchableOpacity onPress={() => openCreateVariableModal(targetParameterId)}>
                    <Ionicons name="add" size={28} color={Colors.primary} />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView style={{ flex: 1, padding: Spacing.lg }}>
                <Text style={styles.modalSubtitle}>
                  Variables de: <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>{selectedParam?.name}</Text>
                </Text>

                {loading ? (
                  <View style={{ paddingVertical: Spacing.xl }}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                  </View>
                ) : variables.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="options-outline" size={48} color={Colors.muted} />
                    <Text style={styles.emptyText}>No hay variables definidas.</Text>
                    <TouchableOpacity
                      style={[styles.addButton, { width: 'auto', paddingHorizontal: 16, marginTop: 12, flexDirection: 'row', gap: 6 }]}
                      onPress={() => targetParameterId && openCreateVariableModal(targetParameterId)}
                    >
                      <Ionicons name="add" size={18} color="#fff" />
                      <Text style={{ color: '#fff', fontSize: Typography.sizes.sm, fontWeight: 'bold' }}>Agregar Variable</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  variables.map(v => (
                    <View key={v.id} style={styles.card}>
                      <View style={styles.iconWrapper}>
                        <Ionicons name="options-outline" size={24} color={Colors.primary} />
                      </View>
                      
                      <View style={{ flex: 1, marginRight: Spacing.sm }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <Text style={styles.cardTitle}>{v.name}</Text>
                          {v.primaryKey === 1 && (
                            <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                              <Text style={[styles.badgeText, { color: '#10b981' }]}>PK</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.cardSubtitle}>Código: {v.code} | Tipo: {v.type}</Text>
                        {v.columnOrder && (
                          <Text style={styles.cardDescription}>Orden columna: {v.columnOrder}</Text>
                        )}
                      </View>

                      <View style={styles.actionColumn}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => openEditVariableModal(v)}>
                          <Ionicons name="create-outline" size={20} color={Colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteVariable(v.id)}>
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
  cardContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
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
  cardActionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  cardActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: 6,
  },
  cardActionButtonText: {
    color: Colors.foreground,
    fontSize: Typography.sizes.sm,
    fontWeight: 'medium',
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
  saveText: {
    color: Colors.primary,
    fontSize: Typography.sizes.md,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    marginBottom: Spacing.md,
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
  varCard: {
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  varTitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.sm,
    fontWeight: 'bold',
  },
  varSubtitle: {
    color: Colors.muted,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  varOrder: {
    color: Colors.muted,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
    opacity: 0.6,
  },
  valueItem: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  valueItemText: {
    color: Colors.foreground,
    fontSize: Typography.sizes.sm,
  },
  valueItemSubText: {
    color: Colors.muted,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
    opacity: 0.6,
  },
});
