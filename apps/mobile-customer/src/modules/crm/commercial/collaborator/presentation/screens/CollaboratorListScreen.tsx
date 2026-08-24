import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from '@kplian/i18n';
import { MainLayout } from '../../../../../../shared/layout/MainLayout';
import { Colors, Spacing, Typography } from '../../../../../../shared/theme/constants';
import { CollaboratorRepositoryImpl } from '@kplian/infrastructure';
import { Collaborator } from '@kplian/core';
import { COLLABORATOR_CONSTANTS } from '../../constants/collaborator-constants';
import { Ionicons } from '@expo/vector-icons';

const collaboratorRepo = new CollaboratorRepositoryImpl();

interface CollaboratorListScreenProps {
  commercialProductId: string;
  onBack: () => void;
}

export default function CollaboratorListScreen({ commercialProductId, onBack }: CollaboratorListScreenProps) {
  const { t } = useTranslation();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!commercialProductId) return;

    const fetchCollaborators = async () => {
      setLoading(true);
      try {
        const data = await collaboratorRepo.getByCommercialProductId(commercialProductId);
        setCollaborators(data);
      } catch (error) {
        console.error('Error fetching collaborators:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollaborators();
  }, [commercialProductId]);

  return (
    <MainLayout headerTitle={t(COLLABORATOR_CONSTANTS.TITLE, 'Collaborators')}>
      <TouchableOpacity style={styles.backLink} onPress={onBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.muted} />
        <Text style={styles.backLinkText}>Volver</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>{t(COLLABORATOR_CONSTANTS.LIST_TITLE, 'Collaborators List')}</Text>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : collaborators.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color={Colors.muted} />
          <Text style={styles.emptyText}>No hay colaboradores para este producto</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll}>
          {collaborators.map((collab) => (
            <View key={collab.id} style={styles.card}>
              <View style={styles.headerRow}>
                <View style={styles.avatarContainer}>
                  <Ionicons name="person" size={24} color={Colors.primary} />
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.employeeId}>{collab.employeeId}</Text>
                  <Text style={styles.typeText}>{collab.type || 'Standard'}</Text>
                </View>
                <View style={[
                  styles.statusBadge, 
                  collab.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive
                ]}>
                  <Text style={styles.statusText}>{collab.status}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailsContainer}>
                {collab.feeAmount !== null && collab.feeAmount !== undefined && (
                  <View style={styles.detailRow}>
                    <Ionicons name="cash-outline" size={16} color={Colors.primary} />
                    <Text style={styles.detailLabel}>Tarifa:</Text>
                    <Text style={styles.detailValue}>
                      {collab.feeAmount} {collab.currencyCode || ''}
                    </Text>
                  </View>
                )}

                {collab.appointmentTime && (
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color={Colors.primary} />
                    <Text style={styles.detailLabel}>Tiempo:</Text>
                    <Text style={styles.detailValue}>
                      {collab.appointmentTime} {collab.unitMeasureCode || 'MIN'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </MainLayout>
  );
}

const styles = StyleSheet.create({
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
  sectionTitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
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
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  employeeId: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: 'bold',
  },
  typeText: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  statusText: {
    color: Colors.foreground,
    fontSize: Typography.sizes.xs,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  detailsContainer: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailLabel: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
    width: 60,
  },
  detailValue: {
    color: Colors.foreground,
    fontSize: Typography.sizes.sm,
    fontWeight: 'medium',
  },
});
