import { View } from 'react-native';
import { FormTextField } from './FormTextField';
import { FormDropdownField } from './FormDropdownField';
import { FormSwitchField } from './FormSwitchField';
import { styles } from '../styles';
import { ResourceFormState } from '../../presentation/screens/ResourceScreent';
import { getParamLabel } from '../utils';
import { Option } from '../types';

interface ResourceCreateFormProps {
  form: ResourceFormState;
  updateField: (field: keyof ResourceFormState, value: string | boolean) => void;
  typeOptions: Option[];
  moduleOptions: Option[];
  menuOptions: Option[];
  openDropdownPicker: (title: string, options: Option[], value: string, field: keyof ResourceFormState) => void;
}

export function ResourceCreateForm({
  form,
  updateField,
  typeOptions,
  moduleOptions,
  menuOptions,
  openDropdownPicker,
}: ResourceCreateFormProps) {

  return (
    <View style={styles.formGroup}>
      <FormTextField
        label="Code"
        value={form.code}
        onChangeText={(v) => updateField('code', v)}
        placeholder="Resource Code"
      />

      <FormTextField
        label="Name"
        value={form.name}
        onChangeText={(v) => updateField('name', v)}
        placeholder="Resource Name"
      />

      <FormTextField
        label="Description"
        value={form.description}
        onChangeText={(v) => updateField('description', v)}
        placeholder="Resource Description"
        multiline
      />

      <FormDropdownField
        label="Type"
        value={getParamLabel(typeOptions, form.type)}
        options={typeOptions}
        placeholder="Select Type..."
        onPress={() => openDropdownPicker('Select Type', typeOptions, form.type, 'type')}
      />

      <FormDropdownField
        label="Module"
        value={getParamLabel(moduleOptions, form.moduleCode)}
        options={moduleOptions}
        placeholder="Select Module..."
        onPress={() => openDropdownPicker('Select Module', moduleOptions, form.moduleCode, 'moduleCode')}
      />

      <FormDropdownField
        label="Menu"
        value={getParamLabel(menuOptions, form.menuId)}
        options={menuOptions}
        placeholder="Select Menu..."
        onPress={() => openDropdownPicker('Select Menu', menuOptions, form.menuId, 'menuId')}
      />

      <FormTextField
        label="Endpoint"
        value={form.endpoint}
        onChangeText={(v) => updateField('endpoint', v)}
        placeholder="/api/v1/resource"
      />

      <FormSwitchField
        label="Restricted"
        value={form.restricted}
        onValueChange={(v) => updateField('restricted', v)}
      />
    </View>
  );
}