import React, { useEffect, useState } from 'react';
import "@kplian/i18n";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MainLayout } from './src/shared/layout/MainLayout';
import { Colors, Spacing, Typography } from './src/shared/theme/constants';
import { AuthProvider, useAuth } from './src/shared/auth/AuthContext';
import CreateAppointmentScreen from './src/modules/crm/commercial/customer-service/presentation/screens/CreateAppointmentScreen';
import ProductScreen from './src/modules/production/presentation/screens/ProductScreen';
import ProductConfigurationScreen from './src/modules/production/presentation/screens/ProductConfigurationScreen';
import OperationUnitScreen from './src/modules/production/presentation/screens/OperationUnitScreen';
import OperationOrderScreen from './src/modules/production/presentation/screens/OperationOrderScreen';
import OperationScreen from './src/modules/production/presentation/screens/OperationScreen';
import WarehouseScreen from './src/modules/warehouse/presentation/Warehouse/WarehouseScreen';
import SalesScreen from './src/modules/crm/sales/presentation/screens/SalesScreen';
import MovementScreen from './src/modules/warehouse/presentation/Movement/MovementScreen';
import InventoryScreen from './src/modules/warehouse/presentation/Inventory/InventoryScreen';
import ParameterStructureScreen from './src/modules/parameter/presentation/screens/ParameterStructureScreen';
import ParameterSecretScreen from './src/modules/parameter/presentation/screens/ParameterSecretScreen';
import ParameterStructureVendorScreen from './src/modules/parameter/presentation/screens/ParameterStructureVendorScreen';
import ParameterCRMValuesScreen from './src/modules/parameter/presentation/screens/ParameterCRMValuesScreen';
import ParameterCustomScreen from './src/modules/parameter/presentation/screens/ParameterCustomScreen';
import MainEntityScreen from './src/modules/workflow/presentation/screens/MainEntityScreen';
import { useTranslation } from '@kplian/i18n';
import ResourceScreen from './src/modules/access/presentation/screens/ResourceScreent';
// import {ResourceScreen} from ''


// Manual login to avoid race conditions with logout and background 401s
const LoginScreen = () => {
  const { login } = useAuth();

  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.cardTitle}>Welcome to KPLIAN</Text>
      <Text style={[styles.cardSubtitle, { marginBottom: Spacing.xl }]}>Please log in to continue.</Text>
      
      <TouchableOpacity 
        style={styles.buttonPlaceholder}
        onPress={() => login()}
      >
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
    </View>
  );
};

