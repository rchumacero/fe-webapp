"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from '@kplian/i18n';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Save,
  Building2,
  Loader2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ORGANIZATION_CONSTANTS } from '../../constants/organization-constants';
import { OrganizationRepositoryImpl } from '../../infrastructure/repositories/OrganizationRepositoryImpl';
import { ORGANIZATION_DOMAIN_PARAMETERS, P_ORGANIZATION_TYPE, P_TICKET_METHOD } from '../../constants/parameter';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { toast } from '@/hooks/use-toast';

const MapPicker = dynamic(() => import('@/modules/crm/personal-data/address/presentation/components/MapPicker'), {
  ssr: false,
});

const organizationSchema = z.object({
  personId: z.string().min(1, "Person ID is required"),
  code: z.string().trim().min(1, "Code is required").max(20, "Too long"),
  name: z.string().trim().min(1, "Name is required").max(100, "Too long"),
  address: z.string().trim().max(500, "Too long").nullable().optional().or(z.literal('')),
  organizationId: z.string().nullable().optional().or(z.literal('')),
  maxAttentionSchedule: z.number().nullable().optional().or(z.literal('')),
  ticketMethodCode: z.string().nullable().optional().or(z.literal('')),
  ticketCounter: z.number().nullable().optional().or(z.literal('')),
  type: z.string().trim().min(1, "Type is required"),
  latitude: z.coerce.number().nullable().optional().or(z.literal('')),
  longitude: z.coerce.number().nullable().optional().or(z.literal('')),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

const organizationRepository = new OrganizationRepositoryImpl();

interface OrganizationFormPageProps {
  id?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultParentId?: string | null;
}

export const OrganizationFormPage = ({ id, onSuccess, onCancel, defaultParentId }: OrganizationFormPageProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [parentOrganizations, setParentOrganizations] = useState<any[]>([]);

  const personId = searchParams.get('personId') || null;

  const { data: parametersData } = useDomainParameters({
    parameters: ORGANIZATION_DOMAIN_PARAMETERS
  });
  const typeOptions = parametersData[P_ORGANIZATION_TYPE] || [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
    control
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      personId: personId || '',
      code: '',
      name: '',
      address: '',
      organizationId: defaultParentId || '',
      maxAttentionSchedule: null,
      ticketMethodCode: '',
      ticketCounter: 0,
      type: '',
      latitude: '',
      longitude: '',
    }
  });

  useEffect(() => {
    if (defaultParentId) {
      setValue('organizationId', defaultParentId);
    }
  }, [defaultParentId, setValue]);

  const fetchParentOrganizations = useCallback(async () => {
    if (!personId) return;
    try {
      const data = await organizationRepository.getAllByPersonId(personId);
      // Filter out current organization if editing to avoid circular reference
      setParentOrganizations(data.filter(org => org.id !== id));
    } catch (error) {
      console.error("Error fetching parent organizations:", error);
    }
  }, [personId, id]);

  useEffect(() => {
    fetchParentOrganizations();
  }, [fetchParentOrganizations]);

  useEffect(() => {
    if (id) {
      const fetchOrganization = async () => {
        setIsLoading(true);
        try {
          const org = await organizationRepository.getById(id);
          reset({
            personId: org.personId,
            code: org.code,
            name: org.name,
            address: org.address || '',
            organizationId: org.organizationId || '',
            maxAttentionSchedule: org.maxAttentionSchedule || '',
            ticketMethodCode: org.ticketMethodCode || '',
            ticketCounter: org.ticketCounter || 0,
            type: org.type || '',
            latitude: org.latitude || '',
            longitude: org.longitude || '',
          });
        } catch (error) {
          console.error("Error fetching organization:", error);
          toast.error("Error loading organization data");
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrganization();
    }
  }, [id, reset]);

  const onSubmit: SubmitHandler<OrganizationFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        maxAttentionSchedule: data.maxAttentionSchedule === '' ? null : Number(data.maxAttentionSchedule),
        ticketCounter: data.ticketCounter === '' ? 0 : Number(data.ticketCounter),
        organizationId: data.organizationId === '' ? null : data.organizationId,
        ticketMethodCode: data.ticketMethodCode === '' ? null : data.ticketMethodCode,
        address: data.address === '' ? null : data.address,
        latitude: data.latitude === '' ? null : Number(data.latitude),
        longitude: data.longitude === '' ? null : Number(data.longitude),
      };

      if (id) {
        await organizationRepository.update({ ...payload, id } as any);
        toast.success(t('common.recordUpdated') || "Organization updated successfully");
      } else {
        await organizationRepository.create(payload as any);
        toast.success(t('common.recordCreated') || "Organization created successfully");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.back();
      }
    } catch (error) {
      console.error("Error saving organization:", error);
      toast.error("Error saving organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowConfirmCancel(true);
    } else if (onCancel) {
      reset();
      onCancel();
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleCancel} className="gap-2 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          {t('common.back')}
        </Button>
      </div>

      <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-accent/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Building2 size={24} />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight">
                {id ? t(ORGANIZATION_CONSTANTS.EDIT_TITLE) : t(ORGANIZATION_CONSTANTS.CREATE_TITLE)}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {id ? t(ORGANIZATION_CONSTANTS.DESCRIPTION_EDIT) : t(ORGANIZATION_CONSTANTS.DESCRIPTION_TITLE)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form id="organization-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(ORGANIZATION_CONSTANTS.FORM.CODE)}</label>
                <Input {...register("code")} className={cn(errors.code && "border-destructive focus-visible:ring-destructive/20")} />
                {errors.code && <p className="text-[10px] text-destructive font-medium ml-1">{errors.code.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(ORGANIZATION_CONSTANTS.FORM.NAME)}</label>
                <Input {...register("name")} className={cn(errors.name && "border-destructive focus-visible:ring-destructive/20")} />
                {errors.name && <p className="text-[10px] text-destructive font-medium ml-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(ORGANIZATION_CONSTANTS.FORM.TYPE)}</label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">{t(ORGANIZATION_CONSTANTS.FORM.SELECT_OPTION)}</option>
                      {typeOptions.map((opt: any, idx: number) => {
                        const val = opt.KEY ?? opt.CODE ?? opt.VALUE ?? opt.ID ?? opt.code ?? opt.value ?? opt.id ?? opt.fullCode ?? opt;
                        const label = opt.NAME || opt.name || opt.label || opt.description || val || `Option ${idx}`;
                        return (
                          <option key={`${val}-${idx}`} value={val}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  )}
                />
                {errors.type && <p className="text-[10px] text-destructive font-medium ml-1">{errors.type.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(ORGANIZATION_CONSTANTS.FORM.PARENT_ORG)}</label>
                <Controller
                  name="organizationId"
                  control={control}
                  render={({ field }) => (
                    <select
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">{t(ORGANIZATION_CONSTANTS.FORM.SELECT_OPTION)}</option>
                      {parentOrganizations.map((org: any, idx: number) => (
                        <option key={`${org.id}-${idx}`} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(ORGANIZATION_CONSTANTS.FORM.MAX_ATTENTION)}</label>
                <Input type="number" {...register("maxAttentionSchedule", { valueAsNumber: true })} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(ORGANIZATION_CONSTANTS.FORM.TICKET_METHOD)}</label>
                <Controller
                  name="ticketMethodCode"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                    >
                      <option value="">{t(ORGANIZATION_CONSTANTS.FORM.SELECT_OPTION)}</option>
                      {(parametersData[P_TICKET_METHOD] || []).map((opt: any, idx: number) => {
                        const val = opt.KEY ?? opt.CODE ?? opt.VALUE ?? opt.ID ?? opt.code ?? opt.value ?? opt.id ?? opt.fullCode ?? opt;
                        const label = opt.NAME || opt.name || opt.label || opt.description || val || `Option ${idx}`;
                        return (
                          <option key={`${val}-${idx}`} value={val}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  )}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(ORGANIZATION_CONSTANTS.FORM.ADDRESS)}</label>
                <Input {...register("address")} />
              </div>
              
              {/* Map Coordinates Section */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Ubicación</label>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Latitude</label>
                    <Input {...register("latitude")} type="number" step="any" readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Longitude</label>
                    <Input {...register("longitude")} type="number" step="any" readOnly className="bg-muted" />
                  </div>
                </div>
                <div className="h-[400px] w-full rounded-md border border-border/50 overflow-hidden">
                  <MapPicker
                    latitude={Number(watch('latitude')) || 0}
                    longitude={Number(watch('longitude')) || 0}
                    onChange={(lat, lng) => {
                      setValue('latitude', lat, { shouldValidate: true, shouldDirty: true });
                      setValue('longitude', lng, { shouldValidate: true, shouldDirty: true });
                    }}
                  />
                </div>
              </div>

            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t border-border/40 bg-accent/5 p-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={handleCancel} disabled={isSubmitting}>
            <X size={18} className="mr-2" />
            {t(ORGANIZATION_CONSTANTS.FORM.CANCEL)}
          </Button>
          <Button form="organization-form" type="submit" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
            {t(ORGANIZATION_CONSTANTS.FORM.SUBMIT)}
          </Button>
        </CardFooter>
      </Card>

      <ConfirmDialog
        open={showConfirmCancel}
        onOpenChange={setShowConfirmCancel}
        title={t(ORGANIZATION_CONSTANTS.FORM.CONFIRM_CANCEL)}
        description={t(ORGANIZATION_CONSTANTS.FORM.DIRTY_WARNING)}
        confirmText={t(ORGANIZATION_CONSTANTS.FORM.YES)}
        cancelText={t(ORGANIZATION_CONSTANTS.FORM.NO)}
        onConfirm={() => {
          setShowConfirmCancel(false);
          if (onCancel) {
            reset();
            onCancel();
          } else {
            router.back();
          }
        }}
        type="warning"
      />
    </div>
  );
};
