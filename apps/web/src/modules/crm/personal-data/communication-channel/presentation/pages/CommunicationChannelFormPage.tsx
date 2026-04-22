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
  MessageSquare,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { COMMUNICATION_CHANNEL_CONSTANTS } from '../../constants/communication-channel-constants';
import { CommunicationChannelRepositoryImpl } from '../../infrastructure/repositories/CommunicationChannelRepositoryImpl';
import { COMMUNICATION_CHANNEL_DOMAIN_PARAMETERS, P_COMM_CHANNNEL, P_COMM_CHANNNEL_KIND } from '../../constants/parameter';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

const communicationChannelSchema = z.object({
  personId: z.string().min(1, "Person ID is required"),
  type: z.string().trim().min(1, "Type is required"),
  contactData: z.string().trim().min(1, "Contact data is required"),
  kind: z.string().trim().min(1, "Kind is required"),
  priority: z.coerce.number().min(1, "Priority minimum 1").nullable().optional(),
});

type CommunicationChannelFormData = z.infer<typeof communicationChannelSchema>;

const communicationChannelRepository = new CommunicationChannelRepositoryImpl();

interface CommunicationChannelFormPageProps {
  params?: Promise<{ id?: string }>;
}

export const CommunicationChannelFormPage = ({ params }: CommunicationChannelFormPageProps) => {
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
    parameters: COMMUNICATION_CHANNEL_DOMAIN_PARAMETERS
  });
  const typeOptions = parametersData[P_COMM_CHANNNEL] || [];
  const kindOptions = parametersData[P_COMM_CHANNNEL_KIND] || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    setValue,
    control
  } = useForm<CommunicationChannelFormData>({
    resolver: zodResolver(communicationChannelSchema),
    defaultValues: {
      personId: personId || '',
      type: '',
      contactData: '',
      kind: '',
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
      const fetchChannel = async () => {
        setIsLoading(true);
        try {
          const data = await communicationChannelRepository.getById(id);
          reset({
            personId: data.personId,
            type: data.type,
            contactData: data.contactData,
            kind: data.kind,
            priority: data.priority || 1,
          });
        } catch (error) {
          console.error("Error fetching channel:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchChannel();
    }
  }, [id, reset]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.warn("CommunicationChannel validation errors:", errors);
    }
  }, [errors]);

  const onSubmit = async (data: CommunicationChannelFormData) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await communicationChannelRepository.update({ ...data, id });
      } else {
        await communicationChannelRepository.create(data);
      }
      router.back();
    } catch (error) {
      console.error("Error saving channel:", error);
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
            {id ? t(COMMUNICATION_CHANNEL_CONSTANTS.EDIT_TITLE) : t(COMMUNICATION_CHANNEL_CONSTANTS.CREATE_TITLE)}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{id ? t(COMMUNICATION_CHANNEL_CONSTANTS.DESCRIPTION_EDIT) : t(COMMUNICATION_CHANNEL_CONSTANTS.DESCRIPTION_TITLE)}</p>
        </div>
      </div>

      <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register("personId")} />
          <CardContent className="space-y-6 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t(COMMUNICATION_CHANNEL_CONSTANTS.FORM.TYPE)}
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
                      <option value="">{t('common.selectOption') || 'Select Type'}</option>
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
                  {t(COMMUNICATION_CHANNEL_CONSTANTS.FORM.KIND)}
                </label>
                <Controller
                  name="kind"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={cn(
                        "w-full h-10 px-3 py-2 text-sm bg-card border border-border/40 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                        errors.kind ? "border-destructive" : "focus:border-primary/40"
                      )}
                    >
                      <option value="">{t('common.selectOption') || 'Select Kind'}</option>
                      {kindOptions.map((p: any, idx: number) => {
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
                {errors.kind && <p className="text-[10px] text-destructive font-bold uppercase">{errors.kind.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t(COMMUNICATION_CHANNEL_CONSTANTS.FORM.DATA)}
                </label>
                <Input
                  {...register("contactData")}
                  placeholder="e.g. email@example.com or phone number"
                  className={errors.contactData ? "border-destructive focus-visible:ring-destructive/20" : ""}
                />
                {errors.contactData && <p className="text-[10px] text-destructive font-bold uppercase">{errors.contactData.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t(COMMUNICATION_CHANNEL_CONSTANTS.FORM.PRIORITY)}
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
              {t(COMMUNICATION_CHANNEL_CONSTANTS.FORM.CANCEL)}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="font-bold uppercase text-[10px] tracking-widest px-8 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={14} /> : <Save className="mr-2" size={14} />}
              {t(COMMUNICATION_CHANNEL_CONSTANTS.FORM.SUBMIT)}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <ConfirmDialog
        open={showConfirmCancel}
        onOpenChange={setShowConfirmCancel}
        title={t('common.confirmCancel', 'Discard Changes?')}
        description={t(COMMUNICATION_CHANNEL_CONSTANTS.FORM.DIRTY_WARNING) || "You have unsaved changes. Are you sure you want to cancel?"}
        confirmText={t('common.yesDiscard', 'Yes, Discard')}
        cancelText={t('common.noStay', 'No, Stay')}
        onConfirm={confirmCancel}
        type="warning"
      />
    </div>
  );
};
