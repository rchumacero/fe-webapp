"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@kplian/i18n';
import { SCHEDULE_CONSTANTS } from '../../constants/schedule-constants';
import { ScheduleRepositoryImpl } from '../../infrastructure/ScheduleRepositoryImpl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, X, Loader2, Clock, Calendar as CalendarIcon, Hash, Users, Building } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { SCHEDULE_DOMAIN_PARAMETERS, P_DAY, P_UNIT_MEASURE } from '../../constants/parameter';
import { useVendor } from '@/hooks/use-vendor';
import { PersonRepositoryImpl } from '@/modules/crm/personal-data/person/infrastructure/repositories/PersonRepositoryImpl';
import { Person } from '@/modules/crm/personal-data/person/domain/entities/Person';
import { OrganizationRepositoryImpl } from '@/modules/crm/personal-data/organization/infrastructure/repositories/OrganizationRepositoryImpl';
import { Organization } from '@/modules/crm/personal-data/organization/domain/entities/Organization';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const scheduleRepository = new ScheduleRepositoryImpl();
const personRepository = new PersonRepositoryImpl();
const organizationRepository = new OrganizationRepositoryImpl();

const scheduleSchema = z.object({
  commercialProductId: z.string().min(1, "Commercial Product is required"),
  organizationId: z.string().min(1, "Organization is required"),
  collaboratorId: z.string().min(1, "Collaborator is required"),
  dayCode: z.string().min(1, "Day is required"),
  fromTime: z.string().min(1, "Start time is required"),
  toTime: z.string().min(1, "End time is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitMeasureCode: z.string().min(1, "Unit of measure is required"),
  status: z.string().optional().default('ACTIVE'),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface ScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  id?: string | null;
  commercialProductId: string;
  initialDay?: string;
  initialFromTime?: string;
  initialToTime?: string;
}

export function ScheduleFormModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  id, 
  commercialProductId,
  initialDay,
  initialFromTime,
  initialToTime
}: ScheduleFormModalProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const { vendor } = useVendor();
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
    if (!vendor) return;
    setIsLoadingOrganizations(true);
    try {
      const data = await organizationRepository.getAllByPersonId(vendor);
      setOrganizations(data);
    } catch (error) {
      console.error("Error fetching organizations by vendor:", error);
    } finally {
      setIsLoadingOrganizations(false);
    }
  }, [vendor]);

  useEffect(() => {
    if (isOpen) {
      fetchPersons();
      fetchOrganizations();
    }
  }, [isOpen, fetchPersons, fetchOrganizations]);

  const { data: parametersData } = useDomainParameters({
    parameters: SCHEDULE_DOMAIN_PARAMETERS
  });

  const dayOptions = parametersData[P_DAY] || [];
  const unitMeasureOptions = parametersData[P_UNIT_MEASURE] || [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      commercialProductId: commercialProductId || '',
      organizationId: '',
      collaboratorId: '',
      dayCode: initialDay || 'MON',
      fromTime: initialFromTime || '08:00',
      toTime: initialToTime || '09:00',
      quantity: 1,
      unitMeasureCode: 'UNIT',
      status: 'ACTIVE',
    }
  });

  useEffect(() => {
    if (id && isOpen) {
      const fetchSchedule = async () => {
        setIsLoading(true);
        try {
          const data = await scheduleRepository.getById(id);
          reset({
            commercialProductId: data.commercialProductId,
            organizationId: data.organizationId,
            collaboratorId: data.collaboratorId,
            dayCode: data.dayCode,
            fromTime: data.fromTime,
            toTime: data.toTime,
            quantity: data.quantity,
            unitMeasureCode: data.unitMeasureCode,
            status: data.status || 'ACTIVE',
          });
        } catch (error) {
          console.error("Error fetching schedule:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSchedule();
    } else if (isOpen) {
      reset({
        commercialProductId: commercialProductId || '',
        organizationId: '',
        collaboratorId: '',
        dayCode: initialDay || 'MON',
        fromTime: initialFromTime || '08:00',
        toTime: initialToTime || '09:00',
        quantity: 1,
        unitMeasureCode: 'UNIT',
        status: 'ACTIVE',
      });
    }
  }, [id, isOpen, reset, commercialProductId, initialDay, initialFromTime, initialToTime]);

  const onSubmit = async (data: ScheduleFormData) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await scheduleRepository.update({ ...data, id });
      } else {
        await scheduleRepository.create(data);
      }
      onSuccess();
      onClose();
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
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl bg-transparent">
        <div className="bg-background/95 backdrop-blur-xl border border-border/40 rounded-xl overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 bg-primary/5 border-b border-border/10">
            <DialogTitle className="text-2xl font-black tracking-tight text-foreground uppercase">
              {id ? t(SCHEDULE_CONSTANTS.EDIT_TITLE) : t(SCHEDULE_CONSTANTS.CREATE_TITLE)}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              {id ? t(SCHEDULE_CONSTANTS.DESCRIPTION_EDIT) : t(SCHEDULE_CONSTANTS.DESCRIPTION_TITLE)}
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center p-20">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1 flex items-center gap-2">
                    <Users size={12} className="text-primary" /> {t(SCHEDULE_CONSTANTS.FORM.COLLABORATOR)}
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
                            "w-full h-11 px-3 py-2 text-sm bg-card/50 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none",
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
                  {errors.collaboratorId && <p className="text-[10px] text-destructive font-bold uppercase ml-1">{errors.collaboratorId.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1 flex items-center gap-2">
                    <Building size={12} className="text-primary" /> {t(SCHEDULE_CONSTANTS.FORM.ORGANIZATION)}
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
                            "w-full h-11 px-3 py-2 text-sm bg-card/50 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none",
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
                  {errors.organizationId && <p className="text-[10px] text-destructive font-bold uppercase ml-1">{errors.organizationId.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1 flex items-center gap-2">
                    <CalendarIcon size={12} className="text-primary" /> {t(SCHEDULE_CONSTANTS.FORM.DAY)}
                  </label>
                  <Controller
                    name="dayCode"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full h-11 px-3 py-2 text-sm bg-card/50 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                      >
                        <option value="">{t(SCHEDULE_CONSTANTS.FORM.SELECT_OPTION) || 'Select Day'}</option>
                        {dayOptions.map((p: any, idx: number) => {
                          const val = (p.code || p.CODE || p.value || p.id || p.fullCode || (typeof p === 'string' ? p : '')).toUpperCase();
                          const label = p.name || p.NAME || p.label || p.description || val || `Item ${idx}`;
                          return (
                            <option key={`${val}-${idx}`} value={val}>
                              {t(SCHEDULE_CONSTANTS.DAYS[val as keyof typeof SCHEDULE_CONSTANTS.DAYS]) || label}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  />
                  {errors.dayCode && <p className="text-[10px] text-destructive font-bold uppercase ml-1">{errors.dayCode.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1 flex items-center gap-2">
                    <Clock size={12} className="text-primary" /> {t(SCHEDULE_CONSTANTS.FORM.STATUS)}
                  </label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full h-11 px-3 py-2 text-sm bg-card/50 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1 flex items-center gap-2">
                    <Clock size={12} className="text-primary" /> {t(SCHEDULE_CONSTANTS.FORM.FROM_TIME)}
                  </label>
                  <Input type="time" {...register("fromTime")} className="h-11 bg-card/50 border-border/40 rounded-lg" />
                  {errors.fromTime && <p className="text-[10px] text-destructive font-bold uppercase ml-1">{errors.fromTime.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1 flex items-center gap-2">
                    <Clock size={12} className="text-primary" /> {t(SCHEDULE_CONSTANTS.FORM.TO_TIME)}
                  </label>
                  <Input type="time" {...register("toTime")} className="h-11 bg-card/50 border-border/40 rounded-lg" />
                  {errors.toTime && <p className="text-[10px] text-destructive font-bold uppercase ml-1">{errors.toTime.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1 flex items-center gap-2">
                    <Hash size={12} className="text-primary" /> {t(SCHEDULE_CONSTANTS.FORM.QUANTITY)}
                  </label>
                  <Input type="number" {...register("quantity")} className="h-11 bg-card/50 border-border/40 rounded-lg" />
                  {errors.quantity && <p className="text-[10px] text-destructive font-bold uppercase ml-1">{errors.quantity.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1 flex items-center gap-2">
                    <Hash size={12} className="text-primary" /> {t(SCHEDULE_CONSTANTS.FORM.UNIT_MEASURE)}
                  </label>
                  <Controller
                    name="unitMeasureCode"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full h-11 px-3 py-2 text-sm bg-card/50 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                      >
                        <option value="">{t(SCHEDULE_CONSTANTS.FORM.SELECT_OPTION) || 'Select unit measure'}</option>
                        {unitMeasureOptions.map((p: any, idx: number) => {
                          const val = p.code || p.CODE || p.value || p.id || p.fullCode || (typeof p === 'string' ? p : '');
                          const label = p.name || p.NAME || p.label || p.description || val || `Item ${idx}`;
                          return (
                            <option key={`${val}-${idx}`} value={val}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  />
                  {errors.unitMeasureCode && <p className="text-[10px] text-destructive font-bold uppercase ml-1">{errors.unitMeasureCode.message}</p>}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 h-12 font-black uppercase tracking-wider transition-all active:scale-95"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                  {t(SCHEDULE_CONSTANTS.FORM.SUBMIT)}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all h-12 font-black uppercase tracking-wider active:scale-95"
                  onClick={handleCancel}
                >
                  <X className="mr-2 h-5 w-5" />
                  {t(SCHEDULE_CONSTANTS.FORM.CANCEL)}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>

      <ConfirmDialog
        open={showConfirmCancel}
        onOpenChange={setShowConfirmCancel}
        title={t(SCHEDULE_CONSTANTS.FORM.CONFIRM_CANCEL)}
        description={t(SCHEDULE_CONSTANTS.FORM.DIRTY_WARNING)}
        onConfirm={() => {
          setShowConfirmCancel(false);
          onClose();
        }}
      />
    </Dialog>
  );
}
