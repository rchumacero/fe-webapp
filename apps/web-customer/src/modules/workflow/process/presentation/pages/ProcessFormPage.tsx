"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@kplian/i18n';
import { PROCESS_CONSTANTS } from '../../constants/process-constants';
import { PROCESS_ROUTES } from '../../routes/process-routes';
import { ProcessRepositoryImpl } from '../../infrastructure/ProcessRepositoryImpl';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Save, X, ArrowLeft, Loader2, Info, LayoutTemplate, Layers, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useVendor } from '@/hooks/use-vendor';

const processRepository = new ProcessRepositoryImpl();

const processValidationSchema = z.object({
  code: z.string().min(1, "Code is required").max(50, "Code is too long"),
  name: z.string().min(2, "Name is required").max(100, "Name is too long"),
  vendorCode: z.string().min(1, "Vendor Code is required"),
  moduleCode: z.string().min(1, "Module Code is required"),
  description: z.string().optional().or(z.literal('')),
  status: z.string().min(1, "Status is required"),
});

type ProcessFormData = z.infer<typeof processValidationSchema>;

interface ProcessFormProps {
  id?: string;
}

export default function ProcessFormPage({ id }: ProcessFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { vendor } = useVendor();

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
  } = useForm<ProcessFormData>({
    resolver: zodResolver(processValidationSchema),
    defaultValues: {
      code: '',
      name: '',
      vendorCode: '',
      moduleCode: 'workflow',
      description: '',
      status: 'ACTIVE',
    }
  });

  // Pre-fill vendorCode once vendor context is loaded (only in create mode)
  useEffect(() => {
    if (vendor && !id) {
      setValue('vendorCode', vendor, { shouldDirty: false });
    }
  }, [vendor, id, setValue]);

  // Load existing process data if id is provided
  useEffect(() => {
    if (id) {
      const fetchProcess = async () => {
        setIsLoading(true);
        try {
          const process = await processRepository.getById(id);
          reset({
            code: process.code || '',
            name: process.name || '',
            vendorCode: process.vendorCode || '',
            moduleCode: process.moduleCode || 'workflow',
            description: process.description || '',
            status: process.status || 'ACTIVE',
          });
        } catch (error) {
          console.error("Error fetching process details:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProcess();
    }
  }, [id, reset]);

  const onSubmit: SubmitHandler<ProcessFormData> = async (formData) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await processRepository.update({
          ...formData,
          id,
        });
      } else {
        await processRepository.create(formData);
      }
      router.push(PROCESS_ROUTES.LIST());
      router.refresh();
    } catch (error) {
      console.error("Error saving process:", error);
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
    router.push(PROCESS_ROUTES.LIST());
  };

  const confirmCancel = () => {
    setShowConfirmCancel(false);
    router.push(PROCESS_ROUTES.LIST());
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
      {/* Header section */}
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
              {id ? t(PROCESS_CONSTANTS.EDIT_TITLE) || 'Edit Process' : t(PROCESS_CONSTANTS.CREATE_TITLE) || 'Create Process'}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {id
                ? t(PROCESS_CONSTANTS.DESCRIPTION_EDIT) || 'Modify properties and active status for this process.'
                : t(PROCESS_CONSTANTS.DESCRIPTION_CREATE) || 'Define a new process with module key, custom code identifier, and name.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main form */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-border/40 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm h-full">
            <CardContent className="p-8 space-y-8">

              {/* Row 1: Code and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    {t('common.code') || 'Code'}
                  </label>
                  <Input
                    {...register("code")}
                    placeholder="e.g. USER_ONBOARDING"
                    className={errors.code ? "border-destructive focus-visible:ring-destructive/20 h-11 bg-card/30" : "h-11 bg-card/30"}
                  />
                  {errors.code && <p className="text-[10px] text-destructive font-medium ml-1">{errors.code.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    {t('common.status') || 'Status'}
                  </label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="flex h-11 w-full rounded-md border border-border/50 bg-card/30 px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer font-medium"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    )}
                  />
                  {errors.status && <p className="text-[10px] text-destructive font-medium ml-1">{errors.status.message}</p>}
                </div>
              </div>

              {/* Row 2: Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  {t('common.name') || 'Name'}
                </label>
                <Input
                  {...register("name")}
                  placeholder="e.g. Customer Satisfaction Process"
                  className={errors.name ? "border-destructive focus-visible:ring-destructive/20 h-11 bg-card/30" : "h-11 bg-card/30"}
                />
                {errors.name && <p className="text-[10px] text-destructive font-medium ml-1">{errors.name.message}</p>}
              </div>

              {/* Row 3: VendorCode and ModuleCode */}
              <div className="grid grid-cols-1 gap-6">


                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    {t(PROCESS_CONSTANTS.MODULE) || 'Module Code'}
                  </label>
                  <Input
                    {...register("moduleCode")}
                    placeholder="e.g. workflow"
                    className={errors.moduleCode ? "border-destructive focus-visible:ring-destructive/20 h-11 bg-card/30" : "h-11 bg-card/30"}
                  />
                  {errors.moduleCode && <p className="text-[10px] text-destructive font-medium ml-1">{errors.moduleCode.message}</p>}
                </div>
              </div>

              {/* Row 4: Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  {t('common.description') || 'Description'}
                </label>
                <textarea
                  {...register("description")}
                  placeholder="Provide a concise description of the process..."
                  rows={4}
                  className="flex w-full rounded-md border border-border/50 bg-card/30 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all resize-none"
                />
                {errors.description && <p className="text-[10px] text-destructive font-medium ml-1">{errors.description.message}</p>}
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Sidebar details */}
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5 shadow-xl border-dashed">
            <CardHeader>
              <CardTitle className="text-base font-bold text-primary flex items-center gap-2">
                <LayoutTemplate size={18} />
                {t('common.formStatus') || 'Status'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-xs border-b border-border/5 pb-2">
                <span className="text-muted-foreground">{t('common.formModified') || 'Modified:'}</span>
                <span className={isDirty ? "text-amber-500 font-bold" : "text-emerald-500 font-bold"}>
                  {isDirty ? "YES" : "NO"}
                </span>
              </div>
              <div className="flex gap-2.5 text-xs text-muted-foreground leading-relaxed pt-2">
                <Info size={16} className="text-primary shrink-0" />
                <span>
                  {t('common.formWarning') || 'Please make sure all elements are entered accurately before committing saves.'}
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
        title={t('common.dirty_warning') || 'Discard Changes?'}
        description={t('workflow.form.cancel_warning') || "You have unsaved modifications. Are you sure you want to discard your edits and return to the list?"}
        confirmText={t('common.confirm') || 'Discard'}
        cancelText={t('common.cancel') || 'Keep Editing'}
        onConfirm={confirmCancel}
        type="warning"
      />
    </div>
  );
}
