import React, { useMemo } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import FieldFactory from './FieldFactory';
import { UIType, DataType } from '@/domain/constants/FormConstants';
import { FormField } from '@/domain/models/FormField';


type DynamicFormProps = {
  definition: FormField[];
  onSubmit: (data: any) => Promise<void> | void;
  defaultValues?: Record<string, any>;
  modal?: boolean; // default false
  submitLabel?: string;
  triggerLabel?: string; // label for button that opens modal
};

const buildSchema = (fields: FormField[]) => {
  const shape: Record<string, any> = {};
  fields.forEach((field) => {
    let schema = undefined;
    switch (field.dataType) {
      case DataType.String:
        schema = z.string();
        if ((field as any).minLength !== undefined) schema = schema.min((field as any).minLength);
        if ((field as any).maxLength !== undefined) schema = schema.max((field as any).maxLength);
        break;
      case DataType.Numeric:
        schema = z.coerce.number();
        if ((field as any).minValue !== undefined) schema = schema.min((field as any).minValue);
        if ((field as any).maxValue !== undefined) schema = schema.max((field as any).maxValue);
        break;
      case DataType.Date:
        schema = z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' });
        if ((field as any).minValue) schema = schema.refine((val) => new Date(val) >= new Date((field as any).minValue), { message: 'Date too early' });
        if ((field as any).maxValue) schema = schema.refine((val) => new Date(val) <= new Date((field as any).maxValue), { message: 'Date too late' });
        break;
      case DataType.Parameter:
        schema = z.string();
        break;
      default:
        schema = z.any();
    }
    if (field.required) schema = schema.refine((v) => v !== '' && v !== null && v !== undefined, { message: `${field.label} is required` });
    shape[field.name] = schema;
  });
  return z.object(shape);
};

const DynamicForm: React.FC<DynamicFormProps> = ({ definition, onSubmit, defaultValues = {}, modal = false, submitLabel = 'Submit', triggerLabel = 'Open Form' }) => {
  const schema = useMemo(() => buildSchema(definition), [definition]);
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
  });

  const renderForm = (
    <form onSubmit={handleSubmit(onSubmit as SubmitHandler<any>)} className="space-y-4">
      {definition.map((field) => (
        <Controller
          key={field.name}
          name={field.name}
          control={control}
          render={({ field: ctrl }) => (
            <FieldFactory field={field} control={ctrl} error={errors[field.name] as any} />
          )}
        />
      ))}
      <Button type="submit">{submitLabel}</Button>
    </form>
  );

  if (modal) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">{triggerLabel}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{triggerLabel}</DialogTitle>
            <DialogDescription>Fill the required fields</DialogDescription>
          </DialogHeader>
          {renderForm}
        </DialogContent>
      </Dialog>
    );
  }

  return renderForm;
};

export default DynamicForm;

