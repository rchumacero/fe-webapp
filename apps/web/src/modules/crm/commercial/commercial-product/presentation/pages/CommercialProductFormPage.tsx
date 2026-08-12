"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@kplian/i18n';
import { COMMERCIAL_PRODUCT_CONSTANTS } from '../../constants/commercial-product-constants';
import { COMMERCIAL_PRODUCT_ROUTES } from '../../routes/commercial-product-routes';
import { CommercialProductRepositoryImpl, WarehouseRepositoryImpl, ProductRepositoryImpl } from '@kplian/infrastructure';
import { CampaignRepositoryImpl } from '../../../campaign/infrastructure/repositories/CampaignRepositoryImpl';
import { Campaign } from '../../../campaign/domain/entities/Campaign';
import { CAMPAIGN_ROUTES } from '../../../campaign/routes/campaign-routes';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { CommercialProduct, CreateCommercialProductDto, UpdateCommercialProductDto, Warehouse, Product } from '@kplian/core';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, X, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, SubmitHandler, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { COMMERCIAL_PRODUCT_DOMAIN_PARAMETERS, P_STATUS, P_PRICE_TYPE, P_CHANNEL, P_UNIT_MEASURE, PRODUCT_TYPE_UNIQUE, PRODUCT_TYPE_COMBO, P_SCHEDULE_TYPE, P_PLAN_SCHEDULE, P_TIME_BASED, P_REQUIRE_CONFIRMATION, P_ITEM_CODE } from '../../constants/parameter';
import { useVendor } from '@/hooks/use-vendor';

const commercialProductRepository = new CommercialProductRepositoryImpl();
const productRepository = new ProductRepositoryImpl();
const campaignRepository = new CampaignRepositoryImpl();
const warehouseRepository = new WarehouseRepositoryImpl();

const commercialProductSchema = z.object({
  campaignId: z.string().min(1, COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.CAMPAIGN_REQUIRED),
  code: z.string().min(1, COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.CODE_REQUIRED),
  name: z.string().min(2, COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.NAME_REQUIRED),
  description: z.string().optional().default(''),
  priceType: z.string().min(1, COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.PRICE_TYPE_REQUIRED),
  totalCost: z.coerce.number().min(0),
  channelCode: z.string().min(1, COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.CHANNEL_REQUIRED),
  status: z.string().min(1, COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.STATUS_REQUIRED),
  type: z.enum([PRODUCT_TYPE_UNIQUE, PRODUCT_TYPE_COMBO]),
  itemCode: z.string().optional().nullable(),
  cost: z.coerce.number().optional(),
  quantity: z.coerce.number().optional(),
  unitMeasureCode: z.string().optional(),
  planScheduleCode: z.string().optional(),
  scheduleTypeCode: z.string().optional().nullable(),
  timeBasedCode: z.string().optional().nullable(),
  requireConfirmationCode: z.string().optional().nullable(),
  warehouseCode: z.string().optional().nullable(),
  id: z.string().optional(),
}).superRefine((data, ctx) => {
  // Only enforce unique product fields if we are NOT in edit mode
  if (!data.id && data.type === PRODUCT_TYPE_UNIQUE) {
    if (!data.itemCode) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Product is required", path: ["itemCode"] });
    }
    if (data.cost === undefined || data.cost < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.COST_REQUIRED, path: ["cost"] });
    }
    if (data.quantity === undefined || data.quantity < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.QUANTITY_REQUIRED, path: ["quantity"] });
    }
    if (!data.unitMeasureCode) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.UNIT_MEASURE_REQUIRED, path: ["unitMeasureCode"] });
    }
  }
});

type CommercialProductFormData = z.infer<typeof commercialProductSchema>;

interface CommercialProductFormProps {
  id?: string;
  campaignId: string;
}

