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
  Users,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { CONTACT_CONSTANTS } from '../../constants/contact-constants';
import { ContactRepositoryImpl } from '../../infrastructure/repositories/ContactRepositoryImpl';
import { CONTACT_DOMAIN_PARAMETERS, P_MEMBER_TYPE } from '../../constants/parameter';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

const contactSchema = z.object({
  personId: z.string().min(1, "Person ID is required"),
  personCompId: z.string().min(1, "Linked Person ID is required"),
  type: z.string().trim().min(1, "Type is required"),
  relationDescription: z.string().trim().min(1, "Description is required").max(200, "Too long"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const contactRepository = new ContactRepositoryImpl();

interface ContactFormPageProps {
  params?: Promise<{ id?: string }>;
}

export const ContactFormPage = ({ params }: ContactFormPageProps) => {
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
    parameters: CONTACT_DOMAIN_PARAMETERS
  });
  const typeOptions = parametersData[P_MEMBER_TYPE] || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    setValue,
    control
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      personId: personId || '',
      personCompId: '',
      type: '',
      relationDescription: '',
    }
  });

  useEffect(() => {
    if (personId && !id) {
      setValue('personId', personId);
    }
  }, [personId, id, setValue]);

  useEffect(() => {
    if (id) {
      const fetchContact = async () => {
        setIsLoading(true);
        try {
          const data = await contactRepository.getById(id);
          reset({
            personId: data.personId,
            personCompId: data.personCompId,
            type: data.type,
            relationDescription: data.relationDescription,
          });
        } catch (error) {
          console.error("Error fetching contact:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchContact();
    }
  }, [id, reset]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.warn("Contact validation errors:", errors);
    }
  }, [errors]);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await contactRepository.update({ ...data, id });
      } else {
        await contactRepository.create(data);
      }
      router.back();
    } catch (error) {
      console.error("Error saving contact:", error);
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
    <div className="max-w-xl mx-auto space-y-6 py-6 px-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel} className="rounded-full h-10 w-10">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">
            {id ? t(CONTACT_CONSTANTS.EDIT_TITLE) : t(CONTACT_CONSTANTS.CREATE_TITLE)}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{id ? t(CONTACT_CONSTANTS.DESCRIPTION_EDIT) : t(CONTACT_CONSTANTS.DESCRIPTION_TITLE)}</p>
        </div>
      </div>

      <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register("personId")} />
          <CardContent className="space-y-6 pt-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t(CONTACT_CONSTANTS.FORM.PERSON_COMP)}
              </label>
              <Input
                {...register("personCompId")}
                placeholder={t(CONTACT_CONSTANTS.FORM.EX_PERSON_COMP) || 'Linked Person ID'}
                className={errors.personCompId ? "border-destructive focus-visible:ring-destructive/20" : ""}
              />
              {errors.personCompId && <p className="text-[10px] text-destructive font-bold uppercase">{errors.personCompId.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t(CONTACT_CONSTANTS.FORM.TYPE)}
              </label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className={cn(
                      "w-full h-10 px-3 py-2 text-sm bg-card border border-border/40 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                      errors.type ? "border-destructive" : "focus:border-primary/40"
                    )}
                  >
                    <option value="">{t(CONTACT_CONSTANTS.FORM.SELECT_OPTION) || 'Select Relation Type'}</option>
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
                {t(CONTACT_CONSTANTS.FORM.DESCRIPTION)}
              </label>
              <Input
                {...register("relationDescription")}
                placeholder={t(CONTACT_CONSTANTS.FORM.EX_DESCRIPTION) || 'Relationship description...'}
                className={errors.relationDescription ? "border-destructive focus-visible:ring-destructive/20" : ""}
              />
              {errors.relationDescription && <p className="text-[10px] text-destructive font-bold uppercase">{errors.relationDescription.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 pb-8 pt-4 px-8 border-t border-border/10">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              className="font-bold uppercase text-[10px] tracking-widest px-6"
            >
              {t(CONTACT_CONSTANTS.FORM.CANCEL)}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="font-bold uppercase text-[10px] tracking-widest px-8 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={14} /> : <Save className="mr-2" size={14} />}
              {t(CONTACT_CONSTANTS.FORM.SUBMIT)}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <ConfirmDialog
        open={showConfirmCancel}
        onOpenChange={setShowConfirmCancel}
        title={t(CONTACT_CONSTANTS.FORM.CONFIRM_CANCEL, 'Discard Changes?')}
        description={t(CONTACT_CONSTANTS.FORM.DIRTY_WARNING) || "You have unsaved changes. Are you sure you want to cancel?"}
        confirmText={t(CONTACT_CONSTANTS.FORM.YES_DISCARD, 'Yes, Discard')}
        cancelText={t(CONTACT_CONSTANTS.FORM.NO_STAY, 'No, Stay')}
        onConfirm={confirmCancel}
        type="warning"
      />
    </div>
  );
};
