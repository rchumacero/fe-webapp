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
import { SecretRepositoryImpl } from '@kplian/infrastructure';
import { Secret } from '@kplian/core';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../../shared/auth/AuthContext';

const secretRepo = new SecretRepositoryImpl();

interface ParameterSecretScreenProps {
  onBack: () => void;
  onNavigate?: (route: string) => void;
}

export default function ParameterSecretScreen({ onBack, onNavigate }: ParameterSecretScreenProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleSecrets, setVisibleSecrets] = useState<Record<number, boolean>>({});

  // Form Modal State
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedSecret, setSelectedSecret] = useState<Secret | null>(null);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const fetchSecrets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await secretRepo.getAll();
      setSecrets(data || []);
    } catch (error) {
      console.error('Error loading secrets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSecrets();
  }, [fetchSecrets]);

  const toggleVisibility = (id: number) => {
    setVisibleSecrets(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const openCreateModal = () => {
    setSelectedSecret(null);
    setFormCode('');
    setFormName('');
    setFormValue('');
    setFormDescription('');
    setModalMode('create');
  };

  const openEditModal = (secret: Secret) => {
    setSelectedSecret(secret);
    setFormCode(secret.code);
    setFormName(secret.name);
    setFormValue(secret.value || '');
    setFormDescription(secret.description || '');
    setModalMode('edit');
  };

  const handleSave = async () => {
    if (!formCode.trim() || !formName.trim() || !formValue.trim()) {
      Alert.alert('Error', 'Código, Nombre y Valor son requeridos.');
      return;
    }

    setLoading(true);
    try {
      const userCode = user?.username || user?.email || 'rodrychm@gmail.com';
      const payload = {
        code: formCode.toUpperCase(),
        name: formName,
        value: formValue,
        description: formDescription || null,
        vendorCode: userCode
      };

      if (modalMode === 'create') {
        await secretRepo.create(payload);
        Alert.alert('Éxito', 'Secreto creado correctamente.');
      } else if (modalMode === 'edit' && selectedSecret) {
        await secretRepo.update({
          ...payload,
          id: selectedSecret.id
        });
        Alert.alert('Éxito', 'Secreto actualizado correctamente.');
      }
      setModalMode(null);
      fetchSecrets();
    } catch (error) {
      console.error('Error saving secret:', error);
      Alert.alert('Error', 'No se pudo guardar el secreto.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Eliminar Secreto',
      '¿Está seguro de que desea eliminar este secreto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await secretRepo.delete(id);
              Alert.alert('Éxito', 'Secreto eliminado correctamente.');
              fetchSecrets();
            } catch (error) {
              console.error('Error deleting secret:', error);
              Alert.alert('Error', 'No se pudo eliminar el secreto.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <MainLayout headerTitle="Secretos" onNavigate={onNavigate}>
      {/* Back link */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity style={styles.backLink} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={Colors.muted} />
          <Text style={styles.backLinkText}>Volver</Text>
        </TouchableOpacity>

        {/* Plus Button */}
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading && secrets.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : secrets.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="key-outline" size={48} color={Colors.muted} />
          <Text style={styles.emptyText}>No hay secretos configurados.</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll}>
          {secrets.map(secret => {
            const isVisible = !!visibleSecrets[secret.id];

            return (
              <View key={secret.id} style={styles.card}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="key" size={24} color={Colors.primary} />
                </View>
                
                <View style={{ flex: 1, marginRight: Spacing.sm }}>
                  <Text style={styles.cardTitle}>{secret.name}</Text>
                  <Text style={styles.cardSubtitle}>Código: {secret.code}</Text>
                  
                  {/* Secret Value field */}
                  <View style={styles.valueRow}>
                    <Text style={styles.valueText}>
                      {isVisible ? secret.value : '••••••••••••••••'}
                    </Text>
                    <TouchableOpacity onPress={() => toggleVisibility(secret.id)} style={{ padding: 4 }}>
                      <Ionicons name={isVisible ? "eye-off" : "eye"} size={16} color={Colors.muted} />
                    </TouchableOpacity>
                  </View>

                  {secret.description && (
                    <Text style={styles.cardDescription}>{secret.description}</Text>
                  )}
                  {secret.vendorCode && (
                    <Text style={styles.vendorText}>Proveedor: {secret.vendorCode}</Text>
                  )}
                </View>

                {/* Card Actions */}
                <View style={styles.actionColumn}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(secret)}>
                    <Ionicons name="create-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(secret.id)}>
                    <Ionicons name="trash-outline" size={20} color={Colors.destructive} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Add / Edit Secret Modal */}
      <Modal
        visible={modalMode !== null}
        animationType="slide"
        onRequestClose={() => setModalMode(null)}
      >
        <View style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalMode(null)}>
              <Ionicons name="close" size={28} color={Colors.muted} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>
              {modalMode === 'create' ? 'Agregar Secreto' : 'Editar Secreto'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: Spacing.lg }}>
            <Text style={styles.inputLabel}>Código</Text>
            <TextInput
              style={styles.textInput}
              value={formCode}
              onChangeText={setFormCode}
              placeholder="e.g. API_KEY"
              placeholderTextColor={Colors.muted}
              autoCapitalize="characters"
              editable={modalMode === 'create'}
            />

            <Text style={styles.inputLabel}>Nombre</Text>
            <TextInput
              style={styles.textInput}
              value={formName}
              onChangeText={setFormName}
              placeholder="e.g. My API Credentials"
              placeholderTextColor={Colors.muted}
            />

            <Text style={styles.inputLabel}>Valor</Text>
            <TextInput
              style={styles.textInput}
              value={formValue}
              onChangeText={setFormValue}
              placeholder="Configure value"
              placeholderTextColor={Colors.muted}
              secureTextEntry
            />

            <Text style={styles.inputLabel}>Descripción</Text>
            <TextInput
              style={[styles.textInput, { height: 80 }]}
              value={formDescription}
              onChangeText={setFormDescription}
              placeholder="Descripción del secreto"
              placeholderTextColor={Colors.muted}
              multiline
            />
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
  addButton: {
    width: 36,
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
  },
  scroll: {
    flex: 1,
    marginTop: Spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
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
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: Spacing.xs,
    alignSelf: 'flex-start',
    gap: Spacing.xs,
  },
  valueText: {
    color: Colors.primary,
    fontSize: Typography.sizes.sm,
    fontFamily: 'monospace',
  },
  cardDescription: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
    marginTop: 6,
    opacity: 0.8,
  },
  vendorText: {
    color: Colors.muted,
    fontSize: Typography.sizes.xs,
    marginTop: 4,
    opacity: 0.5,
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