export default function CommercialProductFormPage({ id, campaignId }: CommercialProductFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { vendor, vendorCode } = useVendor();

  const { data: parametersData } = useDomainParameters({
    parameters: COMMERCIAL_PRODUCT_DOMAIN_PARAMETERS
  });

  const statusOptions = parametersData[P_STATUS] || [];
  const priceTypeOptions = parametersData[P_PRICE_TYPE] || [];
  const channelOptions = parametersData[P_CHANNEL] || [];
  const unitMeasureOptions = parametersData[P_UNIT_MEASURE] || [];
  const scheduleTypeOptions = parametersData[P_SCHEDULE_TYPE] || [];
  const planScheduleOptions = parametersData[P_PLAN_SCHEDULE] || [];
  const timeBasedOptions = parametersData[P_TIME_BASED] || [];
  const requireConfirmationOptions = parametersData[P_REQUIRE_CONFIRMATION] || [];
  const itemCodeOptions = parametersData[P_ITEM_CODE] || [];

  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CommercialProductFormData>({
    resolver: zodResolver(commercialProductSchema),
    defaultValues: {
      campaignId: campaignId,
      code: '',
      name: '',
      description: '',
      priceType: '',
      totalCost: 0,
      channelCode: '',
      status: 'ACTIVE',
      type: PRODUCT_TYPE_UNIQUE,
      planScheduleCode: '',
      scheduleTypeCode: null,
      timeBasedCode: null,
      requireConfirmationCode: null,
      warehouseCode: null,
      itemCode: '',
      cost: '',
      quantity: '',
      unitMeasureCode: '',
      id: id,
    }
  });

  const [numberProducts, setNumberProducts] = useState<number | null | undefined>(undefined);

  const type = useWatch({ control, name: 'type' });
  const itemCode = useWatch({ control, name: 'itemCode' });

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const data = await campaignRepository.getById(campaignId);
        setCampaign(data);
      } catch (error) {
        console.error("Error fetching campaign:", error);
      }
    };
    if (campaignId) fetchCampaign();
  }, [campaignId]);

  useEffect(() => {
    console.log("CommercialProductForm: Auto-fill triggered", { type, itemCode, itemsCount: itemCodeOptions.length });
    if (type === PRODUCT_TYPE_UNIQUE && itemCode && itemCodeOptions.length > 0) {
      const selectedItem = itemCodeOptions.find(p => {
        const val = p.code || p.CODE || p.value || p.id || p.fullCode || (typeof p === 'string' ? p : '');
        return val === itemCode;
      });
      console.log("CommercialProductForm: Selected Item found:", selectedItem);
      if (selectedItem) {
        const name = selectedItem.name || selectedItem.NAME || selectedItem.label || selectedItem.description || itemCode;
        setValue('code', itemCode, { shouldValidate: true, shouldDirty: true });
        setValue('name', name, { shouldValidate: true, shouldDirty: true });
        setValue('description', name, { shouldValidate: true, shouldDirty: true });
      }
    }
  }, [type, itemCode, itemCodeOptions, setValue]);

  useEffect(() => {
    console.log("CommercialProductForm: useEffect[vendorCode] triggered, vendorCode:", vendorCode);
    if (vendorCode) {
      const fetchBaseProducts = async () => {
        try {
          console.log("CommercialProductForm: Calling productRepository.getByVendor with vendorCode:", vendorCode);
          const data = await productRepository.getByVendor(vendorCode);
          console.log("CommercialProductForm: Base products received:", data?.length || 0, "items");
          setProducts(data);
        } catch (error) {
          console.error("CommercialProductForm: Error fetching base products:", error);
        }
      };
      fetchBaseProducts();
    } else {
      console.warn("CommercialProductForm: No vendorCode detected in useVendor() hook");
    }
  }, [vendorCode]);

  useEffect(() => {
    if (vendorCode) {
      const fetchWarehouses = async () => {
        try {
          console.log("CommercialProductForm: Calling warehouseRepository.getByVendor with vendorCode:", vendorCode);
          const data = await warehouseRepository.getByVendor(vendorCode);
          console.log("CommercialProductForm: Warehouses received:", data?.length || 0, "items");
          setWarehouses(data);
        } catch (error) {
          console.error("CommercialProductForm: Error fetching warehouses:", error);
        }
      };
      fetchWarehouses();
    }
  }, [vendorCode]);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        setIsLoading(true);
        try {
          const product = await commercialProductRepository.getById(id);
          reset({
            campaignId: product.campaignId,
            code: product.code,
            name: product.name,
            description: product.description || '',
            priceType: product.priceType,
            totalCost: product.totalCost,
            channelCode: product.channelCode,
            status: product.status || 'ACTIVE',
            type: (product.numberProducts ?? 0) > 1 ? PRODUCT_TYPE_COMBO : PRODUCT_TYPE_UNIQUE,
            itemCode: product.itemCode || product.productCode || '',
            cost: product.cost,
            quantity: product.quantity,
            unitMeasureCode: product.unitMeasureCode,
            planScheduleCode: product.planScheduleCode || '',
            scheduleTypeCode: product.scheduleTypeCode || null,
            timeBasedCode: product.timeBasedCode || null,
            requireConfirmationCode: product.requireConfirmationCode || null,
            warehouseCode: product.warehouseCode || null,
            id: product.id,
          });
          setNumberProducts(product.numberProducts);
        } catch (error) {
          console.error("Error fetching commercial product:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, reset]);

  const onSubmit: SubmitHandler<CommercialProductFormData> = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload: any = {
        ...formData,
        campaignId,
      };

      if (formData.type === PRODUCT_TYPE_UNIQUE) {
        payload.campaignProduct = {
          itemCode: formData.itemCode,
          cost: formData.cost,
          quantity: Number(formData.quantity),
          unitMeasureCode: formData.unitMeasureCode,
          planScheduleCode: formData.planScheduleCode,
        };
      }

      if (id) {
        await commercialProductRepository.update({ ...payload, id });
        toast.success(t(COMMERCIAL_PRODUCT_CONSTANTS.TOAST.RECORD_UPDATED) || 'Record updated successfully');
      } else {
        await commercialProductRepository.create(payload);
        toast.success(t(COMMERCIAL_PRODUCT_CONSTANTS.TOAST.RECORD_CREATED) || 'Record created successfully');
      }
      router.back();
    } catch (error: any) {
      console.error("Error saving commercial product:", error);
      toast.error(error.message || t(COMMERCIAL_PRODUCT_CONSTANTS.TOAST.ERROR_SAVING) || 'Error saving record');
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
    <div className="max-w-5xl mx-auto space-y-4 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <Breadcrumb
        items={[
          { label: t(COMMERCIAL_PRODUCT_CONSTANTS.CAMPAIGNS) || 'Campaigns', href: campaign ? CAMPAIGN_ROUTES.DETAIL(campaign) : CAMPAIGN_ROUTES.LIST },
          { label: campaign?.name || '...', href: campaign ? CAMPAIGN_ROUTES.DETAIL(campaign) : undefined },
          { label: t(COMMERCIAL_PRODUCT_CONSTANTS.LIST_TITLE), href: COMMERCIAL_PRODUCT_ROUTES.LIST(campaignId) },
          { label: id ? t(COMMERCIAL_PRODUCT_CONSTANTS.EDIT_TITLE) : t(COMMERCIAL_PRODUCT_CONSTANTS.CREATE_TITLE) }
        ]}
      />
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
              {id ? t(COMMERCIAL_PRODUCT_CONSTANTS.EDIT_TITLE) : t(COMMERCIAL_PRODUCT_CONSTANTS.CREATE_TITLE)}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">{id ? t(COMMERCIAL_PRODUCT_CONSTANTS.DESCRIPTION_EDIT) : t(COMMERCIAL_PRODUCT_CONSTANTS.DESCRIPTION_TITLE)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/40 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">

                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-6 py-2">
                      <span className={cn(
                        "text-base font-bold transition-all duration-300",
                        field.value === PRODUCT_TYPE_UNIQUE ? "text-foreground" : "text-muted-foreground/40"
                      )}>
                        {t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.UNIQUE_PRODUCT)}
                      </span>

                      <Switch
                        checked={field.value === PRODUCT_TYPE_COMBO}
                        onCheckedChange={(checked) => field.onChange(checked ? PRODUCT_TYPE_COMBO : PRODUCT_TYPE_UNIQUE)}
                        disabled={!!id}
                        className="scale-125 data-[state=checked]:bg-primary data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-700"
                      />

                      <span className={cn(
                        "text-base font-bold transition-all duration-300",
                        field.value === PRODUCT_TYPE_COMBO ? "text-foreground" : "text-muted-foreground/40"
                      )}>
                        {t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.COMBO)}
                      </span>
                    </div>
                  )}
                />
              </div>

              {/* Hide Unique Product Section in Edit mode */}
              {!id && type === PRODUCT_TYPE_UNIQUE && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/10 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.BASE_PRODUCT)}</label>
                    <Controller
                      name="itemCode"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          value={field.value || ''}
                          className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                        >
                          <option value="">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.SELECT_OPTION)}</option>
                          {itemCodeOptions.map((p: any, idx: number) => {
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
                    {errors.itemCode && <p className="text-[10px] text-destructive font-medium ml-1">{errors.itemCode.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.UNIT_MEASURE)}</label>
                    <Controller
                      name="unitMeasureCode"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                        >
                          <option value="">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.SELECT_OPTION)}</option>
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
                    {errors.unitMeasureCode && <p className="text-[10px] text-destructive font-medium ml-1">{t(errors.unitMeasureCode.message as string)}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.COST)}</label>
                    <Input type="number" step="0.01" {...register("cost")} disabled className={errors.cost ? "border-destructive focus-visible:ring-destructive/20" : ""} />
                    {errors.cost && <p className="text-[10px] text-destructive font-medium ml-1">{t(errors.cost.message as string)}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.QUANTITY)}</label>
                    <Input type="number" {...register("quantity")} className={errors.quantity ? "border-destructive focus-visible:ring-destructive/20" : ""} />
                    {errors.quantity && <p className="text-[10px] text-destructive font-medium ml-1">{t(errors.quantity.message as string)}</p>}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={cn("space-y-2", type === PRODUCT_TYPE_UNIQUE && "hidden")}>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.CODE)}</label>
                  <Input
                    {...register("code")}
                    readOnly={type === PRODUCT_TYPE_UNIQUE}
                    className={cn(
                      errors.code ? "border-destructive focus-visible:ring-destructive/20" : "",
                      type === PRODUCT_TYPE_UNIQUE && "bg-muted/50 cursor-not-allowed opacity-80"
                    )}
                  />
                  {errors.code && <p className="text-[10px] text-destructive font-medium ml-1">{t(errors.code.message as string)}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.STATUS)}</label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                      >
                        <option value="">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.SELECT_OPTION) || 'Select status'}</option>
                        {statusOptions.map((p: any, idx: number) => {
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
                  {errors.status && <p className="text-[10px] text-destructive font-medium ml-1">{t(errors.status.message as string)}</p>}
                </div>
              </div>

              <div className={cn("space-y-2", type === PRODUCT_TYPE_UNIQUE && "hidden")}>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.NAME)}</label>
                <Input
                  {...register("name")}
                  readOnly={type === PRODUCT_TYPE_UNIQUE}
                  className={cn(
                    errors.name ? "border-destructive focus-visible:ring-destructive/20" : "",
                    type === PRODUCT_TYPE_UNIQUE && "bg-muted/50 cursor-not-allowed opacity-80"
                  )}
                />
                {errors.name && <p className="text-[10px] text-destructive font-medium ml-1">{t(errors.name.message as string)}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.DESCRIPTION)}</label>
                <Textarea {...register("description")} className="bg-card/80 border-border/50 focus-visible:ring-primary/20" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.PRICE_TYPE)}</label>
                  <Controller
                    name="priceType"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                      >
                        <option value="">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.SELECT_OPTION) || 'Select price type'}</option>
                        {priceTypeOptions.map((p: any, idx: number) => {
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
                  {errors.priceType && <p className="text-[10px] text-destructive font-medium ml-1">{t(errors.priceType.message as string)}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.TOTAL_COST)}</label>
                  <Input type="number" step="0.01" {...register("totalCost")} disabled className={errors.totalCost ? "border-destructive focus-visible:ring-destructive/20" : ""} />
                  {errors.totalCost && <p className="text-[10px] text-destructive font-medium ml-1">{t(errors.totalCost.message as string)}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.ATTENTION_CHANNEL)}</label>
                  <Controller
                    name="channelCode"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                      >
                        <option value="">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.SELECT_OPTION) || 'Select channel'}</option>
                        {channelOptions.map((p: any, idx: number) => {
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
                  {errors.channelCode && <p className="text-[10px] text-destructive font-medium ml-1">{t(errors.channelCode.message as string)}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.WAREHOUSE) || 'Warehouse'}</label>
                  <Controller
                    name="warehouseCode"
                    control={control}
                    render={({ field }) => (
                      <select
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                        className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                      >
                        <option value="">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.SELECT_OPTION) || 'Select warehouse'}</option>
                        {warehouses.map((w, idx) => (
                          <option key={`${w.code}-${idx}`} value={w.code}>
                            {w.name} ({w.code})
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.warehouseCode && <p className="text-[10px] text-destructive font-medium ml-1">{t(errors.warehouseCode.message as string)}</p>}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-border/10">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.SCHEDULE_TITLE) || 'Schedule'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-accent/5 p-6 rounded-xl border border-border/30">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.SCHEDULE_TYPE_CODE) || 'Schedule Type'}</label>
                    <Controller
                      name="scheduleTypeCode"
                      control={control}
                      render={({ field }) => (
                        <select
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                          className="flex h-11 w-full rounded-md border border-border/55 bg-card px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                        >
                          <option value="">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.SELECT_OPTION) || 'Select schedule type'}</option>
                          {scheduleTypeOptions.map((p: any, idx: number) => {
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
                    {errors.scheduleTypeCode && <p className="text-[10px] text-destructive font-medium ml-1">{t(errors.scheduleTypeCode.message as string)}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.PLAN_SCHEDULE) || 'Plan Schedule'}</label>
                    <Controller
                      name="planScheduleCode"
                      control={control}
                      render={({ field }) => (
                        <select
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                          className="flex h-11 w-full rounded-md border border-border/55 bg-card px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                        >
                          <option value="">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.SELECT_OPTION) || 'Select plan schedule'}</option>
                          {planScheduleOptions.map((p: any, idx: number) => {
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
                    {errors.planScheduleCode && <p className="text-[10px] text-destructive font-medium ml-1">{t(errors.planScheduleCode.message as string)}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.TIME_BASED) || 'Time Based'}</label>
                    <Controller
                      name="timeBasedCode"
                      control={control}
                      render={({ field }) => (
                        <select
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                          className="flex h-11 w-full rounded-md border border-border/55 bg-card px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                        >
                          <option value="">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.SELECT_OPTION) || 'Select option'}</option>
                          {timeBasedOptions.map((p: any, idx: number) => {
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
                    {errors.timeBasedCode && <p className="text-[10px] text-destructive font-medium ml-1">{t(errors.timeBasedCode.message as string)}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.REQUIRE_CONFIRMATION) || 'Require Confirmation'}</label>
                    <Controller
                      name="requireConfirmationCode"
                      control={control}
                      render={({ field }) => (
                        <select
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                          className="flex h-11 w-full rounded-md border border-border/55 bg-card px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                        >
                          <option value="">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.SELECT_OPTION) || 'Select option'}</option>
                          {requireConfirmationOptions.map((p: any, idx: number) => {
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
                    {errors.requireConfirmationCode && <p className="text-[10px] text-destructive font-medium ml-1">{t(errors.requireConfirmationCode.message as string)}</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-primary/20 bg-primary/5 shadow-xl border-dashed">
            <CardHeader>
              <CardTitle className="text-base font-bold text-primary">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.FORM_STATUS) || 'Form Status'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.FORM_MODIFIED) || 'Modified:'}</span>
                <span className={isDirty ? "text-amber-500 font-bold" : "text-emerald-500 font-bold"}>
                  {isDirty ? t('common.yes') || 'YES' : t('common.no') || 'NO'}
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
                {t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.SUBMIT)}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all h-12 font-bold"
                onClick={handleCancel}
              >
                <X className="mr-2 h-5 w-5" />
                {t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.CANCEL)}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>

      <ConfirmDialog
        open={showConfirmCancel}
        onOpenChange={setShowConfirmCancel}
        title={t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.CONFIRM_CANCEL, 'Discard Changes?')}
        description={t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.DIRTY_WARNING) || "You have unsaved changes. Are you sure you want to cancel and lose your progress?"}
        confirmText={t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.YES_DISCARD, 'Yes, Discard')}
        cancelText={t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.NO_STAY, 'No, Stay')}
        onConfirm={confirmCancel}
        type="warning"
      />
    </div>
  );
}
