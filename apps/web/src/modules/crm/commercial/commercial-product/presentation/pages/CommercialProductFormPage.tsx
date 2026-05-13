"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@kplian/i18n';
import { COMMERCIAL_PRODUCT_CONSTANTS } from '../../constants/commercial-product-constants';
import { CommercialProductRepositoryImpl } from '../../infrastructure/CommercialProductRepositoryImpl';
import { ProductRepositoryImpl } from '@/modules/production/product/infrastructure/ProductRepositoryImpl';
import { Product } from '@/modules/production/product/domain/Product';
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
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { COMMERCIAL_PRODUCT_DOMAIN_PARAMETERS, P_STATUS, P_PRICE_TYPE, P_CHANNEL, P_ATTENTION_GROUP, P_UNIT_MEASURE, PRODUCT_TYPE_UNIQUE, PRODUCT_TYPE_COMBO } from '../../constants/parameter';
import { useVendor } from '@/hooks/use-vendor';

const commercialProductRepository = new CommercialProductRepositoryImpl();
const productRepository = new ProductRepositoryImpl();

const commercialProductSchema = z.object({
  campaignId: z.string().min(1, COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.CAMPAIGN_REQUIRED),
  code: z.string().min(1, COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.CODE_REQUIRED),
  name: z.string().min(2, COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.NAME_REQUIRED),
  description: z.string().optional().default(''),
  priceType: z.string().min(1, COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.PRICE_TYPE_REQUIRED),
  totalCost: z.coerce.number().min(0),
  attentionGroupCode: z.string().min(1, COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.ATTENTION_GROUP_REQUIRED),
  channelCode: z.string().min(1, COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.CHANNEL_REQUIRED),
  status: z.string().min(1, COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.STATUS_REQUIRED),
  type: z.enum([PRODUCT_TYPE_UNIQUE, PRODUCT_TYPE_COMBO]),
  productCode: z.string().optional(),
  cost: z.coerce.number().optional(),
  quantity: z.coerce.number().optional(),
  unitMeasureCode: z.string().optional(),
  configurationCode: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === PRODUCT_TYPE_UNIQUE) {
    if (!data.productCode) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.BASE_PRODUCT_REQUIRED, path: ["productCode"] });
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
    if (!data.configurationCode) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.CONFIG_CODE_REQUIRED, path: ["configurationCode"] });
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
  const { vendor } = useVendor();

  const { data: parametersData } = useDomainParameters({
    parameters: COMMERCIAL_PRODUCT_DOMAIN_PARAMETERS
  });

  const statusOptions = parametersData[P_STATUS] || [];
  const priceTypeOptions = parametersData[P_PRICE_TYPE] || [];
  const channelOptions = parametersData[P_CHANNEL] || [];
  const attentionGroupOptions = parametersData[P_ATTENTION_GROUP] || [];
  const unitMeasureOptions = parametersData[P_UNIT_MEASURE] || [];

  const [products, setProducts] = useState<Product[]>([]);
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
      attentionGroupCode: '',
      channelCode: '',
      status: 'ACTIVE',
      type: PRODUCT_TYPE_UNIQUE,
    }
  });

  const type = useWatch({ control, name: 'type' });
  const productCode = useWatch({ control, name: 'productCode' });

  useEffect(() => {
    console.log("CommercialProductForm: useEffect[vendor] triggered, vendor:", vendor);
    if (vendor) {
      const fetchBaseProducts = async () => {
        try {
          console.log("CommercialProductForm: Calling productRepository.getAll with vendor:", vendor);
          const data = await productRepository.getAll(vendor);
          console.log("CommercialProductForm: Base products received:", data?.length || 0, "items");
          setProducts(data);
        } catch (error) {
          console.error("CommercialProductForm: Error fetching base products:", error);
        }
      };
      fetchBaseProducts();
    } else {
      console.warn("CommercialProductForm: No vendor detected in useVendor() hook");
    }
  }, [vendor]);

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
            attentionGroupCode: product.attentionGroupCode,
            channelCode: product.channelCode,
            status: product.status || 'ACTIVE',
            type: product.type || PRODUCT_TYPE_UNIQUE,
            productCode: product.productCode,
            cost: product.cost,
            quantity: product.quantity,
            unitMeasureCode: product.unitMeasureCode,
            configurationCode: product.configurationCode,
          });
        } catch (error) {
          console.error("Error fetching commercial product:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, reset]);

  useEffect(() => {
    if (type === PRODUCT_TYPE_UNIQUE && productCode) {
      const selectedProduct = products.find(p => p.code === productCode);
      if (selectedProduct) {
        setValue('name', selectedProduct.name || '');
      }
    }
  }, [productCode, type, products, setValue]);

  const onSubmit: SubmitHandler<CommercialProductFormData> = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      if (formData.type === PRODUCT_TYPE_COMBO) {
        delete payload.productCode;
        delete payload.cost;
        delete payload.quantity;
        delete payload.unitMeasureCode;
        delete payload.configurationCode;
      }

      if (id) {
        await commercialProductRepository.update({ ...payload, id });
      } else {
        await commercialProductRepository.create(payload as any);
      }
      router.back();
    } catch (error) {
      console.error("Error saving commercial product:", error);
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.CODE)}</label>
                  <Input {...register("code")} className={errors.code ? "border-destructive focus-visible:ring-destructive/20" : ""} />
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

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.NAME)}</label>
                <Input {...register("name")} className={errors.name ? "border-destructive focus-visible:ring-destructive/20" : ""} />
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
                  <Input type="number" step="0.01" {...register("totalCost")} className={errors.totalCost ? "border-destructive focus-visible:ring-destructive/20" : ""} />
                  {errors.totalCost && <p className="text-[10px] text-destructive font-medium ml-1">{t(errors.totalCost.message as string)}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.ATTENTION_GROUP)}</label>
                  <Controller
                    name="attentionGroupCode"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                      >
                        <option value="">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.SELECT_OPTION) || 'Select attention group'}</option>
                        {attentionGroupOptions.map((p: any, idx: number) => {
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
                  {errors.attentionGroupCode && <p className="text-[10px] text-destructive font-medium ml-1">{t(errors.attentionGroupCode.message as string)}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.CHANNEL)}</label>
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
              </div>
            </CardContent>
          </Card>

          {type === PRODUCT_TYPE_UNIQUE && (
            <Card className="border-border/40 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm animate-in slide-in-from-top-4 duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-primary">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.UNIQUE_PRODUCT)}</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.BASE_PRODUCT)}</label>
                    <Controller
                      name="productCode"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                        >
                          <option value="">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.SELECT_OPTION)}</option>
                          {products.map((p, idx) => (
                            <option key={`${p.id}-${idx}`} value={p.code}>
                              {p.name} ({p.code})
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.productCode && <p className="text-[10px] text-destructive font-medium ml-1">{t(errors.productCode.message as string)}</p>}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.COST)}</label>
                    <Input type="number" step="0.01" {...register("cost")} className={errors.cost ? "border-destructive focus-visible:ring-destructive/20" : ""} />
                    {errors.cost && <p className="text-[10px] text-destructive font-medium ml-1">{t(errors.cost.message as string)}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.QUANTITY)}</label>
                    <Input type="number" {...register("quantity")} className={errors.quantity ? "border-destructive focus-visible:ring-destructive/20" : ""} />
                    {errors.quantity && <p className="text-[10px] text-destructive font-medium ml-1">{t(errors.quantity.message as string)}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.CONFIGURATION_CODE)}</label>
                    <Input {...register("configurationCode")} className={errors.configurationCode ? "border-destructive focus-visible:ring-destructive/20" : ""} />
                    {errors.configurationCode && <p className="text-[10px] text-destructive font-medium ml-1">{t(errors.configurationCode.message as string)}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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
