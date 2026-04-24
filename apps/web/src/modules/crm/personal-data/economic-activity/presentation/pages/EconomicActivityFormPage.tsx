"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from '@kplian/i18n';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ECONOMIC_ACTIVITY_CONSTANTS } from '../../constants/economic-activity-constants';
import { EconomicActivityRepositoryImpl } from '../../infrastructure/repositories/EconomicActivityRepositoryImpl';
import { ECONOMIC_ACTIVITY_DOMAIN_PARAMETERS, P_ECONOMIC_ACTIVITY } from '../../constants/parameter';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

const economicActivitySchema = z.object({
  personId: z.string().min(1, "Person ID is required"),
  paramEconomicActCode: z.string().trim().min(1, "Activity code is required"),
  type: z.string().trim().min(3, "Type too short").max(100, "Type too long"),
  priority: z.coerce.number().min(1, "Priority minimum 1").nullable().optional(),
});

type EconomicActivityFormData = z.infer<typeof economicActivitySchema>;

const economicActivityRepository = new EconomicActivityRepositoryImpl();

interface EconomicActivityFormPageProps {
  params?: Promise<{ id?: string }>;
}

export const EconomicActivityFormPage = ({ params }: EconomicActivityFormPageProps) => {
  const resolvedParams = params ? React.use(params) : null;
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const id = resolvedParams?.id || null;
  const personId = searchParams.get('personId') || null;

  const { data: parametersData } = useDomainParameters({
    parameters: ECONOMIC_ACTIVITY_DOMAIN_PARAMETERS
  });
  const activityOptions = parametersData[P_ECONOMIC_ACTIVITY] || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    setValue,
    control
  } = useForm<EconomicActivityFormData>({
    resolver: zodResolver(economicActivitySchema),
    defaultValues: {
      personId: personId || '',
      paramEconomicActCode: '',
      type: '',
      priority: 1,
    }
  });

  useEffect(() => {
    if (personId && !id) {
      setValue('personId', personId);
    }
  }, [personId, id, setValue]);

  useEffect(() => {
    if (id) {
      const fetchActivity = async () => {
        setIsLoading(true);
        try {
          const data = await economicActivityRepository.getById(id);
          reset({
            personId: data.personId,
            paramEconomicActCode: data.paramEconomicActCode,
            type: data.type,
            priority: data.priority || 1,
          });
        } catch (error) {
          console.error("Error fetching economic activity:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchActivity();
    }
  }, [id, reset]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.warn("EconomicActivity validation errors:", errors);
    }
  }, [errors]);

  const onSubmit = async (data: EconomicActivityFormData) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await economicActivityRepository.update({ ...data, id });
      } else {
        await economicActivityRepository.create(data);
      }
      router.back();
    } catch (error) {
      console.error("Error saving economic activity:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowConfirmCancel(true);
      return;
    }
    router.back();
  };

  const confirmCancel = () => {
    setShowConfirmCancel(false);
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6 px-4 font-sans">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel} className="rounded-full h-10 w-10">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">
            {id ? t(ECONOMIC_ACTIVITY_CONSTANTS.EDIT_TITLE) : t(ECONOMIC_ACTIVITY_CONSTANTS.CREATE_TITLE)}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{id ? t(ECONOMIC_ACTIVITY_CONSTANTS.DESCRIPTION_EDIT) : t(ECONOMIC_ACTIVITY_CONSTANTS.DESCRIPTION_TITLE)}</p>
        </div>
      </div>

      <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register("personId")} />
          <CardContent className="space-y-6 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t(ECONOMIC_ACTIVITY_CONSTANTS.FORM.CODE)}
                </label>
                <Controller
                  name="paramEconomicActCode"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={cn(
                        "w-full h-10 px-3 py-2 text-sm bg-card border border-border/40 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                        errors.paramEconomicActCode ? "border-destructive" : "focus:border-primary/40"
                      )}
                    >
                      <option value="">{t(ECONOMIC_ACTIVITY_CONSTANTS.FORM.SELECT_OPTION) || 'Select Activity'}</option>
                      {activityOptions.map((p: any, idx: number) => {
                        const val = p.KEY ?? p.CODE ?? p.VALUE ?? p.ID ?? p.code ?? p.value ?? p.id ?? p.valueStr ?? p.fullCode ?? p;
                        const label = p.NAME || p.name || p.label || p.description || p.valueStr || val || `Item ${idx}`;
                        return (
                          <option key={`${val}-${idx}`} value={val}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  )}
                />
                {errors.paramEconomicActCode && <p className="text-[10px] text-destructive font-bold uppercase">{errors.paramEconomicActCode.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t(ECONOMIC_ACTIVITY_CONSTANTS.FORM.TYPE)}
                </label>
                <Input
                  {...register("type")}
                  placeholder={t(ECONOMIC_ACTIVITY_CONSTANTS.FORM.EX_TYPE) || 'Activity type'}
                  className={errors.type ? "border-destructive focus-visible:ring-destructive/20" : ""}
                />
                {errors.type && <p className="text-[10px] text-destructive font-bold uppercase">{errors.type.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t(ECONOMIC_ACTIVITY_CONSTANTS.FORM.PRIORITY)}
                </label>
                <Input
                  type="number"
                  {...register("priority")}
                  className={errors.priority ? "border-destructive focus-visible:ring-destructive/20" : ""}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 pb-8 pt-4 px-8 border-t border-border/10">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              className="font-bold uppercase text-[10px] tracking-widest px-6"
            >
              {t(ECONOMIC_ACTIVITY_CONSTANTS.FORM.CANCEL)}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="font-bold uppercase text-[10px] tracking-widest px-8 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={14} /> : <Save className="mr-2" size={14} />}
              {t(ECONOMIC_ACTIVITY_CONSTANTS.FORM.SUBMIT)}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <ConfirmDialog
        open={showConfirmCancel}
        onOpenChange={setShowConfirmCancel}
        title={t(ECONOMIC_ACTIVITY_CONSTANTS.FORM.CONFIRM_CANCEL, 'Discard Changes?')}
        description={t(ECONOMIC_ACTIVITY_CONSTANTS.FORM.DIRTY_WARNING) || "You have unsaved changes. Are you sure you want to cancel?"}
        confirmText={t(ECONOMIC_ACTIVITY_CONSTANTS.FORM.YES_DISCARD, 'Yes, Discard')}
        cancelText={t(ECONOMIC_ACTIVITY_CONSTANTS.FORM.NO_STAY, 'No, Stay')}
        onConfirm={confirmCancel}
        type="warning"
      />
    </div>
  );
};
