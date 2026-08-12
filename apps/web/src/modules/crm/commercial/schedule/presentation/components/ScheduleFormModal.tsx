"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@kplian/i18n';
import { Schedule, CreateScheduleDto, UpdateScheduleDto } from '@kplian/core';
import { ScheduleRepositoryImpl } from '@kplian/infrastructure';
import { SCHEDULE_CONSTANTS } from '../../constants/schedule-constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, X, Loader2, Clock, Calendar as CalendarIcon, Hash, Users, Building, AlignLeft } from 'lucide-react';
import { useForm, Controller, useWatch } from 'react-hook-form';
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
  organizationId: z.string().min(1, "Organization is required"),
  collaboratorId: z.string().optional().nullable(),
  commercialProductId: z.string().optional().nullable(),
  fromDate: z.string().min(1, "From date is required"),
  toDate: z.string().min(1, "To date is required"),
  quantity: z.coerce.number().min(0, "Quantity must be positive").optional().nullable(),
  status: z.string().optional().default('ACTIVE'),
  repeat: z.boolean().optional().default(false),
  until: z.string().optional().nullable(),
  notes: z.string().max(2000, "Notes cannot exceed 2000 characters").optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.repeat && !data.until) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Until date is required when Repeat is selected",
      path: ["until"]
    });
  }
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface ScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  id?: string | null;
  commercialProductId: string;
  collaboratorId?: string;
  initialDay?: string;
  initialFromTime?: string;
  initialToTime?: string;
  selectedDateWeekRef?: Date;
}

