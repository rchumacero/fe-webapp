"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@kplian/i18n';
import { CAMPAIGN_PRODUCT_CONSTANTS } from '../../constants/campaign-product-constants';
import { CampaignProductRepositoryImpl } from '@kplian/infrastructure';
import { CreateCampaignProductDto, UpdateCampaignProductDto } from '@kplian/core';
import { ProductRepositoryImpl } from '@/modules/production/product/infrastructure/ProductRepositoryImpl';
import { Product } from '@/modules/production/product/domain/Product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Save, X, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, SubmitHandler, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { CAMPAIGN_PRODUCT_DOMAIN_PARAMETERS, P_STATUS, P_UNIT_MEASURE } from '../../constants/parameter';
import { useVendor } from '@/hooks/use-vendor';

const campaignProductRepository = new CampaignProductRepositoryImpl();
const productRepository = new ProductRepositoryImpl();

const campaignProductSchema = z.object({
  commercialProductId: z.string().min(1, "Required"),
  productCode: z.string().min(1, "Product is required"),
  cost: z.coerce.number().min(0, "Cost must be >= 0"),
  quantity: z.coerce.number().min(1, "Quantity must be >= 1"),
  unitMeasureCode: z.string().min(1, "Unit of measure is required"),
  configurationCode: z.string().min(1, "Configuration code is required"),
  status: z.string().min(1, "Status is required"),
});

type CampaignProductFormData = z.infer<typeof campaignProductSchema>;

interface CampaignProductFormProps {
  id?: string;
  commercialProductId: string;
}

export default function CampaignProductFormPage({ id, commercialProductId }: CampaignProductFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { vendor } = useVendor();

  const { data: parametersData } = useDomainParameters({
    parameters: CAMPAIGN_PRODUCT_DOMAIN_PARAMETERS
  });

  const statusOptions = parametersData[P_STATUS] || [];
  const unitMeasureOptions = parametersData[P_UNIT_MEASURE] || [];

  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CampaignProductFormData>({
    resolver: zodResolver(campaignProductSchema),
    defaultValues: {
      commercialProductId: commercialProductId,
      productCode: '',
      cost: 0,
      quantity: 1,
      unitMeasureCode: '',
      configurationCode: 'DEFAULT',
      status: 'ACTIVE',
    }
  });

  const productCode = useWatch({ control, name: 'productCode' });

  useEffect(() => {
    if (vendor) {
      const fetchBaseProducts = async () => {
        try {
          const data = await productRepository.getAll(vendor);
          setProducts(data);
        } catch (error) {
          console.error("Error fetching base products:", error);
        }
      };
      fetchBaseProducts();
    }
  }, [vendor]);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        setIsLoading(true);
        try {
          const product = await campaignProductRepository.getById(id);
          reset({
            commercialProductId: product.commercialProductId,
            productCode: product.productCode,
            cost: product.cost,
            quantity: product.quantity,
            unitMeasureCode: product.unitMeasureCode,
            configurationCode: product.configurationCode,
            status: product.status || 'ACTIVE',
          });
        } catch (error) {
          console.error("Error fetching campaign product:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, reset]);

  const onSubmit: SubmitHandler<CampaignProductFormData> = async (formData) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await campaignProductRepository.update({ ...formData, id } as UpdateCampaignProductDto);
      } else {
        await campaignProductRepository.create(formData as CreateCampaignProductDto);
      }
      router.back();
    } catch (error) {
      console.error("Error saving campaign product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between border-b border-border/10 pb-2">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full hover:bg-accent/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              {id ? t(CAMPAIGN_PRODUCT_CONSTANTS.EDIT_TITLE) : t(CAMPAIGN_PRODUCT_CONSTANTS.CREATE_TITLE)}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
               {id ? t(CAMPAIGN_PRODUCT_CONSTANTS.DESCRIPTION_EDIT) : t(CAMPAIGN_PRODUCT_CONSTANTS.DESCRIPTION_TITLE)}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-border/40 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(CAMPAIGN_PRODUCT_CONSTANTS.FORM.PRODUCT)}</label>
                <Controller
                  name="productCode"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                    >
                      <option value="">{t(CAMPAIGN_PRODUCT_CONSTANTS.FORM.SELECT_OPTION)}</option>
                      {products.map((p, idx) => (
                        <option key={`${p.id}-${idx}`} value={p.code}>
                          {p.name} ({p.code})
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.productCode && <p className="text-[10px] text-destructive font-medium ml-1">{errors.productCode.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(CAMPAIGN_PRODUCT_CONSTANTS.FORM.STATUS)}</label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                    >
                      <option value="">{t(CAMPAIGN_PRODUCT_CONSTANTS.FORM.SELECT_OPTION)}</option>
                      {statusOptions.map((p: any, idx: number) => {
                        const val = p.code || p.CODE || p.value || p.id || p.fullCode || (typeof p === 'string' ? p : '');
                        const label = p.name || p.NAME || p.label || p.description || val || `Item ${idx}`;
                        return <option key={`${val}-${idx}`} value={val}>{label}</option>;
                      })}
                    </select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(CAMPAIGN_PRODUCT_CONSTANTS.FORM.COST)}</label>
                <Input type="number" step="0.01" {...register("cost")} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(CAMPAIGN_PRODUCT_CONSTANTS.FORM.QUANTITY)}</label>
                <Input type="number" {...register("quantity")} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(CAMPAIGN_PRODUCT_CONSTANTS.FORM.UNIT_MEASURE)}</label>
                <Controller
                  name="unitMeasureCode"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                    >
                      <option value="">{t(CAMPAIGN_PRODUCT_CONSTANTS.FORM.SELECT_OPTION)}</option>
                      {unitMeasureOptions.map((p: any, idx: number) => {
                        const val = p.code || p.CODE || p.value || p.id || p.fullCode || (typeof p === 'string' ? p : '');
                        const label = p.name || p.NAME || p.label || p.description || val || `Item ${idx}`;
                        return <option key={`${val}-${idx}`} value={val}>{label}</option>;
                      })}
                    </select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(CAMPAIGN_PRODUCT_CONSTANTS.FORM.CONFIG_CODE)}</label>
              <Input {...register("configurationCode")} />
            </div>
          </CardContent>
          <CardFooter className="bg-primary/5 p-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              <X className="mr-2 h-4 w-4" /> {t(CAMPAIGN_PRODUCT_CONSTANTS.FORM.CANCEL)}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {t(CAMPAIGN_PRODUCT_CONSTANTS.FORM.SUBMIT)}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
