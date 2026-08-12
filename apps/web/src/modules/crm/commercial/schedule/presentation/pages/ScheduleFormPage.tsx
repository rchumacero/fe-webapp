"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@kplian/i18n';
import { SCHEDULE_CONSTANTS } from '../../constants/schedule-constants';
import { SCHEDULE_ROUTES } from '../../routes/schedule-routes';
import { Schedule, CreateScheduleDto, UpdateScheduleDto } from '@kplian/core';
import { ScheduleRepositoryImpl } from '@kplian/infrastructure';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, X, Loader2, Clock, Calendar as CalendarIcon, Hash, Users, Building, AlignLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { SCHEDULE_DOMAIN_PARAMETERS, P_DAY, P_UNIT_MEASURE, P_TYPE } from '../../constants/parameter';
import { useVendor } from '@/hooks/use-vendor';
import { PersonRepositoryImpl } from '@/modules/crm/personal-data/person/infrastructure/repositories/PersonRepositoryImpl';
import { Person } from '@/modules/crm/personal-data/person/domain/entities/Person';
import { OrganizationRepositoryImpl } from '@/modules/crm/personal-data/organization/infrastructure/repositories/OrganizationRepositoryImpl';
import { Organization } from '@/modules/crm/personal-data/organization/domain/entities/Organization';
import { cn } from '@/lib/utils';

const scheduleRepository = new ScheduleRepositoryImpl();
const personRepository = new PersonRepositoryImpl();
const organizationRepository = new OrganizationRepositoryImpl();

