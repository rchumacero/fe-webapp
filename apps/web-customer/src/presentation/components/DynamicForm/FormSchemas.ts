import { FormField } from '@/domain/models/FormField';
import { UIType, DataType } from '@/domain/constants/FormConstants';


export const FORM_SCHEMAS: Record<string, FormField[]> = {
  "F-LEG-001-SOL-AT-02": [
    {
      name: "nombre",
      label: "Nombre completo",
      uiType: UIType.TextField,
      dataType: DataType.String,
      minLength: 1,
      maxLength: 30,
      required: true
    },
    {
      name: "observation",
      label: "Observación / Comentarios",
      uiType: UIType.TextArea,
      dataType: DataType.String,
      required: false
    }
  ]
};
