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
  X,
  Fingerprint,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IDENTIFICATION_CONSTANTS } from '../../constants/identification-constants';
import { IDENTIFICATION_ROUTES } from '../../routes/identification-routes';
import { IdentificationRepositoryImpl } from '../../infrastructure/repositories/IdentificationRepositoryImpl';
import { CreateIdentificationDto } from '../../domain/entities/Identification';
import { IDENTIFICATION_DOMAIN_PARAMETERS, P_IDENT_TYPE } from '../../constants/parameter';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

const identificationSchema = z.object({
  personId: z.string().min(1, "Person ID is required"),
  type: z.string().trim().min(1, "Type is required").max(100, "Type too long"),
  numberIdent: z.string().trim().min(1, "Number is required"),
  prefix: z.string().nullable().optional(),
  sufix: z.string().nullable().optional(),
  priority: z.coerce.number().min(1, "Priority must be at least 1"),
});

type IdentificationFormData = z.infer<typeof identificationSchema>;

const identificationRepository = new IdentificationRepositoryImpl();

interface IdentificationFormPageProps {
  params?: { id?: string };
}

export const IdentificationFormPage = ({ params }: IdentificationFormPageProps & { params?: any }) => {
  const resolvedParams = params ? React.use(params) : null;
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  console.log("IdentificationFormPage searchParams:", searchParams.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const id = resolvedParams?.id || null;
  const personId = searchParams.get('personId') || null;

  const { data: parametersData } = useDomainParameters({
    parameters: IDENTIFICATION_DOMAIN_PARAMETERS
  });
  const typeOptions = parametersData[P_IDENT_TYPE] || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    setValue,
    control
  } = useForm<IdentificationFormData>({
    resolver: zodResolver(identificationSchema),
    defaultValues: {
      personId: personId || '',
      type: '',
      numberIdent: '',
      prefix: '',
      sufix: '',
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
      const fetchIdentification = async () => {
        setIsLoading(true);
        try {
          const data = await identificationRepository.getById(id);
          reset({
            personId: data.personId,
            type: data.type,
            numberIdent: data.numberIdent,
            prefix: data.prefix || '',
            sufix: data.sufix || '',
            priority: data.priority,
          });
        } catch (error) {
          console.error("Error fetching identification:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchIdentification();
    }
  }, [id, reset]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.warn("Validation errors:", errors);
    }
  }, [errors]);

  const onSubmit = async (data: IdentificationFormData) => {
    console.log("Submitting identification data:", data);
    setIsSubmitting(true);
    try {
      if (id) {
        await identificationRepository.update({ ...data, id });
      } else {
        await identificationRepository.create(data);
      }
      router.back();
    } catch (error) {
      console.error("Error saving identification:", error);
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
    <div className="max-w-2xl mx-auto space-y-6 py-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel} className="rounded-full">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">
            {id ? t(IDENTIFICATION_CONSTANTS.EDIT_TITLE) : t(IDENTIFICATION_CONSTANTS.CREATE_TITLE)}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{id ? t(IDENTIFICATION_CONSTANTS.DESCRIPTION_EDIT) : t(IDENTIFICATION_CONSTANTS.DESCRIPTION_TITLE)}</p>
        </div>
      </div>

      <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register("personId")} />
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t(IDENTIFICATION_CONSTANTS.FORM.TYPE)}
                </label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      value={field.value || ""}
                      className={cn(
                        "w-full h-10 px-3 py-2 text-sm bg-card border border-border/40 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer",
                        errors.type ? "border-destructive focus:ring-destructive/20" : "focus:border-primary/40"
                      )}
                    >
                      <option value="">{t('common.selectOption') || 'Select Option'}</option>
                      {typeOptions.map((p: any, idx: number) => {
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
                {errors.type && <p className="text-[10px] text-destructive font-bold uppercase">{errors.type.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t(IDENTIFICATION_CONSTANTS.FORM.NUMBER)}
                </label>
                <Input
                  {...register("numberIdent")}
                  placeholder={t(IDENTIFICATION_CONSTANTS.FORM.EX_IDENT_NUMBER)}
                  className={errors.numberIdent ? "border-destructive focus-visible:ring-destructive/20" : ""}
                />
                {errors.numberIdent && <p className="text-[10px] text-destructive font-bold uppercase">{errors.numberIdent.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t(IDENTIFICATION_CONSTANTS.FORM.PREFIX)}
                </label>
                <Input
                  {...register("prefix")}
                  placeholder="Optional prefix"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t(IDENTIFICATION_CONSTANTS.FORM.SUFIX)}
                </label>
                <Input
                  {...register("sufix")}
                  placeholder="Optional suffix"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t(IDENTIFICATION_CONSTANTS.FORM.PRIORITY)}
                </label>
                <Input
                  type="number"
                  {...register("priority")}
                  className={errors.priority ? "border-destructive focus-visible:ring-destructive/20" : ""}
                />
                {errors.priority && <p className="text-[10px] text-destructive font-bold uppercase">{errors.priority.message}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 pt-6 border-t border-border/10">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              className="font-bold uppercase text-[10px] tracking-widest px-6"
            >
              {t(IDENTIFICATION_CONSTANTS.FORM.CANCEL)}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="font-bold uppercase text-[10px] tracking-widest px-8 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={14} /> : <Save className="mr-2" size={14} />}
              {t(IDENTIFICATION_CONSTANTS.FORM.SUBMIT)}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <ConfirmDialog
        open={showConfirmCancel}
        onOpenChange={setShowConfirmCancel}
        title={t('common.confirmCancel', 'Discard Changes?')}
        description={t(IDENTIFICATION_CONSTANTS.FORM.DIRTY_WARNING) || "You have unsaved changes. Are you sure you want to cancel?"}
        confirmText={t('common.yesDiscard', 'Yes, Discard')}
        cancelText={t('common.noStay', 'No, Stay')}
        onConfirm={confirmCancel}
        type="warning"
      />
    </div>
  );
};