const scheduleSchema = z.object({
  organizationId: z.string().min(1, "Organization is required"),
  collaboratorId: z.string().optional().nullable(),
  fromDate: z.string().min(1, "From date is required"),
  toDate: z.string().min(1, "To date is required"),
  quantity: z.coerce.number().min(0, "Quantity must be positive").optional().nullable(),
  status: z.string().optional().default('ACTIVE'),
  type: z.string().optional().nullable(),
  notes: z.string().max(2000, "Notes cannot exceed 2000 characters").optional().nullable(),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface ScheduleFormPageProps {
  id?: string;
}

export default function ScheduleFormPage({ id }: ScheduleFormPageProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const commercialProductId = searchParams.get('commercialProductId');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const { vendor, relatedVendors } = useVendor();
  const [persons, setPersons] = useState<Person[]>([]);
  const [isLoadingPersons, setIsLoadingPersons] = useState(false);

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);

  const fetchPersons = useCallback(async () => {
    if (!vendor) return;
    setIsLoadingPersons(true);
    try {
      const data = await personRepository.getByVendorId(vendor);
      setPersons(data);
    } catch (error) {
      console.error("Error fetching persons by vendor:", error);
    } finally {
      setIsLoadingPersons(false);
    }
  }, [vendor]);

  const fetchOrganizations = useCallback(async () => {
    console.log("fetchOrganizations Page debug: vendor =", vendor, "relatedVendors =", relatedVendors);
    let companyId = vendor;
    if (relatedVendors && relatedVendors.length > 0) {
      const currentVendorObj = relatedVendors.find(v => v.id === vendor);
      console.log("fetchOrganizations Page debug: found currentVendorObj =", currentVendorObj);
      if (currentVendorObj?.isSelf) {
        const company = relatedVendors.find(v => !v.isSelf);
        console.log("fetchOrganizations Page debug: found company =", company);
        if (company) {
          companyId = company.id;
        }
      }
    }

    console.log("fetchOrganizations Page debug: final companyId being queried =", companyId);
    if (!companyId) return;
    setIsLoadingOrganizations(true);
    try {
      const data = await organizationRepository.getAllByPersonId(companyId);
      console.log("fetchOrganizations Page debug: received data =", data);
      setOrganizations(data);
    } catch (error) {
      console.error("Error fetching organizations by companyId:", error);
    } finally {
      setIsLoadingOrganizations(false);
    }
  }, [vendor, relatedVendors]);

  useEffect(() => {
    fetchPersons();
    fetchOrganizations();
  }, [fetchPersons, fetchOrganizations]);

  const { data: parametersData } = useDomainParameters({
    parameters: SCHEDULE_DOMAIN_PARAMETERS
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      organizationId: 'MAIN', // Default or fetch
      collaboratorId: 'SYSTEM', // Default or fetch
      fromDate: new Date().toISOString().slice(0, 16),
      toDate: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
      quantity: 1,
      status: 'ACTIVE',
      type: '',
      notes: '',
    }
  });

  useEffect(() => {
    if (id) {
      const fetchSchedule = async () => {
        setIsLoading(true);
        try {
          const data = await scheduleRepository.getById(id);
          reset({
            organizationId: data.organizationId,
            collaboratorId: data.collaboratorId || null,
            fromDate: data.fromDate ? new Date(data.fromDate).toISOString().slice(0, 16) : '',
            toDate: data.toDate ? new Date(data.toDate).toISOString().slice(0, 16) : '',
            quantity: data.quantity || 1,
            status: data.status || 'ACTIVE',
            type: data.type || '',
            notes: data.notes || '',
          });
        } catch (error) {
          console.error("Error fetching schedule:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSchedule();
    }
  }, [id, reset]);

  const onSubmit = async (data: ScheduleFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        fromDate: new Date(data.fromDate),
        toDate: new Date(data.toDate),
      };
      if (id) {
        await scheduleRepository.update({ ...payload, id });
      } else {
        await scheduleRepository.create(payload as any);
      }
      router.back();
    } catch (error) {
      console.error("Error saving schedule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowConfirmCancel(true);
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  // Static days replaced by dayOptions

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
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
              {id ? t(SCHEDULE_CONSTANTS.EDIT_TITLE) : t(SCHEDULE_CONSTANTS.CREATE_TITLE)}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {id ? t(SCHEDULE_CONSTANTS.DESCRIPTION_EDIT) : t(SCHEDULE_CONSTANTS.DESCRIPTION_TITLE)}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-border/40 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                <Users size={14} className="text-primary" /> {t(SCHEDULE_CONSTANTS.FORM.COLLABORATOR)}
              </label>
              <Controller
                name="collaboratorId"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <select
                      {...field}
                      disabled={isLoadingPersons || !vendor}
                      className={cn(
                        "w-full h-11 px-3 py-2 text-sm bg-card border border-border/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none",
                        errors.collaboratorId ? "border-destructive" : "focus:border-primary/40",
                        (isLoadingPersons || !vendor) && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      <option value="">
                        {isLoadingPersons
                          ? t('common.loading') || 'Loading...'
                          : t(SCHEDULE_CONSTANTS.FORM.SELECT_OPTION) || 'Select Collaborator'}
                      </option>
                      {persons.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.completeName || `${p.name1 ?? ''} ${p.surname1 ?? ''}`.trim() || p.code}
                        </option>
                      ))}
                    </select>
                    {isLoadingPersons && (
                      <Loader2
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground pointer-events-none"
                      />
                    )}
                  </div>
                )}
              />
              {errors.collaboratorId && <p className="text-[10px] text-destructive font-medium ml-1">{errors.collaboratorId.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                <Building size={14} className="text-primary" /> {t(SCHEDULE_CONSTANTS.FORM.ORGANIZATION)}
              </label>
              <Controller
                name="organizationId"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <select
                      {...field}
                      disabled={isLoadingOrganizations || !vendor}
                      className={cn(
                        "w-full h-11 px-3 py-2 text-sm bg-card border border-border/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none",
                        errors.organizationId ? "border-destructive" : "focus:border-primary/40",
                        (isLoadingOrganizations || !vendor) && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      <option value="">
                        {isLoadingOrganizations
                          ? t('common.loading') || 'Loading...'
                          : t(SCHEDULE_CONSTANTS.FORM.SELECT_OPTION) || 'Select Organization'}
                      </option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name || org.code}
                        </option>
                      ))}
                    </select>
                    {isLoadingOrganizations && (
                      <Loader2
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground pointer-events-none"
                      />
                    )}
                  </div>
                )}
              />
              {errors.organizationId && <p className="text-[10px] text-destructive font-medium ml-1">{errors.organizationId.message}</p>}
            </div>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                  <CalendarIcon size={14} className="text-primary" /> From Date
                </label>
                <Input type="datetime-local" {...register("fromDate")} className="h-11 bg-card/80 border-border/50" />
                {errors.fromDate && <p className="text-[10px] text-destructive font-medium ml-1">{errors.fromDate.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                  <CalendarIcon size={14} className="text-primary" /> To Date
                </label>
                <Input type="datetime-local" {...register("toDate")} className="h-11 bg-card/80 border-border/50" />
                {errors.toDate && <p className="text-[10px] text-destructive font-medium ml-1">{errors.toDate.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                  <Hash size={14} className="text-primary" /> {t(SCHEDULE_CONSTANTS.FORM.QUANTITY)}
                </label>
                <Input type="number" {...register("quantity")} className="h-11 bg-card/80 border-border/50" />
                {errors.quantity && <p className="text-[10px] text-destructive font-medium ml-1">{errors.quantity.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                  <Clock size={14} className="text-primary" /> {t(SCHEDULE_CONSTANTS.FORM.STATUS)}
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                  <Clock size={14} className="text-primary" /> Type
                </label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      value={field.value || ''}
                      className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer appearance-none"
                    >
                      <option value="">Select Type</option>
                      {(parametersData[P_TYPE] || []).map((param: any, idx: number) => {
                        const val = param.code || param.CODE || param.value || param.id || param.fullCode || (typeof param === 'string' ? param : '');
                        const label = param.name || param.NAME || param.label || param.description || val || `Item ${idx}`;
                        return (
                          <option key={`${val}-${idx}`} value={label}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                <AlignLeft size={14} className="text-primary" /> {t(SCHEDULE_CONSTANTS.FORM.NOTES) || 'Notes'}
              </label>
              <Textarea
                {...register("notes")}
                className="flex w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all min-h-[100px] resize-y"
                placeholder={t(SCHEDULE_CONSTANTS.FORM.NOTES) || 'Add any additional notes here...'}
              />
              {errors.notes && <p className="text-[10px] text-destructive font-medium ml-1">{errors.notes.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="bg-primary/5 p-8 flex gap-4">
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 h-12 font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {t(SCHEDULE_CONSTANTS.FORM.SUBMIT)}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all h-12 font-bold"
              onClick={handleCancel}
            >
              <X className="mr-2 h-5 w-5" />
              {t(SCHEDULE_CONSTANTS.FORM.CANCEL)}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <ConfirmDialog
        open={showConfirmCancel}
        onOpenChange={setShowConfirmCancel}
        title={t(SCHEDULE_CONSTANTS.FORM.CONFIRM_CANCEL)}
        description={t(SCHEDULE_CONSTANTS.FORM.DIRTY_WARNING)}
        onConfirm={() => router.back()}
      />
    </div>
  );
}
