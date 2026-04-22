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
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { PERSON_SKILL_CONSTANTS } from '../../constants/person-skill-constants';
import { PersonSkillRepositoryImpl } from '../../infrastructure/repositories/PersonSkillRepositoryImpl';
import { PERSON_SKILL_DOMAIN_PARAMETERS, P_SKILL } from '../../constants/parameter';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { cn } from '@/lib/utils';

const personSkillSchema = z.object({
  personId: z.string().min(1, "Person ID is required"),
  skillCode: z.string().trim().min(1, "Skill is required"),
});

type PersonSkillFormData = z.infer<typeof personSkillSchema>;

const personSkillRepository = new PersonSkillRepositoryImpl();

interface PersonSkillFormPageProps {
  params?: Promise<{ id?: string }>;
}

export const PersonSkillFormPage = ({ params }: PersonSkillFormPageProps) => {
  const resolvedParams = params ? React.use(params) : null;
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const id = resolvedParams?.id || null;
  const personId = searchParams.get('personId') || null;

  const { data: parametersData } = useDomainParameters({
    parameters: PERSON_SKILL_DOMAIN_PARAMETERS
  });
  const skillOptions = parametersData[P_SKILL] || [];

  const {
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    setValue,
    control,
    register
  } = useForm<PersonSkillFormData>({
    resolver: zodResolver(personSkillSchema),
    defaultValues: {
      personId: personId || '',
      skillCode: '',
    }
  });

  useEffect(() => {
    if (personId && !id) {
      setValue('personId', personId);
    }
  }, [personId, id, setValue]);

  useEffect(() => {
    if (id) {
      const fetchSkill = async () => {
        setIsLoading(true);
        try {
          const data = await personSkillRepository.getById(id);
          reset({
            personId: data.personId,
            skillCode: data.skillCode,
          });
        } catch (error) {
          console.error("Error fetching skill:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSkill();
    }
  }, [id, reset]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.warn("PersonSkill validation errors:", errors);
    }
  }, [errors]);

  const onSubmit = async (data: PersonSkillFormData) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await personSkillRepository.update({ ...data, id });
      } else {
        await personSkillRepository.create(data);
      }
      router.back();
    } catch (error) {
      console.error("Error saving skill:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (!confirm(t(PERSON_SKILL_CONSTANTS.FORM.DIRTY_WARNING) || "Unsaved changes. Cancel?")) {
        return;
      }
    }
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
    <div className="max-w-xl mx-auto space-y-6 py-6 font-sans">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel} className="rounded-full h-10 w-10">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">
            {id ? t(PERSON_SKILL_CONSTANTS.EDIT_TITLE) : t(PERSON_SKILL_CONSTANTS.CREATE_TITLE)}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{id ? t(PERSON_SKILL_CONSTANTS.DESCRIPTION_EDIT) : t(PERSON_SKILL_CONSTANTS.DESCRIPTION_TITLE)}</p>
        </div>
      </div>

      <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register("personId")} />
          <CardContent className="space-y-6 pt-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t(PERSON_SKILL_CONSTANTS.FORM.SKILL)}
              </label>
              <Controller
                name="skillCode"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className={cn(
                      "w-full h-12 px-4 py-2 text-sm bg-card border border-border/40 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer appearance-none",
                      errors.skillCode ? "border-destructive focus:ring-destructive/10" : "focus:border-primary/40"
                    )}
                  >
                    <option value="">{t('common.selectOption') || 'Select Skill'}</option>
                    {skillOptions.map((p: any, idx: number) => {
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
              {errors.skillCode && <p className="text-[10px] text-destructive font-bold uppercase">{errors.skillCode.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 pb-8 pt-4 px-8 border-t border-border/10">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              className="font-bold uppercase text-[10px] tracking-widest px-6 h-10"
            >
              {t(PERSON_SKILL_CONSTANTS.FORM.CANCEL)}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="font-bold uppercase text-[10px] tracking-widest px-8 h-10 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={14} /> : <Save className="mr-2" size={14} />}
              {t(PERSON_SKILL_CONSTANTS.FORM.SUBMIT)}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
