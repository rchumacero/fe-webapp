import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  Pressable 
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme/constants';
import { useLanguages } from '../hooks/use-languages';
import { useTranslation } from '@kplian/i18n';

interface LanguagePickerProps {
  visible: boolean;
  onClose: () => void;
}

export const LanguagePicker = ({ visible, onClose }: LanguagePickerProps) => {
  const { languages } = useLanguages();
  const { i18n } = useTranslation();

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRestart={() => onClose()}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.content}>
          <Text style={styles.title}>Select Language</Text>
          <View style={styles.divider} />
          <FlatList
            data={languages}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[
                  styles.item,
                  i18n.language === item.code && styles.activeItem
                ]} 
                onPress={() => handleSelect(item.code)}
              >
                <Text style={styles.flag}>{item.flag}</Text>
                <Text style={[
                  styles.label,
                  i18n.language === item.code && styles.activeLabel
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    color: '#fff',
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.xs,
    gap: Spacing.md,
  },
  activeItem: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  flag: {
    fontSize: 24,
  },
  label: {
    color: Colors.muted,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
  },
  activeLabel: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
});
