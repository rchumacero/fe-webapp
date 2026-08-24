import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  Pressable,
  TextInput
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme/constants';
import { getFriendlyTimeZones, FriendlyTimeZone } from '@kplian/core';

interface TimezonePickerProps {
  visible: boolean;
  onClose: () => void;
  selectedTimezone: string;
  onSelect: (timezone: string) => void;
}

export const TimezonePicker = ({ visible, onClose, selectedTimezone, onSelect }: TimezonePickerProps) => {
  const [search, setSearch] = useState('');
  const allTimezones = getFriendlyTimeZones();

  const filtered = allTimezones.filter(tz => 
    tz.label.toLowerCase().includes(search.toLowerCase()) ||
    tz.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Timezone</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by city or country..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.name}
            initialNumToRender={15}
            windowSize={5}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[
                  styles.item,
                  selectedTimezone === item.name && styles.activeItem
                ]} 
                onPress={() => {
                  onSelect(item.name);
                  onClose();
                }}
              >
                <View style={styles.itemMain}>
                  <Text style={[
                      styles.itemLabel,
                      selectedTimezone === item.name && styles.activeText
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                </View>
                <Text style={styles.itemOffset}>{item.abbreviation}</Text>
              </TouchableOpacity>
            )}
            removeClippedSubviews={true}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  content: {
    height: '80%',
    backgroundColor: Colors.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    color: '#fff',
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  closeBtn: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.md,
  },
  searchContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    height: 48,
    color: '#fff',
    fontSize: Typography.sizes.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  activeItem: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  itemMain: {
    flex: 1,
    marginRight: Spacing.md,
  },
  itemLabel: {
    color: '#fff',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    marginBottom: 2,
  },
  activeText: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  itemName: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  itemOffset: {
    color: Colors.muted,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
});
