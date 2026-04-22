import React, { useEffect } from 'react';
import "@kplian/i18n";
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MainLayout } from './src/shared/layout/MainLayout';
import { Colors, Spacing, Typography } from './src/shared/theme/constants';
import { AuthProvider, useAuth } from './src/shared/auth/AuthContext';
import { useTranslation } from '@kplian/i18n';

// Auto-redirects to Zitadel immediately — no button needed
const LoginScreen = () => {
  const { login } = useAuth();

  useEffect(() => {
    // Trigger login automatically as soon as this screen mounts
    login();
  }, []);

  // Show a minimal loading state while the Zitadel window opens
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.loadingText}>Redirecting to login...</Text>
    </View>
  );
};

function AppContent() {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();

  if (isLoading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <MainLayout headerTitle="Dashboard">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('common.welcome')}, {user.name}!</Text>
        <Text style={styles.cardSubtitle}>
          You are currently logged in with {user.username}.
        </Text>
        
        <View style={styles.buttonPlaceholder}>
          <Text style={styles.buttonText}>{t('common.open_crm')}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statLabel, { color: Colors.success }]}>+2.6% {t('common.last_week')}</Text>
          <Text style={styles.statValue}>765</Text>
          <Text style={styles.statName}>{t('common.products_sold')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statLabel, { color: Colors.destructive }]}>-0.1% {t('common.last_week')}</Text>
          <Text style={styles.statValue}>18,765</Text>
          <Text style={styles.statName}>{t('common.total_balance')}</Text>
        </View>
      </View>
    </MainLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1c2e40', // Deep emerald/navy mix
    padding: Spacing.lg,
    borderRadius: 24,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardTitle: {
    color: '#fff',
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
  },
  cardSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: Typography.sizes.md,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  buttonPlaceholder: {
    alignSelf: 'flex-start',
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
  },
  buttonText: {
    color: Colors.sidebar,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    marginBottom: 4,
  },
  statValue: {
    color: Colors.foreground,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  statName: {
    color: Colors.muted,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.muted,
    fontSize: Typography.sizes.md,
    marginTop: Spacing.md,
  },
});
