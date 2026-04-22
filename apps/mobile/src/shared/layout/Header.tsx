import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { Colors, Spacing, Typography } from '../theme/constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { useTranslation, getLanguageFlag } from '@kplian/i18n';
import { useLanguages } from '../hooks/use-languages';
import { LanguagePicker } from '../components/LanguagePicker';
import { TimezonePicker } from '../components/TimezonePicker';
import { getFriendlyTimeZones } from '@kplian/core';

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
}

export const Header = ({ onMenuToggle, title = 'KPLIAN' }: HeaderProps) => {
  const [pickerVisible, setPickerVisible] = React.useState(false);
  const [tzPickerVisible, setTzPickerVisible] = React.useState(false);
  const [timezone, setTimezone] = React.useState('UTC');
  
  const { user } = useAuth();
  const { i18n } = useTranslation();
  
  const allTimezones = getFriendlyTimeZones();
  const currentTz = allTimezones.find(tz => tz.name === timezone) || { offset: 'UTC' };
  
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || (user?.username ? user.username[0].toUpperCase() : 'U');

  const currentFlag = getLanguageFlag(i18n.language);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <LanguagePicker 
          visible={pickerVisible} 
          onClose={() => setPickerVisible(false)} 
        />
        <TimezonePicker
          visible={tzPickerVisible}
          onClose={() => setTzPickerVisible(false)}
          selectedTimezone={timezone}
          onSelect={setTimezone}
        />
        {/* Left: Avatar / Menu Toggle */}
        <TouchableOpacity onPress={onMenuToggle} style={styles.menuButton}>
          <View style={styles.logoContainer}>
             <View style={styles.initialsContainer}>
                <Text style={styles.initialsText}>{initials}</Text>
             </View>
          </View>
        </TouchableOpacity>

        {/* Center: Title / Profile Name */}
        <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>{user?.name || title}</Text>
        </View>

        {/* Right: Actions */}
        <View style={styles.actions}>
           <TouchableOpacity 
             style={styles.actionIcon}
             onPress={() => setPickerVisible(true)}
           >
             <Text style={{ fontSize: 20 }}>{currentFlag}</Text>
           </TouchableOpacity>

           <TouchableOpacity 
              style={[styles.actionIcon, { width: 'auto', paddingHorizontal: 10 }]}
              onPress={() => setTzPickerVisible(true)}
           >
             <Text style={{ fontSize: 18, marginRight: 4 }}>🕒</Text>
             <Text style={{ fontSize: 10, color: Colors.muted, fontWeight: 'bold' }}>
               {currentTz.offset}
             </Text>
           </TouchableOpacity>

           <TouchableOpacity style={styles.actionIcon}>
             {/* Placeholder for Bell Icon */}
             <View style={styles.dot} />
             <View style={styles.dotContainer}>
               <Text style={styles.badgeText}>2</Text>
             </View>
           </TouchableOpacity>
           
           <TouchableOpacity style={styles.profileButton}>
              <View style={styles.profilePlaceholder}>
                 <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{initials}</Text>
              </View>
           </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.background,
  },
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
  },
  menuButton: {
    padding: Spacing.xs,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    color: Colors.sidebar,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: Colors.sidebar,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  titleContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  title: {
    color: Colors.foreground,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.muted,
  },
  dotContainer: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.destructive,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  profileButton: {
    marginLeft: Spacing.xs,
  },
  profilePlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#334155',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
