"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@kplian/i18n';
import { WAREHOUSE_CONSTANTS } from '../../constants/warehouse-constants';
import { WAREHOUSE_ROUTES } from '../../routes/warehouse-routes';
import { WarehouseRepositoryImpl } from '../../infrastructure/WarehouseRepositoryImpl';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Save, X, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useVendor } from '@/hooks/use-vendor';

const warehouseRepository = new WarehouseRepositoryImpl();

const warehouseSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(2, "Name is required"),
  type: z.string().min(1, "Type is required"),
  locationCode: z.string().min(1, "Location code is required"),
  address: z.string().optional().nullable(),
  costMethodCode: z.string().min(1, "Cost method code is required"),
  status: z.string().min(1, "Status is required"),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

interface WarehouseFormProps {
  id?: string;
}

export default function WarehouseFormPage({ id }: WarehouseFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { vendorCode } = useVendor();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  // Dropdown options
  const typeOptions = [
    { value: 'WAR', label: 'WAR - Warehouse' },
    { value: 'MAIN', label: 'MAIN - Main' },
    { value: 'WAT', label: 'WAT - Water/Transit' },
  ];

  const locationOptions = [
    { value: 'GEO', label: 'GEO - Geographic' },
    { value: 'LOC', label: 'LOC - Local' },
  ];

  const costMethodOptions = [
    { value: 'WAR', label: 'WAR - Weighted Average' },
    { value: 'MAIN', label: 'MAIN - Standard Cost' },
    { value: 'TVAL', label: 'TVAL - Total Valuation' },
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      code: '',
      name: '',
      type: 'WAR',
      locationCode: 'GEO',
      address: '',
      costMethodCode: 'WAR',
      status: 'ACTIVE',
    }
  });

  useEffect(() => {
    if (id) {
      const fetchWarehouse = async () => {
        setIsLoading(true);
        try {
          const warehouse = await warehouseRepository.getById(id);
          reset({
            code: warehouse.code || '',
            name: warehouse.name || '',
            type: warehouse.type || 'WAR',
            locationCode: warehouse.locationCode || 'GEO',
            address: warehouse.address || '',
            costMethodCode: warehouse.costMethodCode || 'WAR',
            status: warehouse.status || 'ACTIVE',
          });
        } catch (error) {
          console.error("Error fetching warehouse:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchWarehouse();
    }
  }, [id, reset]);

  const onSubmit: SubmitHandler<WarehouseFormData> = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        vendorCode: vendorCode || undefined
      };
 
      if (id) {
        await warehouseRepository.update({ ...payload, id });
      } else {
        await warehouseRepository.create(payload);
      }
      router.push(WAREHOUSE_ROUTES.LIST);
    } catch (error) {
      console.error("Error saving warehouse:", error);
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
    router.push(WAREHOUSE_ROUTES.LIST);
  };

  const confirmCancel = () => {
    setShowConfirmCancel(false);
    router.push(WAREHOUSE_ROUTES.LIST);
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
            className="rounded-full hover:bg-accent/50 text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              {id ? t(WAREHOUSE_CONSTANTS.EDIT_TITLE) || 'Edit Warehouse' : t(WAREHOUSE_CONSTANTS.CREATE_TITLE) || 'Create Warehouse'}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {id ? t(WAREHOUSE_CONSTANTS.DESCRIPTION_EDIT) || 'Edit warehouse details' : t(WAREHOUSE_CONSTANTS.DESCRIPTION_TITLE) || 'Define a new warehouse'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="border-border/40 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm h-full">
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(WAREHOUSE_CONSTANTS.FORM.CODE) || 'Code'}</label>
                  <Input {...register("code")} className={errors.code ? "border-destructive focus-visible:ring-destructive/20 text-foreground" : "text-foreground"} />
                  {errors.code && <p className="text-[10px] text-destructive font-medium ml-1">{errors.code.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(WAREHOUSE_CONSTANTS.FORM.NAME) || 'Name'}</label>
                  <Input {...register("name")} className={errors.name ? "border-destructive focus-visible:ring-destructive/20 text-foreground" : "text-foreground"} />
                  {errors.name && <p className="text-[10px] text-destructive font-medium ml-1">{errors.name.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(WAREHOUSE_CONSTANTS.FORM.TYPE) || 'Type'}</label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                      >
                        {typeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.type && <p className="text-[10px] text-destructive font-medium ml-1">{errors.type.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(WAREHOUSE_CONSTANTS.FORM.LOCATION_CODE) || 'Location Code'}</label>
                  <Controller
                    name="locationCode"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                      >
                        {locationOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.locationCode && <p className="text-[10px] text-destructive font-medium ml-1">{errors.locationCode.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(WAREHOUSE_CONSTANTS.FORM.COST_METHOD_CODE) || 'Cost Method'}</label>
                  <Controller
                    name="costMethodCode"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                      >
                        {costMethodOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.costMethodCode && <p className="text-[10px] text-destructive font-medium ml-1">{errors.costMethodCode.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(WAREHOUSE_CONSTANTS.FORM.ADDRESS) || 'Address'}</label>
                <Input {...register("address")} className="text-foreground" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(WAREHOUSE_CONSTANTS.FORM.STATUS) || 'Status'}</label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.status && <p className="text-[10px] text-destructive font-medium ml-1">{errors.status.message}</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-primary/20 bg-primary/5 shadow-xl border-dashed">
            <CardHeader>
              <CardTitle className="text-base font-bold text-primary">{t(WAREHOUSE_CONSTANTS.FORM.FORM_STATUS) || 'Form Status'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{t(WAREHOUSE_CONSTANTS.FORM.FORM_MODIFIED) || 'Modified:'}</span>
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
                {t(WAREHOUSE_CONSTANTS.FORM.SUBMIT)}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all h-12 font-bold"
                onClick={handleCancel}
              >
                <X className="mr-2 h-5 w-5" />
                {t(WAREHOUSE_CONSTANTS.FORM.CANCEL)}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>

      <ConfirmDialog
        open={showConfirmCancel}
        onOpenChange={setShowConfirmCancel}
        title={t(WAREHOUSE_CONSTANTS.FORM.CONFIRM_CANCEL) || 'Discard Changes?'}
        description={t(WAREHOUSE_CONSTANTS.FORM.DIRTY_WARNING) || "You have unsaved changes. Are you sure you want to cancel and lose your progress?"}
        confirmText={t(WAREHOUSE_CONSTANTS.FORM.YES_DISCARD) || 'Yes, Discard'}
        cancelText={t(WAREHOUSE_CONSTANTS.FORM.NO_STAY) || 'No, Stay'}
        onConfirm={confirmCancel}
        type="warning"
      />
    </div>
  );
}
