import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { Colors, Spacing, Typography } from '../theme/constants';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BottomActionsProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const TABS = [
  { id: 'dashboard', label: 'Home', iconName: 'Layout' },
  { id: 'calendar', label: 'Calendar', iconName: 'Calendar' },
  { id: 'add', label: 'Add', iconName: 'PlusCircle', isSpecial: true },
  { id: 'reports', label: 'Reports', iconName: 'BarChart' },
  { id: 'settings', label: 'Settings', iconName: 'Settings' },
];

export const BottomActions = ({ activeTab = 'dashboard', onTabChange }: BottomActionsProps) => {
  return (
    <View style={styles.blurContainer}>
      <SafeAreaView edges={['bottom']} style={styles.container}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.7}
            style={[styles.tab, tab.isSpecial && styles.specialTabContainer]}
            onPress={() => onTabChange?.(tab.id)}
          >
            {tab.isSpecial ? (
              <View style={styles.specialTab}>
                {/* Plus Icon Placeholder */}
                <View style={styles.plusH} />
                <View style={styles.plusV} />
              </View>
            ) : (
              <View style={styles.itemWrapper}>
                <View 
                  style={[ 
                    styles.iconCircle, 
                    activeTab === tab.id && styles.activeIconCircle 
                  ]} 
                />
                <Text 
                  style={[ 
                    styles.label, 
                    activeTab === tab.id && styles.activeLabel 
                  ]}
                >
                  {tab.label}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(20, 26, 41, 0.95)', // Glass effect
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  container: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 84 : 64,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  tab: {
    padding: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  itemWrapper: {
    alignItems: 'center',
    gap: 4,
  },
  iconCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: Colors.muted,
      opacity: 0.6,
  },
  activeIconCircle: {
      borderColor: Colors.primary,
      opacity: 1,
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  label: {
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
    fontWeight: Typography.weights.medium,
  },
  activeLabel: {
    color: Colors.primary,
  },
  specialTabContainer: {
    marginTop: -40,
  },
  specialTab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#141a29',
  },
  plusH: {
    width: 20,
    height: 3,
    backgroundColor: '#141a29',
    position: 'absolute',
  },
  plusV: {
    width: 3,
    height: 20,
    backgroundColor: '#141a29',
    position: 'absolute',
  },
});
