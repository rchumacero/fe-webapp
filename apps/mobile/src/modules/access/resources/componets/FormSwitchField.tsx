import { Text, Switch, View } from 'react-native';
import { styles } from '../styles';
import { Colors } from '../../../../shared/theme/constants';

interface FormSwitchFieldProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function FormSwitchField({ label, value, onValueChange }: FormSwitchFieldProps) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.muted, true: Colors.primary }}
      />
    </View>
  );
}