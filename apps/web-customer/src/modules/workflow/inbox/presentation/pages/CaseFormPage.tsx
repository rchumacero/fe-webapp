"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@kplian/i18n';
import { CASE_CONSTANTS } from '../../constants/case-constants';
import { CASE_ROUTES } from '../../routes/case-routes';
import { CaseRepositoryImpl } from '../../infrastructure/CaseRepositoryImpl';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Save, X, ArrowLeft, Loader2, Info, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useVendor } from '@/hooks/use-vendor';

const caseRepository = new CaseRepositoryImpl();

const caseValidationSchema = z.object({
  vendorCode: z.string().min(1, "Vendor Code is required"),
  processCode: z.string().min(1, "Process Code is required").max(50, "Process Code is too long"),
  moduleCode: z.string().min(1, "Module Code is required").max(50, "Module Code is too long"),
  entity: z.string().min(2, "Entity name is required").max(100, "Entity name is too long"),
  entityId: z.string().min(1, "Entity ID is required"),
  entityExpense: z.string().optional().or(z.literal('')),
  entityExpenseId: z.string().optional().or(z.literal('')),
  status: z.string().min(1, "Status is required"),
});

type CaseFormData = z.infer<typeof caseValidationSchema>;

interface CaseFormProps {
  id?: string;
}

export default function CaseFormPage({ id }: CaseFormProps) {
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
  } = useForm<CaseFormData>({
    resolver: zodResolver(caseValidationSchema),
    defaultValues: {
      vendorCode: vendor || '',
      processCode: '',
      moduleCode: '',
      entity: '',
      entityId: '',
      entityExpense: '',
      entityExpenseId: '',
      status: 'ACTIVE',
    }
  });

  // Pre-fill vendorCode during creation once vendor object is fetched
  useEffect(() => {
    if (vendor && !id) {
      setValue('vendorCode', vendor, { shouldDirty: false });
    }
  }, [vendor, id, setValue]);

  // Load existing case data if id is provided (editing mode)
  useEffect(() => {
    if (id) {
      const fetchCase = async () => {
        setIsLoading(true);
        try {
          const caseData = await caseRepository.getById(id);
          reset({
            vendorCode: caseData.vendorCode || '',
            processCode: caseData.processCode || '',
            moduleCode: caseData.moduleCode || '',
            entity: caseData.entity || '',
            entityId: caseData.entityId || '',
            entityExpense: caseData.entityExpense || '',
            entityExpenseId: caseData.entityExpenseId || '',
            status: caseData.status || 'ACTIVE',
          });
        } catch (error) {
          console.error("Error loading case:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCase();
    }
  }, [id, reset]);

  const onSubmit: SubmitHandler<CaseFormData> = async (formData) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await caseRepository.update({
          ...formData,
          id,
        });
      } else {
        await caseRepository.create(formData);
      }
      router.push(CASE_ROUTES.LIST());
      router.refresh();
    } catch (error) {
      console.error("Error saving case:", error);
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
    router.push(CASE_ROUTES.LIST());
  };

  const confirmCancel = () => {
    setShowConfirmCancel(false);
    router.push(CASE_ROUTES.LIST());
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
              {id ? t(CASE_CONSTANTS.EDIT_TITLE) || 'Edit Case' : t(CASE_CONSTANTS.CREATE_TITLE) || 'Create Case'}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {id
                ? 'Update process workflows, entity associations, or linked expense information.'
                : 'Configure a new dynamic workflow case with active validation records.'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Grid Layout */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card: Process details */}
          <Card className="border-border/40 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border/5 pb-2">
                Process Definitions
              </h3>

              {/* Row 1: Process and Module */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Process Code
                  </label>
                  <Input
                    {...register("processCode")}
                    placeholder="e.g. USER_REGISTRATION"
                    className={errors.processCode ? "border-destructive focus-visible:ring-destructive/20 h-11 bg-card/30" : "h-11 bg-card/30"}
                  />
                  {errors.processCode && <p className="text-[10px] text-destructive font-medium ml-1">{errors.processCode.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Module Code
                  </label>
                  <Input
                    {...register("moduleCode")}
                    placeholder="e.g. WORKFLOW"
                    className={errors.moduleCode ? "border-destructive focus-visible:ring-destructive/20 h-11 bg-card/30" : "h-11 bg-card/30"}
                  />
                  {errors.moduleCode && <p className="text-[10px] text-destructive font-medium ml-1">{errors.moduleCode.message}</p>}
                </div>
              </div>

              {/* Row 2: Vendor */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Vendor Code
                </label>
                <Input
                  {...register("vendorCode")}
                  placeholder="Vendor Code"
                  disabled={true}
                  className="h-11 bg-card/30 opacity-75 cursor-not-allowed"
                />
                {errors.vendorCode && <p className="text-[10px] text-destructive font-medium ml-1">{errors.vendorCode.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Entity Parameter settings */}
          <Card className="border-border/40 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border/5 pb-2">
                Entity Associations
              </h3>

              {/* Entity name and ID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Target Entity Name
                  </label>
                  <Input
                    {...register("entity")}
                    placeholder="e.g. USER"
                    className={errors.entity ? "border-destructive focus-visible:ring-destructive/20 h-11 bg-card/30" : "h-11 bg-card/30"}
                  />
                  {errors.entity && <p className="text-[10px] text-destructive font-medium ml-1">{errors.entity.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Entity Unique ID
                  </label>
                  <Input
                    {...register("entityId")}
                    placeholder="e.g. usr_82aef912"
                    className={errors.entityId ? "border-destructive focus-visible:ring-destructive/20 h-11 bg-card/30" : "h-11 bg-card/30"}
                  />
                  {errors.entityId && <p className="text-[10px] text-destructive font-medium ml-1">{errors.entityId.message}</p>}
                </div>
              </div>

              {/* Optional Expense Entity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Linked Expense Entity (Optional)
                  </label>
                  <Input
                    {...register("entityExpense")}
                    placeholder="e.g. TRAVEL_EXPENSE"
                    className="h-11 bg-card/30"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Expense Unique ID (Optional)
                  </label>
                  <Input
                    {...register("entityExpenseId")}
                    placeholder="e.g. exp_01fbc34"
                    className="h-11 bg-card/30"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Status Widget */}
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5 shadow-xl border-dashed">
            <CardHeader>
              <CardTitle className="text-base font-bold text-primary flex items-center gap-2">
                <Briefcase size={18} />
                Case Status Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Active Status
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
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  )}
                />
                {errors.status && <p className="text-[10px] text-destructive font-medium ml-1">{errors.status.message}</p>}
              </div>

              <div className="flex justify-between text-xs border-b border-border/5 pb-2 pt-4">
                <span className="text-muted-foreground">Modified:</span>
                <span className={isDirty ? "text-amber-500 font-bold" : "text-emerald-500 font-bold"}>
                  {isDirty ? "YES" : "NO"}
                </span>
              </div>
              <div className="flex gap-2.5 text-xs text-muted-foreground leading-relaxed pt-2">
                <Info size={16} className="text-primary shrink-0 animate-bounce" />
                <span>
                  Cases represent active execution threads mapping forms, workflows, and task parameters to target entities.
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
        description="You have unsaved case modifications. Are you sure you want to discard your edits and return to the inbox list?"
        confirmText={t('common.confirm') || 'Discard'}
        cancelText={t('common.cancel') || 'Keep Editing'}
        onConfirm={confirmCancel}
        type="warning"
      />
    </div>
  );
}
