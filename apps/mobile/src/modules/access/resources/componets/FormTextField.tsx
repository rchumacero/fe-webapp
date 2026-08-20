import { Text, TextInput } from 'react-native';
import { styles } from '../styles';
import { Colors } from '../../../../shared/theme/constants';
import React from 'react';

interface FormTextFieldProps {
	label: string;
	value: string;
	placeholder: string;
	multiline?: boolean;
	onChangeText: (text: string) => void;
}
export const FormTextField = React.memo(function FormTextField({
	label,
	value,
	onChangeText,
	placeholder,
	multiline,
}: FormTextFieldProps) {
	return (
		<>
			<Text style={styles.inputLabel}>{label}</Text>

			<TextInput
				style={[styles.textInput, multiline && styles.textArea]}
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor={Colors.muted}
				multiline={multiline}
				numberOfLines={multiline ? 4 : undefined}
			/>
		</>
	);
});