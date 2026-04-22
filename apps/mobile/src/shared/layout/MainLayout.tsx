import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, StatusBar } from 'react-native';
import { Header } from './Header';
import { Drawer } from './Drawer';
import { BottomActions } from './BottomActions';
import { Colors, Spacing } from '../theme/constants';
import { SafeAreaProvider } from 'react-native-safe-area-context';

interface MainLayoutProps {
  children: React.ReactNode;
  headerTitle?: string;
}

export const MainLayout = ({ children, headerTitle }: MainLayoutProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    // Potential navigation logic here
  }, []);

  return (
    <SafeAreaProvider style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      <View style={styles.contentWrapper}>
        {/* Top Navigation */}
        <Header onMenuToggle={toggleDrawer} title={headerTitle} />

        {/* Scrollable Main Area */}
        <ScrollView 
          style={styles.main}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        {/* Bottom Navigation */}
        <BottomActions activeTab={activeTab} onTabChange={handleTabChange} />
      </View>

      {/* Side Navigation (Drawer) */}
      <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} />
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentWrapper: {
    flex: 1,
  },
  main: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 120, // Space for the bottom bar and floating button
  },
});
