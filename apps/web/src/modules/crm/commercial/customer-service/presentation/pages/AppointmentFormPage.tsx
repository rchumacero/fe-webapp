"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@kplian/i18n';
import { CUSTOMER_SERVICE_CONSTANTS } from '../../constants/customer-service-constants';
import { CUSTOMER_SERVICE_ROUTES } from '../../routes/customer-service-routes';
import { CustomerServiceRepositoryImpl } from '../../infrastructure/repositories/CustomerServiceRepositoryImpl';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Save, X, ArrowLeft, Loader2, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PersonRepositoryImpl } from '@/modules/crm/personal-data/person/infrastructure/repositories/PersonRepositoryImpl';
import { useVendor } from '@/hooks/use-vendor';
import { Person } from '@/modules/crm/personal-data/person/domain/entities/Person';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { CUSTOMER_SERVICE_DOMAIN_PARAMETERS, P_STATUS, P_CURRENCY } from '../../constants/parameter';

const customerServiceRepository = new CustomerServiceRepositoryImpl();
const personRepository = new PersonRepositoryImpl();

const campaignSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(2, "Name is required"),
  fromDate: z.string().min(1, "From date is required"),
  toDate: z.string().min(1, "To date is required"),
  currencyCode: z.string().min(1, "Currency is required"),
  defaultSpreadPercent: z.coerce.number().min(0),
  status: z.string().min(1, "Status is required"),
  priority: z.coerce.number().min(1),
  personId: z.string().optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
  id?: string;
  mode?: 'general' | 'custom';
}