export function ScheduleFormModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  id, 
  commercialProductId,
  collaboratorId,
  initialDay,
  initialFromTime,
  initialToTime,
  selectedDateWeekRef
}: ScheduleFormModalProps) {
  const { t } = useTranslation();
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
    console.log("fetchOrganizations debug: vendor =", vendor, "relatedVendors =", relatedVendors);
    let companyId = vendor;
    if (relatedVendors && relatedVendors.length > 0) {
      const currentVendorObj = relatedVendors.find(v => v.id === vendor);
      console.log("fetchOrganizations debug: found currentVendorObj =", currentVendorObj);
      if (currentVendorObj?.isSelf) {
        const company = relatedVendors.find(v => !v.isSelf);
        console.log("fetchOrganizations debug: found company =", company);
        if (company) {
          companyId = company.id;
        }
      }
    }

    console.log("fetchOrganizations debug: final companyId being queried =", companyId);
    if (!companyId) return;
    setIsLoadingOrganizations(true);
    try {
      const data = await organizationRepository.getAllByPersonId(companyId);
      console.log("fetchOrganizations debug: received data =", data);
      setOrganizations(data);
    } catch (error) {
      console.error("Error fetching organizations by companyId:", error);
    } finally {
      setIsLoadingOrganizations(false);
    }
  }, [vendor, relatedVendors]);

  useEffect(() => {
    if (isOpen) {
      fetchPersons();
      fetchOrganizations();
    }
  }, [isOpen, fetchPersons, fetchOrganizations]);

  const { data: parametersData } = useDomainParameters({
    parameters: SCHEDULE_DOMAIN_PARAMETERS
  });

  const toLocalISOString = useCallback((dateInput: Date | string) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }, []);

  const getInitialDates = useCallback(() => {
    const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const d = new Date(selectedDateWeekRef || new Date());
    const targetIdx = daysOfWeek.indexOf(initialDay || 'MON');
    const currentIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
    const diff = targetIdx - currentIdx;
    d.setDate(d.getDate() + diff);
    
    const fromTimeStr = initialFromTime || '08:00';
    const toTimeStr = initialToTime || '09:00';
    
    const fromD = new Date(d);
    fromD.setHours(parseInt(fromTimeStr.split(':')[0]), parseInt(fromTimeStr.split(':')[1]), 0, 0);
    
    const toD = new Date(d);
    toD.setHours(parseInt(toTimeStr.split(':')[0]), parseInt(toTimeStr.split(':')[1]), 0, 0);
    
    return {
      fromDate: toLocalISOString(fromD),
      toDate: toLocalISOString(toD)
    };
  }, [selectedDateWeekRef, initialDay, initialFromTime, initialToTime, toLocalISOString]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      organizationId: '',
      collaboratorId: collaboratorId || '',
      commercialProductId: commercialProductId || '',
      fromDate: toLocalISOString(new Date()),
      toDate: toLocalISOString(new Date(Date.now() + 3600000)),
      quantity: 1,
      status: 'ACTIVE',
      repeat: false,
      until: '',
      notes: '',
    }
  });

  const repeatChecked = useWatch({ control, name: 'repeat' });

  useEffect(() => {
    if (id && isOpen) {
      const fetchSchedule = async () => {
        setIsLoading(true);
        try {
          const data = await scheduleRepository.getById(id);
          reset({
            organizationId: data.organizationId,
            collaboratorId: data.collaboratorId || collaboratorId || null,
            commercialProductId: data.commercialProductId || commercialProductId || null,
            fromDate: data.fromDate ? toLocalISOString(data.fromDate) : '',
            toDate: data.toDate ? toLocalISOString(data.toDate) : '',
            quantity: data.quantity || 1,
            status: data.status || 'ACTIVE',
            repeat: data.until ? true : false,
            until: data.until ? toLocalISOString(data.until).slice(0, 10) : '',
            notes: data.notes || '',
          });
        } catch (error) {
          console.error("Error fetching schedule:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSchedule();
    } else if (isOpen) {
      const dates = getInitialDates();
      reset({
        organizationId: '',
        collaboratorId: collaboratorId || '',
        commercialProductId: commercialProductId || '',
        fromDate: dates.fromDate,
        toDate: dates.toDate,
        quantity: 1,
        status: 'ACTIVE',
        repeat: false,
        until: '',
        notes: '',
      });
    }
  }, [id, isOpen, reset, getInitialDates, collaboratorId, commercialProductId, toLocalISOString]);

  const onSubmit = async (data: ScheduleFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        organizationId: data.organizationId,
        collaboratorId: data.collaboratorId,
        commercialProductId: data.commercialProductId,
        fromDate: new Date(data.fromDate),
        toDate: new Date(data.toDate),
        quantity: data.quantity,
        status: data.status,
        until: data.repeat && data.until ? new Date(data.until) : null,
        notes: data.notes,
      };
      if (id) {
        await scheduleRepository.update({ ...payload, id });
      } else {
        await scheduleRepository.create(payload as any);
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end border border-border/20 bg-primary/5 p-4 rounded-xl">
                <div className="flex items-center gap-2 h-11 px-3 border border-border/40 bg-card/50 rounded-lg">
                  <Controller
                    name="repeat"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="repeat"
                        checked={!!field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="size-4 rounded border-border/50 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                      />
                    )}
                  />
                  <label htmlFor="repeat" className="text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer select-none">
                    Repeat Weekly
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1">
                    Until Date
                  </label>
                  <Input
                    type="date"
                    {...register("until")}
                    disabled={!repeatChecked}
                    className={cn(
                      "h-11 bg-card/50 border-border/40 rounded-lg",
                      !repeatChecked && "opacity-50 cursor-not-allowed bg-muted"
                    )}
                  />
                  {errors.until && <p className="text-[10px] text-destructive font-bold uppercase ml-1">{errors.until.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {collaboratorId && (
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
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value)}
                            disabled={true}
                            className="w-full h-11 px-3 py-2 text-sm bg-muted border border-border/40 rounded-lg opacity-80 cursor-not-allowed appearance-none"
                          >
                            <option value="">
                              {t(SCHEDULE_CONSTANTS.FORM.SELECT_OPTION) || 'Select Collaborator'}
                            </option>
                            {persons.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.completeName || `${p.name1 ?? ''} ${p.surname1 ?? ''}`.trim() || p.code}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    />
                    {errors.collaboratorId && <p className="text-[10px] text-destructive font-bold uppercase ml-1">{errors.collaboratorId.message}</p>}
                  </div>
                )}


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
                    <CalendarIcon size={12} className="text-primary" /> From Date
                  </label>
                  <Input type="datetime-local" {...register("fromDate")} className="h-11 bg-card/50 border-border/40 rounded-lg" />
                  {errors.fromDate && <p className="text-[10px] text-destructive font-bold uppercase ml-1">{errors.fromDate.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1 flex items-center gap-2">
                    <CalendarIcon size={12} className="text-primary" /> To Date
                  </label>
                  <Input type="datetime-local" {...register("toDate")} className="h-11 bg-card/50 border-border/40 rounded-lg" />
                  {errors.toDate && <p className="text-[10px] text-destructive font-bold uppercase ml-1">{errors.toDate.message}</p>}
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

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 ml-1 flex items-center gap-2">
                  <AlignLeft size={12} className="text-primary" /> {t(SCHEDULE_CONSTANTS.FORM.NOTES)}
                </label>
                <Textarea 
                  {...register("notes")} 
                  className="min-h-[80px] bg-card/50 border-border/40 rounded-lg resize-y" 
                  placeholder={t(SCHEDULE_CONSTANTS.FORM.NOTES) || 'Notes'}
                />
                {errors.notes && <p className="text-[10px] text-destructive font-bold uppercase ml-1">{errors.notes.message}</p>}
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
