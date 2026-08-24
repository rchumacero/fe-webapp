import React from 'react';
import { Input } from '@/components/ui/input';
import { UIType } from '@/domain/constants/FormConstants';
import { FormField } from '@/domain/models/FormField';


interface FieldFactoryProps {
  field: FormField;
  control: any;
  error?: { message?: string };
}

const FieldFactory: React.FC<FieldFactoryProps> = ({ field, control, error }) => {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
        {field.label}
        {field.required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      
      {field.uiType === UIType.TextArea ? (
        <textarea
          value={control.value || ''}
          onChange={control.onChange}
          rows={3}
          className="flex w-full rounded-md border border-border/50 bg-card/30 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all resize-none"
        />
      ) : (
        <Input
          type={
            field.uiType === UIType.NumberField ? 'number' :
            field.uiType === UIType.DateField ? 'date' :
            field.uiType === UIType.Password ? 'password' :
            field.uiType === UIType.Email ? 'email' :
            field.uiType === UIType.Phone ? 'tel' : 'text'
          }
          value={control.value || ''}
          onChange={control.onChange}
          className={error ? 'border-destructive focus-visible:ring-destructive/20 h-11 bg-card/30' : 'h-11 bg-card/30'}
        />
      )}
      
      {error && <p className="text-[10px] text-destructive font-medium ml-1">{error.message}</p>}
    </div>
  );
};

export default FieldFactory;
