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
  Briefcase,
  Loader2,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { WORK_EXPERIENCE_CONSTANTS } from '../../constants/work-experience-constants';
import { WorkExperienceRepositoryImpl } from '../../infrastructure/repositories/WorkExperienceRepositoryImpl';
import { WORK_EXPERIENCE_DOMAIN_PARAMETERS, P_POSITION } from '../../constants/parameter';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

const workExperienceSchema = z.object({
  personId: z.string().min(1, "Person ID is required"),
  name: z.string().trim().min(1, "Company name is required"),
  positionCode: z.string().trim().min(1, "Position is required"),
  description: z.string().trim().min(1, "Description is required"),
  fromDate: z.string().min(1, "From date is required"),
  toDate: z.string().nullable().optional(),
});

type WorkExperienceFormData = z.infer<typeof workExperienceSchema>;

const workExperienceRepository = new WorkExperienceRepositoryImpl();

interface WorkExperienceFormPageProps {
  params?: Promise<{ id?: string }>;
}

export const WorkExperienceFormPage = ({ params }: WorkExperienceFormPageProps) => {
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
    parameters: WORK_EXPERIENCE_DOMAIN_PARAMETERS
  });
  const positionOptions = parametersData[P_POSITION] || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    setValue,
    control
  } = useForm<WorkExperienceFormData>({
    resolver: zodResolver(workExperienceSchema),
    defaultValues: {
      personId: personId || '',
      name: '',
      positionCode: '',
      description: '',
      fromDate: '',
      toDate: null,
    }
  });

  useEffect(() => {
    if (personId && !id) {
      setValue('personId', personId);
    }
  }, [personId, id, setValue]);

  useEffect(() => {
    if (id) {
      const fetchExperience = async () => {
        setIsLoading(true);
        try {
          const data = await workExperienceRepository.getById(id);
          reset({
            personId: data.personId,
            name: data.name,
            positionCode: data.positionCode,
            description: data.description,
            fromDate: data.fromDate,
            toDate: data.toDate,
          });
        } catch (error) {
          console.error("Error fetching work experience:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchExperience();
    }
  }, [id, reset]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.warn("WorkExperience validation errors:", errors);
    }
  }, [errors]);

  const onSubmit = async (data: WorkExperienceFormData) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await workExperienceRepository.update({ ...data, id });
      } else {
        await workExperienceRepository.create(data);
      }
      router.back();
    } catch (error) {
      console.error("Error saving work experience:", error);
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
    <div className="max-w-3xl mx-auto space-y-6 py-6 px-4 font-sans">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel} className="rounded-full h-10 w-10">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">
            {id ? t(WORK_EXPERIENCE_CONSTANTS.EDIT_TITLE) : t(WORK_EXPERIENCE_CONSTANTS.CREATE_TITLE)}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{id ? t(WORK_EXPERIENCE_CONSTANTS.DESCRIPTION_EDIT) : t(WORK_EXPERIENCE_CONSTANTS.DESCRIPTION_TITLE)}</p>
        </div>
      </div>

      <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register("personId")} />
          <CardContent className="space-y-6 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t(WORK_EXPERIENCE_CONSTANTS.FORM.NAME)}
                </label>
                <Input
                  {...register("name")}
                  placeholder={t(WORK_EXPERIENCE_CONSTANTS.FORM.EX_NAME) || 'e.g. Acme Corp'}
                  className={errors.name ? "border-destructive focus-visible:ring-destructive/20" : ""}
                />
                {errors.name && <p className="text-[10px] text-destructive font-bold uppercase">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t(WORK_EXPERIENCE_CONSTANTS.FORM.POSITION)}
                </label>
                <Controller
                  name="positionCode"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={cn(
                        "w-full h-10 px-3 py-2 text-sm bg-card border border-border/40 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                        errors.positionCode ? "border-destructive" : "focus:border-primary/40"
                      )}
                    >
                      <option value="">{t(WORK_EXPERIENCE_CONSTANTS.FORM.SELECT_OPTION) || 'Select Position'}</option>
                      {positionOptions.map((p: any, idx: number) => {
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
                {errors.positionCode && <p className="text-[10px] text-destructive font-bold uppercase">{errors.positionCode.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t(WORK_EXPERIENCE_CONSTANTS.FORM.DESCRIPTION)}
                </label>
                <Textarea
                  {...register("description")}
                  placeholder={t(WORK_EXPERIENCE_CONSTANTS.FORM.EX_DESCRIPTION) || 'Describe your responsibilities...'}
                  className={cn(
                    "min-h-[120px] resize-none",
                    errors.description ? "border-destructive focus-visible:ring-destructive/20" : ""
                  )}
                />
                {errors.description && <p className="text-[10px] text-destructive font-bold uppercase">{errors.description.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t(WORK_EXPERIENCE_CONSTANTS.FORM.FROM_DATE)}
                </label>
                <Input
                  type="date"
                  {...register("fromDate")}
                  className={errors.fromDate ? "border-destructive focus-visible:ring-destructive/20" : ""}
                />
                {errors.fromDate && <p className="text-[10px] text-destructive font-bold uppercase">{errors.fromDate.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t(WORK_EXPERIENCE_CONSTANTS.FORM.TO_DATE)}
                </label>
                <Input
                  type="date"
                  {...register("toDate")}
                  className={errors.toDate ? "border-destructive focus-visible:ring-destructive/20" : ""}
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
              {t(WORK_EXPERIENCE_CONSTANTS.FORM.CANCEL)}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="font-bold uppercase text-[10px] tracking-widest px-8 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={14} /> : <Save className="mr-2" size={14} />}
              {t(WORK_EXPERIENCE_CONSTANTS.FORM.SUBMIT)}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <ConfirmDialog
        open={showConfirmCancel}
        onOpenChange={setShowConfirmCancel}
        title={t(WORK_EXPERIENCE_CONSTANTS.FORM.CONFIRM_CANCEL, 'Discard Changes?')}
        description={t(WORK_EXPERIENCE_CONSTANTS.FORM.DIRTY_WARNING) || "You have unsaved changes. Are you sure you want to cancel?"}
        confirmText={t(WORK_EXPERIENCE_CONSTANTS.FORM.YES_DISCARD, 'Yes, Discard')}
        cancelText={t(WORK_EXPERIENCE_CONSTANTS.FORM.NO_STAY, 'No, Stay')}
        onConfirm={confirmCancel}
        type="warning"
      />
    </div>
  );
};
