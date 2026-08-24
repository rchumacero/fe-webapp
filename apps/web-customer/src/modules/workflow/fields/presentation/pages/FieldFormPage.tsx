"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@kplian/i18n';
import { FIELD_CONSTANTS } from '../../constants/field-constants';
import { FIELD_ROUTES } from '../../routes/field-routes';
import { FieldRepositoryImpl } from '../../infrastructure/FieldRepositoryImpl';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Save, X, ArrowLeft, Loader2, Info, Sliders } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

const fieldRepository = new FieldRepositoryImpl();

const fieldValidationSchema = z.object({
  code: z.string().min(1, "Code is required").max(50, "Code is too long"),
  name: z.string().min(2, "Name is required").max(100, "Name is too long"),
  formId: z.string().min(1, "Form link is required"),
  config: z.string().optional().or(z.literal('')),
  orderField: z.number().int("Order must be an integer").min(1, "Order must be 1 or higher"),
  status: z.string().min(1, "Status is required"),
});

type FieldFormData = z.infer<typeof fieldValidationSchema>;

interface FieldFormProps {
  id?: string;
}

export default function FieldFormPage({ id }: FieldFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const formIdParam = searchParams.get('formId');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FieldFormData>({
    resolver: zodResolver(fieldValidationSchema),
    defaultValues: {
      code: '',
      name: '',
      formId: formIdParam || '',
      config: '',
      orderField: 1,
      status: 'ACTIVE',
    }
  });

  // Pre-fill formId once formIdParam is parsed (only when creating a new field)
  useEffect(() => {
    if (formIdParam && !id) {
      setValue('formId', formIdParam, { shouldDirty: false });
    }
  }, [formIdParam, id, setValue]);

  // Load existing field data if id is provided (editing mode)
  useEffect(() => {
    if (id) {
      const fetchField = async () => {
        setIsLoading(true);
        try {
          const field = await fieldRepository.getById(id);
          reset({
            code: field.code || '',
            name: field.name || '',
            formId: field.formId || '',
            config: field.config || '',
            orderField: field.orderField || 1,
            status: field.status || 'ACTIVE',
          });
        } catch (error) {
          console.error("Error loading field parameters:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchField();
    }
  }, [id, reset]);

  const onSubmit: SubmitHandler<FieldFormData> = async (formData) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await fieldRepository.update({
          ...formData,
          id,
        });
      } else {
        await fieldRepository.create(formData);
      }
      
      // Return to fields list matching the selected form
      const returnUrl = formData.formId 
        ? `${FIELD_CONSTANTS.ROUTES.FIELD}?formId=${formData.formId}` 
        : FIELD_CONSTANTS.ROUTES.FIELD;
      router.push(returnUrl);
      router.refresh();
    } catch (error) {
      console.error("Error saving validation field:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    if (isDirty) {
      e.preventDefault();
      setShowConfirmCancel(true);
      return;
    }
    const returnUrl = formIdParam 
      ? `${FIELD_CONSTANTS.ROUTES.FIELD}?formId=${formIdParam}` 
      : FIELD_CONSTANTS.ROUTES.FIELD;
    router.push(returnUrl);
  };

  const confirmCancel = () => {
    setShowConfirmCancel(false);
    const returnUrl = formIdParam 
      ? `${FIELD_CONSTANTS.ROUTES.FIELD}?formId=${formIdParam}` 
      : FIELD_CONSTANTS.ROUTES.FIELD;
    router.push(returnUrl);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-border/10 pb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="rounded-full hover:bg-accent/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              {id ? t(FIELD_CONSTANTS.EDIT_TITLE) || 'Edit Field' : t(FIELD_CONSTANTS.CREATE_TITLE) || 'Create Field'}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {id 
                ? 'Update properties, validation orders, or parameters on this schema field.' 
                : 'Configure a new dynamic input field associated with a form layout.'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Grid Layout */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-border/40 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm h-full">
            <CardContent className="p-8 space-y-8">
              
              {/* Row 1: Code and Order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Code Identifier
                  </label>
                  <Input 
                    {...register("code")} 
                    placeholder="e.g. FIRST_NAME" 
                    className={errors.code ? "border-destructive focus-visible:ring-destructive/20 h-11 bg-card/30" : "h-11 bg-card/30"} 
                  />
                  {errors.code && <p className="text-[10px] text-destructive font-medium ml-1">{errors.code.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Display Order Index
                  </label>
                  <Input 
                    type="number" 
                    {...register("orderField", { valueAsNumber: true })} 
                    placeholder="e.g. 1" 
                    className={errors.orderField ? "border-destructive focus-visible:ring-destructive/20 h-11 bg-card/30" : "h-11 bg-card/30"} 
                  />
                  {errors.orderField && <p className="text-[10px] text-destructive font-medium ml-1">{errors.orderField.message}</p>}
                </div>
              </div>

              {/* Row 2: Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Field Label / Name
                </label>
                <Input 
                  {...register("name")} 
                  placeholder="e.g. Full Name" 
                  className={errors.name ? "border-destructive focus-visible:ring-destructive/20 h-11 bg-card/30" : "h-11 bg-card/30"} 
                />
                {errors.name && <p className="text-[10px] text-destructive font-medium ml-1">{errors.name.message}</p>}
              </div>

              {/* Row 3: Status */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Status
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="flex h-11 w-full rounded-md border border-border/50 bg-card/30 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer font-medium"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  )}
                />
                {errors.status && <p className="text-[10px] text-destructive font-medium ml-1">{errors.status.message}</p>}
              </div>

              {/* Row 4: Config details */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Validation & rendering constraints (JSON format)
                </label>
                <textarea
                  {...register("config")}
                  placeholder='e.g. { "type": "text", "required": true, "maxLength": 100 }'
                  rows={5}
                  className="flex w-full rounded-md border border-border/50 bg-card/30 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-mono resize-none"
                />
                {errors.config && <p className="text-[10px] text-destructive font-medium ml-1">{errors.config.message}</p>}
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5 shadow-xl border-dashed">
            <CardHeader>
              <CardTitle className="text-base font-bold text-primary flex items-center gap-2">
                <Sliders size={18} />
                Field Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-xs border-b border-border/5 pb-2">
                <span className="text-muted-foreground">Modified:</span>
                <span className={isDirty ? "text-amber-500 font-bold" : "text-emerald-500 font-bold"}>
                  {isDirty ? "YES" : "NO"}
                </span>
              </div>
              <div className="flex gap-2.5 text-xs text-muted-foreground leading-relaxed pt-2">
                <Info size={16} className="text-primary shrink-0" />
                <span>
                  Configure types like text, checkbox, options list, or custom regular expression matches in the JSON field.
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-6 pb-8 px-6 border-t border-border/5">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 h-12 font-bold transition-all duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                {t('common.save') || 'Save'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all h-12 font-bold"
                onClick={handleCancel}
              >
                <X className="mr-2 h-5 w-5" />
                {t('common.cancel') || 'Cancel'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>

      {/* Confirmation Dialog on Cancel */}
      <ConfirmDialog
        open={showConfirmCancel}
        onOpenChange={setShowConfirmCancel}
        title="Discard Changes?"
        description="You have unsaved field modifications. Are you sure you want to discard your edits and return to the list?"
        confirmText={t('common.confirm') || 'Discard'}
        cancelText={t('common.cancel') || 'Keep Editing'}
        onConfirm={confirmCancel}
        type="warning"
      />
    </div>
  );
}