export default function CampaignFormPage({ id, mode = 'custom' }: CampaignFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { vendor } = useVendor();
  const [persons, setPersons] = useState<Person[]>([]);

  const { data: parametersData } = useDomainParameters({
    parameters: CUSTOMER_SERVICE_DOMAIN_PARAMETERS
  });

  const statusOptions = parametersData[P_STATUS] || [];
  const currencyOptions = parametersData[P_CURRENCY] || [];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      code: '',
      name: '',
      fromDate: '',
      toDate: '',
      currencyCode: 'USD',
      defaultSpreadPercent: 0,
      status: 'ACTIVE',
      priority: 1,
      personId: '',
    }
  });

  useEffect(() => {
    if (vendor && mode !== 'general') {
      const fetchPersons = async () => {
        try {
          const data = await personRepository.getByVendorId(vendor, { page: 1, pageSize: 1000 });
          setPersons(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Error fetching persons:", error);
        }
      };
      fetchPersons();
    }
  }, [vendor, mode]);

  useEffect(() => {
    if (id) {
      const fetchCampaign = async () => {
        setIsLoading(true);
        try {
          const campaign = await customerServiceRepository.getById(id);
          const data: CampaignFormData = {
            code: campaign.code || '',
            name: campaign.name || '',
            fromDate: campaign.fromDate ? campaign.fromDate.split('T')[0] : '',
            toDate: campaign.toDate ? campaign.toDate.split('T')[0] : '',
            currencyCode: campaign.currencyCode || 'USD',
            defaultSpreadPercent: campaign.defaultSpreadPercent || 0,
            status: campaign.status || 'ACTIVE',
            priority: campaign.priority || 1,
            personId: campaign.personId || '',
          };
          reset(data);
        } catch (error) {
          console.error("Error fetching campaign:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCampaign();
    }
  }, [id, reset]);

  const onSubmit: SubmitHandler<CampaignFormData> = async (formData) => {
    setIsSubmitting(true);
    try {
      const dataToSave = {
        ...formData,
        fromDate: new Date(formData.fromDate).toISOString(),
        toDate: new Date(formData.toDate).toISOString(),
      };

      if (id) {
        await customerServiceRepository.update({ ...dataToSave, id });
      } else {
        await customerServiceRepository.create(dataToSave);
      }
      router.push(mode === 'general' ? '/crm/commercial/campaign/general' : '/crm/commercial/campaign/custom');
    } catch (error) {
      console.error("Error saving campaign:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    if (isDirty) {
      e.preventDefault();
      setShowConfirmCancel(true);
      return;
    }
    router.push(mode === 'general' ? '/crm/commercial/campaign/general' : '/crm/commercial/campaign/custom');
  };

  const confirmCancel = () => {
    setShowConfirmCancel(false);
    router.push(mode === 'general' ? '/crm/commercial/campaign/general' : '/crm/commercial/campaign/custom');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between border-b border-border/10 pb-2">
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
              {id ? t(CUSTOMER_SERVICE_CONSTANTS.CREATE_TITLE) : t(CUSTOMER_SERVICE_CONSTANTS.CREATE_TITLE)}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">{id ? t(CUSTOMER_SERVICE_CONSTANTS.DESCRIPTION_EDIT) : t(CUSTOMER_SERVICE_CONSTANTS.DESCRIPTION_TITLE)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="border-border/40 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm h-full">
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(CUSTOMER_SERVICE_CONSTANTS.FORM.CODE)}</label>
                  <Input {...register("code")} className={errors.code ? "border-destructive focus-visible:ring-destructive/20" : ""} />
                  {errors.code && <p className="text-[10px] text-destructive font-medium ml-1">{errors.code.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(CUSTOMER_SERVICE_CONSTANTS.FORM.STATUS)}</label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                      >
                        <option value="">{t(CUSTOMER_SERVICE_CONSTANTS.FORM.SELECT_OPTION) || 'Select status'}</option>
                        {statusOptions.map((p: any, idx: number) => {
                          const val = p.CODE || p.value || p.id || p.fullCode || p;
                          const label = p.NAME || p.name || p.label || p.description || val || `Item ${idx}`;
                          return (
                            <option key={`${val}-${idx}`} value={val}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  />
                  {errors.status && <p className="text-[10px] text-destructive font-medium ml-1">{errors.status.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(CUSTOMER_SERVICE_CONSTANTS.FORM.NAME)}</label>
                <Input {...register("name")} className={errors.name ? "border-destructive focus-visible:ring-destructive/20" : ""} />
                {errors.name && <p className="text-[10px] text-destructive font-medium ml-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                    <Calendar size={14} className="text-primary/60" />
                    {t(CUSTOMER_SERVICE_CONSTANTS.FORM.FROM_DATE)}
                  </label>
                  <input
                    type="date"
                    {...register("fromDate")}
                    className={`flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all ${errors.fromDate ? "border-destructive" : ""}`}
                  />
                  {errors.fromDate && <p className="text-[10px] text-destructive font-medium ml-1">{errors.fromDate.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                    <Calendar size={14} className="text-primary/60" />
                    {t(CUSTOMER_SERVICE_CONSTANTS.FORM.TO_DATE)}
                  </label>
                  <input
                    type="date"
                    {...register("toDate")}
                    className={`flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all ${errors.toDate ? "border-destructive" : ""}`}
                  />
                  {errors.toDate && <p className="text-[10px] text-destructive font-medium ml-1">{errors.toDate.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(CUSTOMER_SERVICE_CONSTANTS.FORM.CURRENCY_CODE)}</label>
                  <Controller
                    name="currencyCode"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                      >
                        <option value="">{t(CUSTOMER_SERVICE_CONSTANTS.FORM.SELECT_OPTION) || 'Select currency'}</option>
                        {currencyOptions.map((p: any, idx: number) => {
                          const val = p.CODE || p.value || p.id || p.fullCode || p;
                          const label = p.NAME || p.name || p.label || p.description || val || `Item ${idx}`;
                          return (
                            <option key={`${val}-${idx}`} value={val}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  />
                  {errors.currencyCode && <p className="text-[10px] text-destructive font-medium ml-1">{errors.currencyCode.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(CUSTOMER_SERVICE_CONSTANTS.FORM.DEFAULT_SPREAD_PERCENT)}</label>
                  <Input type="number" step="0.01" {...register("defaultSpreadPercent")} className={errors.defaultSpreadPercent ? "border-destructive focus-visible:ring-destructive/20" : ""} />
                  {errors.defaultSpreadPercent && <p className="text-[10px] text-destructive font-medium ml-1">{errors.defaultSpreadPercent.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(CUSTOMER_SERVICE_CONSTANTS.FORM.PRIORITY)}</label>
                  <Input type="number" {...register("priority")} className={errors.priority ? "border-destructive focus-visible:ring-destructive/20" : ""} />
                  {errors.priority && <p className="text-[10px] text-destructive font-medium ml-1">{errors.priority.message}</p>}
                </div>
              </div>

              {mode !== 'general' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(CUSTOMER_SERVICE_CONSTANTS.FORM.CUSTOMER)}</label>
                  <Controller
                    name="personId"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                      >
                        <option value="">{t('common.selectOption') || 'Select a customer'}</option>
                        {persons.map(person => (
                          <option key={person.id} value={person.id}>
                            {person.completeName} ({person.code})
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.personId && <p className="text-[10px] text-destructive font-medium ml-1">{errors.personId.message}</p>}
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-primary/20 bg-primary/5 shadow-xl border-dashed">
            <CardHeader>
              <CardTitle className="text-base font-bold text-primary">{t(CUSTOMER_SERVICE_CONSTANTS.FORM.FORM_STATUS) || 'Form Status'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{t(CUSTOMER_SERVICE_CONSTANTS.FORM.FORM_MODIFIED) || 'Modified:'}</span>
                <span className={isDirty ? "text-amber-500 font-bold" : "text-emerald-500 font-bold"}>
                  {isDirty ? "YES" : "NO"}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-6 pb-8 px-6">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 h-12 font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                {t(CUSTOMER_SERVICE_CONSTANTS.FORM.SUBMIT)}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all h-12 font-bold"
                onClick={handleCancel}
              >
                <X className="mr-2 h-5 w-5" />
                {t(CUSTOMER_SERVICE_CONSTANTS.FORM.CANCEL)}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>

      <ConfirmDialog
        open={showConfirmCancel}
        onOpenChange={setShowConfirmCancel}
        title={t(CUSTOMER_SERVICE_CONSTANTS.FORM.CONFIRM_CANCEL, 'Discard Changes?')}
        description={t(CUSTOMER_SERVICE_CONSTANTS.FORM.DIRTY_WARNING) || "You have unsaved changes. Are you sure you want to cancel and lose your progress?"}
        confirmText={t(CUSTOMER_SERVICE_CONSTANTS.FORM.YES_DISCARD, 'Yes, Discard')}
        cancelText={t(CUSTOMER_SERVICE_CONSTANTS.FORM.NO_STAY, 'No, Stay')}
        onConfirm={confirmCancel}
        type="warning"
      />
    </div>
  );
}
