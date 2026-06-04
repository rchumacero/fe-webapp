export interface FormFieldBase {
  name: string;
  label: string;
  uiType: UIType;
  dataType: DataType;
  required?: boolean;
}

export interface TextField extends FormFieldBase {
  uiType: UIType.TextField | UIType.Password | UIType.Email | UIType.Phone;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
}

export interface TextAreaField extends FormFieldBase {
  uiType: UIType.TextArea;
  minLength?: number;
  maxLength?: number;
}

export interface NumberField extends FormFieldBase {
  uiType: UIType.NumberField;
  minValue?: number;
  maxValue?: number;
}

export interface DateField extends FormFieldBase {
  uiType: UIType.DateField;
  minValue?: string; // ISO date string
  maxValue?: string;
}

export interface AutocompleteField extends FormFieldBase {
  uiType: UIType.Autocomplete;
  options: { value: string; label: string }[];
}

export interface ParameterField extends FormFieldBase {
  uiType: UIType.ParameterField;
  code: string; // parameter code used to fetch options
}

type FormField =
  | TextField
  | TextAreaField
  | NumberField
  | DateField
  | AutocompleteField
  | ParameterField;

export { FormField };
