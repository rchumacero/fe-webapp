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
  Pressable, 
  FlatList,
  Alert
} from 'react-native';
import { useTranslation } from '@kplian/i18n';
import { MainLayout } from '../../../../shared/layout/MainLayout';
import { Colors, Spacing, Typography } from '../../../../shared/theme/constants';
import { 
  MainEntityRepositoryImpl, 
  EntityStateRepositoryImpl, 
  StateTransitionRepositoryImpl 
} from '@kplian/infrastructure';
import { 
  MainEntity, 
  EntityState, 
  StateTransition, 
  CreateMainEntityDto, 
  UpdateMainEntityDto,
  CreateEntityStateDto,
  UpdateEntityStateDto,
  CreateStateTransitionDto,
  UpdateStateTransitionDto,
  loadDomainParameters,
  getBatchParameters
} from '@kplian/core';
import { Ionicons } from '@expo/vector-icons';
import { useVendor } from '../../../../shared/auth/AuthContext';

const mainEntityRepo = new MainEntityRepositoryImpl();
const entityStateRepo = new EntityStateRepositoryImpl();
const stateTransitionRepo = new StateTransitionRepositoryImpl();

interface MainEntityScreenProps {
  onBack: () => void;
  onNavigate?: (route: string) => void;
}

export default function MainEntityScreen({ onBack, onNavigate }: MainEntityScreenProps) {
  const { t } = useTranslation();
  const { vendor: vendorId } = useVendor();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Domain Lists State
  const [mainEntities, setMainEntities] = useState<MainEntity[]>([]);
  const [entityStates, setEntityStates] = useState<EntityState[]>([]);
  const [stateTransitions, setStateTransitions] = useState<StateTransition[]>([]);

  // Navigation / Focus state
  const [activeMainEntity, setActiveMainEntity] = useState<MainEntity | null>(null);
  const [activeEntityState, setActiveEntityState] = useState<EntityState | null>(null);

  // Modals visibility state
  const [mainEntityModalMode, setMainEntityModalMode] = useState<'create' | 'edit' | 'detail' | null>(null);
  const [entityStateModalMode, setEntityStateModalMode] = useState<'create' | 'edit' | 'detail' | null>(null);
  const [stateTransitionModalMode, setStateTransitionModalMode] = useState<'create' | 'edit' | 'detail' | null>(null);

  // Selected for edits
  const [selectedMainEntity, setSelectedMainEntity] = useState<MainEntity | null>(null);
  const [selectedEntityState, setSelectedEntityState] = useState<EntityState | null>(null);
  const [selectedTransition, setSelectedTransition] = useState<StateTransition | null>(null);

  // Forms Fields
  const [formMainEntityName, setFormMainEntityName] = useState('');
  const [formMainEntityProcessName, setFormMainEntityProcessName] = useState('');
  const [formMainEntityStatus, setFormMainEntityStatus] = useState('ACTIVE');

  const [formStateCode, setFormStateCode] = useState('');
  const [formStateName, setFormStateName] = useState('');
  const [formStateType, setFormStateType] = useState('INITIAL');
  const [formStateStatus, setFormStateStatus] = useState('ACTIVE');

  const [formTransitionEndStateId, setFormTransitionEndStateId] = useState('');
  const [formTransitionStatus, setFormTransitionStatus] = useState('ACTIVE');
  const [formTransitionEndpoint, setFormTransitionEndpoint] = useState('');
  const [formTransitionRequest, setFormTransitionRequest] = useState('');


  // Dropdown Pickers
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

  const [stateTypeOptions, setStateTypeOptions] = useState<{ CODE: string; name: string }[]>([]);

  const statusOptions = [
    { CODE: 'ACTIVE', name: 'Active' },
    { CODE: 'INACTIVE', name: 'Inactive' },
  ];

  const fetchMainEntities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await mainEntityRepo.getAll();
      setMainEntities(data || []);
    } catch (error) {
      console.error('Error loading main entities:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEntityStates = useCallback(async (mainEntityId: string) => {
    setLoading(true);
    try {
      const data = await entityStateRepo.getByMainEntityId(mainEntityId);
      setEntityStates(data || []);
    } catch (error) {
      console.error('Error loading entity states:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStateTransitions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await stateTransitionRepo.getAll();
      setStateTransitions(data || []);
    } catch (error) {
      console.error('Error loading transitions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMainEntities();
    fetchStateTransitions();
  }, [fetchMainEntities, fetchStateTransitions]);

  // Load parameters dynamically
  useEffect(() => {
    if (!vendorId) return;
    const fetchParams = async () => {
      try {
        const mapped = await loadDomainParameters(
          getBatchParameters,
          [{ fullCode: 'WFL/MAIN/STAT' }]
        );
        console.log('[Workflow Debug] fetchParams Mapped:', JSON.stringify(mapped));
        
        if (mapped['WFL/MAIN/STAT']) {
          const list = mapped['WFL/MAIN/STAT'].map((x: any) => ({
            CODE: x.CODE || x.code,
            name: x.NAME || x.name || x.description || x.CODE || x.code
          }));
          setStateTypeOptions(list);
        }
      } catch (err) {
        console.error('Failed to load workflow parameters:', err);
      }
    };
    fetchParams();
  }, [vendorId]);

  // Main Entity CRUD Actions
  const openCreateMainEntity = () => {
    setFormMainEntityName('');
    setFormMainEntityProcessName('');
    setFormMainEntityStatus('ACTIVE');
    setMainEntityModalMode('create');
  };

  const openEditMainEntity = (entity: MainEntity) => {
    setSelectedMainEntity(entity);
    setFormMainEntityName(entity.name);
    setFormMainEntityProcessName(entity.processName);
    setFormMainEntityStatus(entity.status);
    setMainEntityModalMode('edit');
  };

  const handleSaveMainEntity = async () => {
    if (!formMainEntityName.trim() || !formMainEntityProcessName.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      if (mainEntityModalMode === 'create') {
        const dto: CreateMainEntityDto = {
          name: formMainEntityName,
          processName: formMainEntityProcessName,
          status: formMainEntityStatus
        };
        await mainEntityRepo.create(dto);
      } else if (mainEntityModalMode === 'edit' && selectedMainEntity) {
        const dto: UpdateMainEntityDto = {
          id: selectedMainEntity.id,
          name: formMainEntityName,
          processName: formMainEntityProcessName,
          status: formMainEntityStatus
        };
        await mainEntityRepo.update(dto);
      }
      setMainEntityModalMode(null);
      fetchMainEntities();
    } catch (error) {
      console.error('Error saving main entity:', error);
      Alert.alert('Error', 'Failed to save Main Entity.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMainEntity = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this Main Entity?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await mainEntityRepo.delete(id);
              fetchMainEntities();
              if (activeMainEntity?.id === id) {
                setActiveMainEntity(null);
                setEntityStates([]);
              }
            } catch (error) {
              console.error('Error deleting main entity:', error);
              Alert.alert('Error', 'Failed to delete Main Entity.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Entity State CRUD Actions
  const openCreateEntityState = () => {
    if (!activeMainEntity) return;
    setFormStateCode('');
    setFormStateName('');
    setFormStateType('INITIAL');
    setFormStateStatus('ACTIVE');
    setEntityStateModalMode('create');
  };

  const openEditEntityState = (state: EntityState) => {
    setSelectedEntityState(state);
    setFormStateCode(state.code);
    setFormStateName(state.name);
    setFormStateType(state.type);
    setFormStateStatus(state.status);
    setEntityStateModalMode('edit');
  };

  const handleSaveEntityState = async () => {
    if (!activeMainEntity) return;
    if (!formStateCode.trim() || !formStateName.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      if (entityStateModalMode === 'create') {
        const dto: CreateEntityStateDto = {
          mainEntityId: activeMainEntity.id,
          code: formStateCode,
          name: formStateName,
          type: formStateType,
          status: formStateStatus
        };
        await entityStateRepo.create(dto);
      } else if (entityStateModalMode === 'edit' && selectedEntityState) {
        const dto: UpdateEntityStateDto = {
          id: selectedEntityState.id,
          mainEntityId: activeMainEntity.id,
          code: formStateCode,
          name: formStateName,
          type: formStateType,
          status: formStateStatus
        };
        await entityStateRepo.update(dto);
      }
      setEntityStateModalMode(null);
      fetchEntityStates(activeMainEntity.id);
    } catch (error) {
      console.error('Error saving entity state:', error);
      Alert.alert('Error', 'Failed to save Entity State.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntityState = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this State?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await entityStateRepo.delete(id);
              if (activeMainEntity) {
                fetchEntityStates(activeMainEntity.id);
              }
              if (activeEntityState?.id === id) {
                setActiveEntityState(null);
              }
            } catch (error) {
              console.error('Error deleting state:', error);
              Alert.alert('Error', 'Failed to delete Entity State.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // State Transition CRUD Actions
  const openCreateTransition = () => {
    if (!activeEntityState) return;
    setFormTransitionEndStateId('');
    setFormTransitionStatus('ACTIVE');
    setFormTransitionEndpoint('');
    setFormTransitionRequest('');
    setStateTransitionModalMode('create');
  };

  const handleSaveTransition = async () => {
    if (!activeEntityState) return;
    if (!formTransitionEndStateId) {
      Alert.alert('Error', 'Please select an end state.');
      return;
    }
    if (formTransitionEndpoint.length > 150) {
      Alert.alert('Error', 'Endpoint must be at most 150 characters.');
      return;
    }
    if (formTransitionRequest.length > 500) {
      Alert.alert('Error', 'Request must be at most 500 characters.');
      return;
    }
    setLoading(true);
    try {
      const dto: CreateStateTransitionDto = {
        initEntityStateId: activeEntityState.id,
        endEntityStateId: formTransitionEndStateId,
        status: formTransitionStatus,
        endpoint: formTransitionEndpoint || undefined,
        request: formTransitionRequest || undefined
      };
      await stateTransitionRepo.create(dto);
      setStateTransitionModalMode(null);
      fetchStateTransitions();
    } catch (error) {
      console.error('Error saving transition:', error);
      Alert.alert('Error', 'Failed to create Transition.');
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteTransition = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this Transition?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await stateTransitionRepo.delete(id);
              fetchStateTransitions();
            } catch (error) {
              console.error('Error deleting transition:', error);
              Alert.alert('Error', 'Failed to delete Transition.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Dropdown Picker Handlers
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

  const getParamLabel = (data: any[], val: string) => {
    const item = data.find(i => (i.CODE || i.id) === val);
    return item ? (item.name || item.code) : val;
  };

  // Filtered Lists
  const filteredMainEntities = mainEntities.filter(entity => 
    entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entity.processName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Transitions from the active state
  const activeTransitions = stateTransitions.filter(t => t.initEntityStateId === activeEntityState?.id);

  // States available to transition to (same main entity, not the current state)
  const availableEndStates = entityStates.filter(s => s.id !== activeEntityState?.id);

  const renderPickerModal = () => (
    <View style={[StyleSheet.absoluteFill, { zIndex: 9999 }]}>
      <Pressable 
        style={styles.pickerOverlay} 
        onPress={() => setPickerModal(p => ({ ...p, visible: false }))}
      >
        <View style={styles.pickerContent}>
          <Text style={styles.pickerTitle}>{pickerModal.title}</Text>
          <View style={styles.pickerDivider} />
          <FlatList
            data={pickerModal.data}
            keyExtractor={(item, idx) => ((item.CODE || item.id || idx).toString())}
            renderItem={({ item }) => {
              const code = item.CODE || item.id;
              const name = item.name || item.code;
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
    </View>
  );

  // SCREEN VIEWS RENDER
  
  // VIEW 1: State Transitions View (Child Level)
  if (activeEntityState) {
    return (
      <MainLayout headerTitle={`Transitions: ${activeEntityState.name}`}>
        <TouchableOpacity style={styles.backLink} onPress={() => setActiveEntityState(null)}>
          <Ionicons name="arrow-back" size={20} color={Colors.muted} />
          <Text style={styles.backLinkText}>Back to States</Text>
        </TouchableOpacity>

        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>State: {activeEntityState.name}</Text>
          <TouchableOpacity style={styles.addButton} onPress={openCreateTransition}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading && activeTransitions.length === 0 ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : activeTransitions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="git-compare-outline" size={48} color={Colors.muted} />
            <Text style={styles.emptyText}>No transitions defined for this state.</Text>
          </View>
        ) : (
          <ScrollView style={styles.scroll}>
            {activeTransitions.map(transition => (
              <View key={transition.id} style={styles.card}>
                <View style={styles.cardIcon}>
                  <Ionicons name="arrow-forward-circle" size={24} color={Colors.primary} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>
                    To: {getParamLabel(entityStates, transition.endEntityStateId)}
                  </Text>
                  <Text style={[styles.tag, { color: transition.status === 'ACTIVE' ? Colors.primary : Colors.muted }]}>
                    Status: {transition.status}
                  </Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteTransition(transition.id)}>
                    <Ionicons name="trash-outline" size={20} color={Colors.destructive} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Create Transition Modal */}
        <Modal
          visible={stateTransitionModalMode !== null}
          animationType="slide"
          onRequestClose={() => setStateTransitionModalMode(null)}
        >
          <SafeAreaWrapper style={styles.modalRoot}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setStateTransitionModalMode(null)}>
                <Ionicons name="close" size={28} color={Colors.muted} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>New Transition</Text>
              <TouchableOpacity onPress={handleSaveTransition}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalFormContent}>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Initial Entity State</Text>
                <TextInput 
                  style={[styles.textInput, { opacity: 0.6 }]} 
                  value={activeEntityState.name} 
                  editable={false} 
                />

                <Text style={styles.inputLabel}>End Entity State</Text>
                <TouchableOpacity 
                  style={styles.dropdownTrigger}
                  onPress={() => openDropdownPicker(
                    'Select Target State', 
                    entityStates.map(s => ({ id: s.id, name: `${s.code} - ${s.name}` })), 
                    formTransitionEndStateId, 
                    setFormTransitionEndStateId
                  )}
                >
                  <Text style={styles.dropdownValue}>
                    {getParamLabel(entityStates, formTransitionEndStateId) || 'Select State...'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={Colors.muted} />
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Status</Text>
                <TouchableOpacity 
                  style={styles.dropdownTrigger}
                  onPress={() => openDropdownPicker('Select Status', statusOptions, formTransitionStatus, setFormTransitionStatus)}
                >
                  <Text style={styles.dropdownValue}>
                    {getParamLabel(statusOptions, formTransitionStatus)}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={Colors.muted} />
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Endpoint</Text>
                <TextInput
                  style={styles.textInput}
                  value={formTransitionEndpoint}
                  onChangeText={setFormTransitionEndpoint}
                  placeholder="Enter endpoint (max 150 chars)..."
                  placeholderTextColor={Colors.muted}
                  maxLength={150}
                />

                <Text style={styles.inputLabel}>Request</Text>
                <TextInput
                  style={[styles.textInput, { height: 100, textAlignVertical: 'top', paddingTop: Spacing.sm }]}
                  value={formTransitionRequest}
                  onChangeText={setFormTransitionRequest}
                  placeholder="Enter request (max 500 chars)..."
                  placeholderTextColor={Colors.muted}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
              </View>
            </ScrollView>

            {pickerModal.visible && renderPickerModal()}
          </SafeAreaWrapper>
        </Modal>
      </MainLayout>
    );
  }

  // VIEW 2: Entity States View (Parent Level)
  if (activeMainEntity) {
    return (
      <MainLayout headerTitle={`States: ${activeMainEntity.name}`}>
        <TouchableOpacity style={styles.backLink} onPress={() => { setActiveMainEntity(null); setEntityStates([]); }}>
          <Ionicons name="arrow-back" size={20} color={Colors.muted} />
          <Text style={styles.backLinkText}>Back to Main Entities</Text>
        </TouchableOpacity>

        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Entity: {activeMainEntity.name}</Text>
            <Text style={{ fontSize: Typography.sizes.sm, color: Colors.muted, marginTop: 2 }}>{activeMainEntity.processName}</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={openCreateEntityState}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading && entityStates.length === 0 ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : entityStates.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="git-network-outline" size={48} color={Colors.muted} />
            <Text style={styles.emptyText}>No states defined for this entity.</Text>
          </View>
        ) : (
          <ScrollView style={styles.scroll}>
            {entityStates.map(state => (
              <View 
                key={state.id} 
                style={styles.card}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name="ellipse" size={24} color={Colors.primary} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{state.name}</Text>
                  <Text style={styles.cardDesc}>Code: {state.code}</Text>
                  <View style={styles.tagRow}>
                    <Text style={[styles.tag, { color: Colors.muted, marginRight: Spacing.sm }]}>{state.type}</Text>
                    <Text style={[styles.tag, { color: state.status === 'ACTIVE' ? Colors.primary : Colors.muted }]}>
                      {state.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.iconButton} onPress={() => setActiveEntityState(state)}>
                    <Ionicons name="layers-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton} onPress={() => openEditEntityState(state)}>
                    <Ionicons name="create-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteEntityState(state.id)}>
                    <Ionicons name="trash-outline" size={20} color={Colors.destructive} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Create/Edit Entity State Modal */}
        <Modal
          visible={entityStateModalMode !== null}
          animationType="slide"
          onRequestClose={() => setEntityStateModalMode(null)}
        >
          <SafeAreaWrapper style={styles.modalRoot}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setEntityStateModalMode(null)}>
                <Ionicons name="close" size={28} color={Colors.muted} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {entityStateModalMode === 'create' ? 'Create State' : 'Edit State'}
              </Text>
              <TouchableOpacity onPress={handleSaveEntityState}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalFormContent}>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>State Code</Text>
                <TextInput 
                  style={styles.textInput}
                  value={formStateCode}
                  onChangeText={setFormStateCode}
                  placeholder="e.g. DRAFT"
                  placeholderTextColor={Colors.muted}
                />

                <Text style={styles.inputLabel}>State Name</Text>
                <TextInput 
                  style={styles.textInput}
                  value={formStateName}
                  onChangeText={setFormStateName}
                  placeholder="e.g. Draft status"
                  placeholderTextColor={Colors.muted}
                />

                <Text style={styles.inputLabel}>State Type</Text>
                <TouchableOpacity 
                  style={styles.dropdownTrigger}
                  onPress={() => openDropdownPicker('Select State Type', stateTypeOptions, formStateType, setFormStateType)}
                >
                  <Text style={styles.dropdownValue}>
                    {getParamLabel(stateTypeOptions, formStateType)}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={Colors.muted} />
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Status</Text>
                <TouchableOpacity 
                  style={styles.dropdownTrigger}
                  onPress={() => openDropdownPicker('Select Status', statusOptions, formStateStatus, setFormStateStatus)}
                >
                  <Text style={styles.dropdownValue}>
                    {getParamLabel(statusOptions, formStateStatus)}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={Colors.muted} />
                </TouchableOpacity>
              </View>
            </ScrollView>

            {pickerModal.visible && renderPickerModal()}
          </SafeAreaWrapper>
        </Modal>
      </MainLayout>
    );
  }

  // VIEW 3: Main Entities List (Grandparent Level / Root View)
  return (
    <MainLayout headerTitle="Workflow Management">
      <TouchableOpacity style={styles.backLink} onPress={onBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.muted} />
        <Text style={styles.backLinkText}>Volver</Text>
      </TouchableOpacity>

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Main Entities</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreateMainEntity}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.muted} style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search entities or processes..."
          placeholderTextColor={Colors.muted}
        />
      </View>

      {loading && mainEntities.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : filteredMainEntities.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="git-branch-outline" size={48} color={Colors.muted} />
          <Text style={styles.emptyText}>No entities found.</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll}>
          {filteredMainEntities.map(entity => (
            <View 
              key={entity.id} 
              style={styles.card}
            >
              <View style={styles.cardIcon}>
                <Ionicons name="git-merge" size={24} color={Colors.primary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{entity.name}</Text>
                <Text style={styles.cardDesc}>Code: {entity.processName}</Text>
                <Text style={[styles.tag, { color: entity.status === 'ACTIVE' ? Colors.primary : Colors.muted }]}>
                  {entity.status}
                </Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={styles.iconButton} 
                  onPress={() => {
                    setActiveMainEntity(entity);
                    fetchEntityStates(entity.id);
                  }}
                >
                  <Ionicons name="layers-outline" size={20} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => openEditMainEntity(entity)}>
                  <Ionicons name="create-outline" size={20} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteMainEntity(entity.id)}>
                  <Ionicons name="trash-outline" size={20} color={Colors.destructive} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Create/Edit Main Entity Modal */}
      <Modal
        visible={mainEntityModalMode !== null}
        animationType="slide"
        onRequestClose={() => setMainEntityModalMode(null)}
      >
        <SafeAreaWrapper style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setMainEntityModalMode(null)}>
              <Ionicons name="close" size={28} color={Colors.muted} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {mainEntityModalMode === 'create' ? 'Create Entity' : 'Edit Entity'}
            </Text>
            <TouchableOpacity onPress={handleSaveMainEntity}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalFormContent}>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput 
                style={styles.textInput}
                value={formMainEntityName}
                onChangeText={setFormMainEntityName}
                placeholder="Entity name"
                placeholderTextColor={Colors.muted}
              />

              <Text style={styles.inputLabel}>Process Name</Text>
              <TextInput 
                style={styles.textInput}
                value={formMainEntityProcessName}
                onChangeText={setFormMainEntityProcessName}
                placeholder="Linked process code/name"
                placeholderTextColor={Colors.muted}
              />

              <Text style={styles.inputLabel}>Status</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => openDropdownPicker('Select Status', statusOptions, formMainEntityStatus, setFormMainEntityStatus)}
              >
                <Text style={styles.dropdownValue}>
                  {getParamLabel(statusOptions, formMainEntityStatus)}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.muted} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {pickerModal.visible && renderPickerModal()}
        </SafeAreaWrapper>
      </Modal>
    </MainLayout>
  );
}

const SafeAreaWrapper = ({ children, style }: { children: React.ReactNode; style?: any }) => {
  return <View style={[{ flex: 1, backgroundColor: Colors.background, paddingTop: 40 }, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: -Spacing.xs,
  },
  backLinkText: {
    color: Colors.muted,
    marginLeft: Spacing.xs,
    fontSize: Typography.sizes.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
    color: Colors.foreground,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 48,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchIcon: {
    // no extra margin needed
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: Colors.muted,
    marginTop: Spacing.sm,
    fontSize: Typography.sizes.md,
  },
  scroll: {
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: Typography.sizes.md,
    fontWeight: 'bold',
    color: Colors.foreground,
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.muted,
    marginBottom: 4,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  tag: {
    fontSize: Typography.sizes.xs,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    color: Colors.foreground,
  },
  saveText: {
    color: Colors.primary,
    fontSize: Typography.sizes.md,
    fontWeight: 'bold',
  },
  modalFormContent: {
    flex: 1,
    padding: Spacing.md,
  },
  formGroup: {
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
    height: 48,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 48,
  },
  dropdownValue: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  pickerContent: {
    width: '100%',
    maxHeight: '60%',
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerTitle: {
    color: '#fff',
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  pickerDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  pickerItem: {
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.xs,
  },
  activePickerItem: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  pickerLabel: {
    color: Colors.muted,
    fontSize: Typography.sizes.md,
    fontWeight: 'medium',
  },
  activePickerLabel: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
});
