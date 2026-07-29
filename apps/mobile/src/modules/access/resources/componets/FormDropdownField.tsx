import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';
import { Colors } from '../../../../shared/theme/constants';

interface Option {
	code: string;
	label: string;
}

const getParamLabel = (data: any[], val: string) => {
	const item = data.find(i => i.CODE === val);
	return item ? item.name : val;
};

interface FormDropdownFieldProps {
	label: string;
	value: string;
	options: Option[];
	placeholder: string;
	onPress: () => void;
}

export function FormDropdownField({ label, value, options, placeholder, onPress }: FormDropdownFieldProps) {
	return (
		<>
			<Text style={styles.inputLabel}>{label}</Text>
			<TouchableOpacity style={styles.dropdownTrigger} onPress={onPress}>
				<Text style={styles.dropdownValue}>
					{getParamLabel(options, value) || placeholder}
				</Text>
				<Ionicons name="chevron-down" size={20} color={Colors.muted} />
			</TouchableOpacity>
		</>
	);
}