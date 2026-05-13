import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Animated, 
  Dimensions, 
  Pressable 
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme/constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMenuByUser, MenuItem } from '@kplian/core';
import { useAuth } from '../auth/AuthContext';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.82;

export const Drawer = ({ isOpen, onClose }: DrawerProps) => {
  const { user, logout } = useAuth();
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [translateX] = useState(new Animated.Value(-DRAWER_WIDTH));
  const [backdropOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchMenu = async () => {
      if (user?.username) {
        const data = await getMenuByUser(user.username);
        setMenuData(data);
      }
    };
    fetchMenu();
  }, [user]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: isOpen ? 0 : -DRAWER_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: isOpen ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, [isOpen]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = (item.children?.length ?? 0) > 0;
    const isExpanded = !!expandedItems[item.id];
    const isUserMenu = item.groupLabel?.toLowerCase().includes('user');
    const isActive = false; // Placeholder for navigation state

    return (
      <View key={item.id}>
        <TouchableOpacity 
          style={[
            styles.menuItem,
            { paddingLeft: Spacing.md + (level * 20) },
            isActive && styles.menuItemActive
          ]}
          onPress={hasChildren ? () => toggleExpand(item.id) : undefined}
        >
          {/* Icon Placeholder (Circle like radio button style) */}
          <View style={[styles.iconWrapper, isUserMenu && styles.userMenuIcon]}>
            <View style={[styles.iconCircle, isActive && styles.iconCircleActive]} />
          </View>
          
          <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]} numberOfLines={1}>
            {item.label}
          </Text>

          {hasChildren && (
            <View style={[styles.chevron, isExpanded && styles.chevronRotated]} />
          )}
        </TouchableOpacity>

        {hasChildren && isExpanded && (
          <View style={styles.childrenContainer}>
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </View>
        )}
      </View>
    );
  };

  // Grouping logic (simplified)
  const grouped = menuData.reduce((acc, item) => {
    const label = item.groupLabel || 'Navigation';
    if (!acc[label]) acc[label] = [];
    acc[label].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  if (!isOpen && translateX._value === -DRAWER_WIDTH) return null;

  return (
    <View 
      style={styles.overlay} 
      pointerEvents={isOpen ? "auto" : "none"}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View 
          style={[
            StyleSheet.absoluteFill, 
            { 
              backgroundColor: 'rgba(0,0,0,0.5)', 
              opacity: backdropOpacity 
            }
          ]} 
        />
      </Pressable>
      
      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        <SafeAreaView style={styles.container}>
          {/* Drawer Header */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoInitial}>K</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.brand}>KPLIAN CRM</Text>
              <Text style={styles.version}>v.1.0.4</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Search Placeholder */}
          <TouchableOpacity style={styles.searchBar}>
            <View style={styles.searchDot} />
            <Text style={styles.searchText}>Search menu...</Text>
          </TouchableOpacity>

          <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
            {Object.keys(grouped).map(label => (
              <View key={label} style={styles.section}>
                <Text style={styles.sectionLabel}>{label.toUpperCase()}</Text>
                {grouped[label].map(item => renderMenuItem(item))}
              </View>
            ))}
          </ScrollView>

          {/* Drawer Footer */}
          <View style={styles.footer}>
             <TouchableOpacity style={styles.footerButton}>
               <View style={styles.footerIcon} />
               <Text style={styles.footerText}>Settings</Text>
             </TouchableOpacity>
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={async () => {
                  onClose();
                  await logout();
                }}
              >
                <Text style={styles.logoutText}>Log out</Text>
              </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: Colors.sidebar,
    shadowColor: '#000',
    shadowOffset: { width: 10, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInitial: {
    color: Colors.sidebar,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  headerText: {
    gap: 2,
  },
  brand: {
    color: Colors.foreground,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  version: {
    color: Colors.muted,
    fontSize: Typography.sizes.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  searchBar: {
    margin: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Colors.muted,
  },
  searchText: {
    color: Colors.muted,
    fontSize: Typography.sizes.md,
  },
  menuScroll: {
    flex: 1,
  },
  section: {
    paddingVertical: Spacing.sm,
  },
  sectionLabel: {
    paddingHorizontal: Spacing.lg,
    color: Colors.muted,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
    opacity: 0.5,
  },
  menuItem: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingRight: Spacing.md,
    borderRadius: 8,
    marginHorizontal: Spacing.sm,
  },
  menuItemActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  iconWrapper: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 14,
    height: 14,
    borderRadius: 7, // Radio style
    borderWidth: 1.5,
    borderColor: Colors.muted,
    opacity: 0.6,
  },
  iconCircleActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
    opacity: 1,
  },
  userMenuIcon: {
    // Round for user menu
  },
  menuLabel: {
    flex: 1,
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    opacity: 0.8,
  },
  menuLabelActive: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
    opacity: 1,
  },
  chevron: {
    width: 8,
    height: 8,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: Colors.muted,
    transform: [{ rotate: '45deg' }],
    marginRight: 4,
    opacity: 0.5,
  },
  chevronRotated: {
    transform: [{ rotate: '225deg' }],
    marginTop: 6,
  },
  childrenContainer: {
    paddingVertical: 2,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  footerIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.muted,
  },
  footerText: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
  },
  logoutButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  logoutText: {
    color: Colors.destructive,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
});