function AppContent() {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();
  const [currentScreen, setCurrentScreen] = useState('HOME');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedModuleCode, setSelectedModuleCode] = useState('');

  const handleNavigation = (route) => {
    console.log('[Navigation] Menu route clicked:', route);
    if (route == '/access/resources'){
      setCurrentScreen('RESOURCE')
    }
    if (route === '/crm/commercial/customer-service/create' || route === 'crm/commercial/customer-service/create') {
      setCurrentScreen('APPOINTMENT');
    }
    if (route === '/production/product' || route === 'production/product') {
      setCurrentScreen('PRODUCT_SCREEN');
    }
    if (route === '/warehouse/warehouse' || route === 'warehouse/warehouse') {
      setCurrentScreen('WAREHOUSE_SCREEN');
    }
    if (route === '/crm/sales' || route === 'crm/sales') {
      setCurrentScreen('SALES_SCREEN');
    }
    if (route === '/warehouse/movement/in' || route === 'warehouse/movement/in') {
      setCurrentScreen('MOVEMENT_IN');
    }
    if (route === '/warehouse/movement/out' || route === 'warehouse/movement/out') {
      setCurrentScreen('MOVEMENT_OUT');
    }
    if (route === '/warehouse/inventory' || route === 'warehouse/inventory') {
      setCurrentScreen('INVENTORY_SCREEN');
    }
    if (route === '/parameter/structure' || route === 'parameter/structure') {
      setCurrentScreen('PARAMETER_STRUCTURE');
    }
    if (route === '/parameter/secret' || route === 'parameter/secret' || route === '/parameter/secrets' || route === 'parameter/secrets') {
      setCurrentScreen('PARAMETER_SECRET');
    }
    if (route === '/parameter/structure-vendor' || route === 'parameter/structure-vendor') {
      setCurrentScreen('PARAMETER_STRUCTURE_VENDOR');
    }
    if (route === '/crm/parameter' || route === 'crm/parameter') {
      setCurrentScreen('CRM_PARAMETER');
    }
    if (route.startsWith('/production/product/') && route.endsWith('/product-configuration')) {
      const parts = route.split('/');
      const productId = parts[3];
      setSelectedProductId(productId);
      setCurrentScreen('PRODUCT_CONFIG_SCREEN');
    }
    if (route === '/production/operation-unit' || route === 'production/operation-unit') {
      setCurrentScreen('OPERATION_UNIT_SCREEN');
    }
    if (route === '/production/operation-order' || route === 'production/operation-order') {
      setCurrentScreen('OPERATION_ORDER_SCREEN');
    }
    if (route === '/production/operation' || route === 'production/operation') {
      setCurrentScreen('OPERATION_SCREEN');
    }
    if (route.startsWith('/parameter/custom/')) {
      const parts = route.split('/');
      const mCode = parts[3];
      setSelectedModuleCode(mCode);
      setCurrentScreen('PARAMETER_CUSTOM');
    }
    if (route && (route.includes('workflow/main-entity') || route.includes('workflow/entities'))) {
      setCurrentScreen('WORKFLOW_MAIN_ENTITY');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  if(currentScreen === 'RESOURCE'){
    return<ResourceScreen onBack={() => setCurrentScreen('HOME')}/>
  }

  if (currentScreen === 'APPOINTMENT') {
    return <CreateAppointmentScreen onBack={() => setCurrentScreen('HOME')} />;
  }

  if (currentScreen === 'PRODUCT_SCREEN') {
    return <ProductScreen onBack={() => setCurrentScreen('HOME')} onNavigate={handleNavigation} />;
  }

  if (currentScreen === 'PRODUCT_CONFIG_SCREEN' && selectedProductId) {
    return <ProductConfigurationScreen productId={selectedProductId} onBack={() => setCurrentScreen('PRODUCT_SCREEN')} />;
  }

  if (currentScreen === 'OPERATION_UNIT_SCREEN') {
    return <OperationUnitScreen onBack={() => setCurrentScreen('HOME')} onNavigate={handleNavigation} />;
  }

  if (currentScreen === 'OPERATION_ORDER_SCREEN') {
    return <OperationOrderScreen onBack={() => setCurrentScreen('HOME')} onNavigate={handleNavigation} />;
  }

  if (currentScreen === 'OPERATION_SCREEN') {
    return <OperationScreen onBack={() => setCurrentScreen('HOME')} onNavigate={handleNavigation} />;
  }

  if (currentScreen === 'WAREHOUSE_SCREEN') {
    return <WarehouseScreen onBack={() => setCurrentScreen('HOME')} onNavigate={handleNavigation} />;
  }

  if (currentScreen === 'SALES_SCREEN') {
    return <SalesScreen onBack={() => setCurrentScreen('HOME')} onNavigate={handleNavigation} />;
  }

  if (currentScreen === 'MOVEMENT_IN') {
    return <MovementScreen type="in" onBack={() => setCurrentScreen('HOME')} onNavigate={handleNavigation} />;
  }

  if (currentScreen === 'MOVEMENT_OUT') {
    return <MovementScreen type="out" onBack={() => setCurrentScreen('HOME')} onNavigate={handleNavigation} />;
  }

  if (currentScreen === 'INVENTORY_SCREEN') {
    return <InventoryScreen onBack={() => setCurrentScreen('HOME')} onNavigate={handleNavigation} />;
  }

  if (currentScreen === 'PARAMETER_STRUCTURE') {
    return <ParameterStructureScreen onBack={() => setCurrentScreen('HOME')} onNavigate={handleNavigation} />;
  }

  if (currentScreen === 'PARAMETER_SECRET') {
    return <ParameterSecretScreen onBack={() => setCurrentScreen('HOME')} onNavigate={handleNavigation} />;
  }

  if (currentScreen === 'PARAMETER_STRUCTURE_VENDOR') {
    return <ParameterStructureVendorScreen onBack={() => setCurrentScreen('HOME')} onNavigate={handleNavigation} />;
  }

  if (currentScreen === 'CRM_PARAMETER') {
    return <ParameterCRMValuesScreen onBack={() => setCurrentScreen('HOME')} onNavigate={handleNavigation} />;
  }

  if (currentScreen === 'PARAMETER_CUSTOM') {
    return <ParameterCustomScreen moduleCode={selectedModuleCode} onBack={() => setCurrentScreen('HOME')} onNavigate={handleNavigation} />;
  }

  if (currentScreen === 'WORKFLOW_MAIN_ENTITY') {
    return <MainEntityScreen onBack={() => setCurrentScreen('HOME')} onNavigate={handleNavigation} />;
  }



  return (
    <MainLayout headerTitle="Dashboard" onNavigate={handleNavigation}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('common.welcome')}, {user.name}!</Text>
        <Text style={styles.cardSubtitle}>
          You are currently logged in with {user.username}.
        </Text>

        {/* <TouchableOpacity 
          style={styles.buttonPlaceholder}
          onPress={() => setCurrentScreen('APPOINTMENT')}
        >
          <Text style={styles.buttonText}>{t('common.open_crm')}</Text>
        </TouchableOpacity> */}
      </View>

      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.statCard} onPress={() => setCurrentScreen('SALES_SCREEN')}>
          <Text style={styles.statLabel}>Ventas</Text>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statName}>Este mes</Text>
        </TouchableOpacity>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Clientes</Text>
          <Text style={styles.statValue}>48</Text>
          <Text style={styles.statName}>Activos</Text>
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
