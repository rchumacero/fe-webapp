'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@kplian/i18n';
import { CommercialProductRepositoryImpl, WarehouseRepositoryImpl, ProductRepositoryImpl, CampaignProductRepositoryImpl } from '@kplian/infrastructure';
import { CampaignRepositoryImpl } from '../../../campaign/infrastructure/repositories/CampaignRepositoryImpl';
import { Campaign } from '../../../campaign/domain/entities/Campaign';
import { Warehouse, Product, ProductVersionDto, CampaignProduct } from '@kplian/core';
import { COMMERCIAL_PRODUCT_CONSTANTS } from '../../constants/commercial-product-constants';
import { CAMPAIGN_ROUTES } from '../../../campaign/routes/campaign-routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { Save, X, ArrowLeft, Loader2, Package, Plus, Trash2, Edit2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { useForm, Controller, SubmitHandler, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import {
  COMMERCIAL_PRODUCT_DOMAIN_PARAMETERS,
  P_STATUS,
  P_PRICE_TYPE,
  P_CHANNEL,
  P_SCHEDULE_TYPE,
  P_PLAN_SCHEDULE,
  P_TIME_BASED,
  P_REQUIRE_CONFIRMATION,
  P_PRODUCT_TYPE,
  P_UNIT_MEASURE,
  P_ITEM_CODE,
  PRODUCT_TYPE_UNIQUE,
} from '../../constants/parameter';
import { useVendor } from '@/hooks/use-vendor';

const commercialProductRepository = new CommercialProductRepositoryImpl();
const campaignRepository = new CampaignRepositoryImpl();
const warehouseRepository = new WarehouseRepositoryImpl();
const productRepository = new ProductRepositoryImpl();
const campaignProductRepository = new CampaignProductRepositoryImpl();

const commercialProductSchema = z.object({
  campaignId: z.string().min(1, COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.CAMPAIGN_REQUIRED),
  code: z.string().min(1, COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.CODE_REQUIRED),
  name: z.string().min(2, COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.NAME_REQUIRED),
  description: z.string().optional().default(''),
  priceType: z.string().min(1, COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.PRICE_TYPE_REQUIRED),
  productTypeCode: z.string().optional().nullable(),
  channelCode: z.string().min(1, COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.CHANNEL_REQUIRED),
  status: z.string().min(1, COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.STATUS_REQUIRED),
  planScheduleCode: z.string().optional(),
  scheduleTypeCode: z.string().optional().nullable(),
  timeBasedCode: z.string().optional().nullable(),
  requireConfirmationCode: z.string().optional().nullable(),
  warehouseCode: z.string().optional().nullable(),
  itemCode: z.string().optional().nullable(),
  productCode: z.string().optional().nullable(),
  version: z.string().optional().nullable(),
  cost: z.coerce.number().optional().nullable(),
  quantity: z.coerce.number().optional().nullable(),
  unitMeasureCode: z.string().optional().nullable(),
  configurationCode: z.string().optional().nullable(),
  id: z.string().optional(),
});

type CommercialProductFormData = z.infer<typeof commercialProductSchema>;

interface CommercialProductFormProps {
  id?: string;
  campaignId: string;
}

export default function CommercialProductFormPage({ id, campaignId }: CommercialProductFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { vendorCode } = useVendor();

  const { data: parametersData } = useDomainParameters({
    parameters: COMMERCIAL_PRODUCT_DOMAIN_PARAMETERS,
  });

  const statusOptions = parametersData[P_STATUS] || [];
  const priceTypeOptions = parametersData[P_PRICE_TYPE] || [];
  const channelOptions = parametersData[P_CHANNEL] || [];
  const scheduleTypeOptions = parametersData[P_SCHEDULE_TYPE] || [];
  const planScheduleOptions = parametersData[P_PLAN_SCHEDULE] || [];
  const timeBasedOptions = parametersData[P_TIME_BASED] || [];
  const requireConfirmationOptions = parametersData[P_REQUIRE_CONFIRMATION] || [];
  const productTypeOptions = parametersData[P_PRODUCT_TYPE] || [];
  const unitMeasureOptions = parametersData[P_UNIT_MEASURE] || [];
  const itemCodeOptions = parametersData[P_ITEM_CODE] || [];

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsList, setProductsList] = useState<ProductVersionDto[]>([]);
  const [campaignProducts, setCampaignProducts] = useState<CampaignProduct[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  const [isSavingProductModal, setIsSavingProductModal] = useState(false);

  // Sub-form state inside the dialog:
  const [modalSourceType, setModalSourceType] = useState<'ITEM_WAREHOUSE' | 'PRODUCT'>('ITEM_WAREHOUSE');
  const [modalProductCode, setModalProductCode] = useState<string>('');
  const [modalItemCode, setModalItemCode] = useState<string>('');
  const [modalVersion, setModalVersion] = useState<string>('');
  const [modalUnitMeasureCode, setModalUnitMeasureCode] = useState<string>('');
  const [modalCost, setModalCost] = useState<number | ''>('');
  const [modalQuantity, setModalQuantity] = useState<number | ''>(1);

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
    resolver: zodResolver(commercialProductSchema) as any,
    defaultValues: {
      campaignId: campaignId,
      code: '',
      name: '',
      description: '',
      priceType: '',
      productTypeCode: null,
      channelCode: '',
      status: 'ACTIVE',
      planScheduleCode: '',
      scheduleTypeCode: null,
      timeBasedCode: null,
      requireConfirmationCode: null,
      warehouseCode: null,
      itemCode: null,
      productCode: null,
      version: '',
      cost: null,
      quantity: null,
      unitMeasureCode: null,
      configurationCode: null,
      id: id,
    },
  });

  const productTypeCode = useWatch({ control, name: 'productTypeCode' });
  const productCode = useWatch({ control, name: 'productCode' });

  useEffect(() => {
    productRepository
      .getVersions()
      .then((data) => setProductsList(data || []))
      .catch((err) => console.error('Error fetching product versions list:', err));
  }, []);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const data = await campaignRepository.getById(campaignId);
        setCampaign(data);
      } catch (error) {
        console.error('Error fetching campaign:', error);
      }
    };
    if (campaignId) fetchCampaign();
  }, [campaignId]);

  useEffect(() => {
    if (vendorCode) {
      const fetchWarehouses = async () => {
        try {
          const data = await warehouseRepository.getByVendor(vendorCode);
          setWarehouses(data);
        } catch (error) {
          console.error('Error fetching warehouses:', error);
        }
      };
      const fetchBaseProducts = async () => {
        try {
          const data = await productRepository.getByVendor(vendorCode);
          setProducts(data || []);
        } catch (error) {
          console.error('Error fetching base products:', error);
        }
      };
      fetchWarehouses();
      fetchBaseProducts();
    }
  }, [vendorCode]);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        setIsLoading(true);
        try {
          const product = await commercialProductRepository.getById(id);
          const rawItemCode = (product as any).itemCode || null;
          const rawProductCode = (product as any).productCode || null;
          reset({
            campaignId: product.campaignId,
            code: product.code,
            name: product.name,
            description: product.description || '',
            priceType: product.priceType,
            productTypeCode: product.productTypeCode || null,
            channelCode: product.channelCode,
            status: product.status || 'ACTIVE',
            planScheduleCode: product.planScheduleCode || '',
            scheduleTypeCode: product.scheduleTypeCode || null,
            timeBasedCode: product.timeBasedCode || null,
            requireConfirmationCode: product.requireConfirmationCode || null,
            warehouseCode: product.warehouseCode || null,
            itemCode: rawItemCode,
            productCode: rawProductCode,
            version: (product as any).version || '',
            cost: (product as any).cost ?? null,
            quantity: (product as any).quantity ?? null,
            unitMeasureCode: (product as any).unitMeasureCode || null,
            configurationCode: (product as any).configurationCode || null,
            id: product.id,
          });
        } catch (error) {
          console.error('Error fetching commercial product:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();

      campaignProductRepository
        .getByCommercialProductId(id)
        .then((items) => setCampaignProducts(items || []))
        .catch((err) => console.error('Error fetching campaign products:', err));
    }
  }, [id, reset]);

  const handleOpenAddModal = () => {
    setEditingProductIndex(null);
    setModalSourceType('ITEM_WAREHOUSE');
    setModalProductCode('');
    setModalItemCode('');
    setModalVersion('');
    setModalUnitMeasureCode('');
    setModalCost('');
    setModalQuantity(1);
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (index: number) => {
    setEditingProductIndex(index);
    const item = campaignProducts[index];
    const isProd = !!item.productCode;
    setModalSourceType(isProd ? 'PRODUCT' : 'ITEM_WAREHOUSE');
    setModalProductCode(item.productCode || '');
    setModalItemCode(item.itemCode || '');
    setModalVersion(item.version || '');
    setModalUnitMeasureCode(item.unitMeasureCode || '');
    setModalCost(item.cost != null ? item.cost : '');
    setModalQuantity(item.quantity != null ? item.quantity : 1);
    setIsProductModalOpen(true);
  };

  const handleSaveProductModal = async () => {
    if (modalSourceType === 'PRODUCT' && !modalProductCode) {
      toast.error(t(COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.BASE_PRODUCT_REQUIRED) || 'Please select a product');
      return;
    }
    if (modalSourceType === 'ITEM_WAREHOUSE' && !modalItemCode) {
      toast.error(t(COMMERCIAL_PRODUCT_CONSTANTS.VALIDATION.BASE_PRODUCT_REQUIRED) || 'Please select an item warehouse');
      return;
    }

    setIsSavingProductModal(true);
    try {
      const payload: Partial<CampaignProduct> = {
        commercialProductId: id || '',
        itemCode: modalSourceType === 'ITEM_WAREHOUSE' ? modalItemCode : null,
        productCode: modalSourceType === 'PRODUCT' ? modalProductCode : null,
        version: modalVersion || null,
        unitMeasureCode: modalUnitMeasureCode || undefined,
        cost: modalCost === '' ? 0 : Number(modalCost),
        quantity: modalQuantity === '' ? 1 : Number(modalQuantity),
        status: 'ACTIVE',
      };

      if (id) {
        if (editingProductIndex !== null) {
          const existing = campaignProducts[editingProductIndex];
          if (existing.id) {
            const updated = await campaignProductRepository.update({
              ...payload,
              id: existing.id,
              commercialProductId: id,
            } as any);
            setCampaignProducts(prev => prev.map((p, i) => i === editingProductIndex ? { ...existing, ...payload, ...updated } : p));
            toast.success(t(COMMERCIAL_PRODUCT_CONSTANTS.TOAST.RECORD_UPDATED) || 'Product updated successfully');
          } else {
            setCampaignProducts(prev => prev.map((p, i) => i === editingProductIndex ? { ...existing, ...payload } : p));
          }
        } else {
          const created = await campaignProductRepository.create({
            ...payload,
            commercialProductId: id,
          } as any);
          setCampaignProducts(prev => [...prev, created]);
          toast.success(t(COMMERCIAL_PRODUCT_CONSTANTS.TOAST.RECORD_CREATED) || 'Product added successfully');
        }
      } else {
        if (editingProductIndex !== null) {
          setCampaignProducts(prev => prev.map((p, i) => i === editingProductIndex ? { ...p, ...payload } : p));
        } else {
          setCampaignProducts(prev => [...prev, payload as CampaignProduct]);
        }
      }
      setIsProductModalOpen(false);
    } catch (err: any) {
      console.error('Error saving campaign product:', err);
      toast.error(err.message || 'Error saving product');
    } finally {
      setIsSavingProductModal(false);
    }
  };

  const handleDeleteProduct = async (index: number) => {
    const item = campaignProducts[index];
    if (item.id) {
      try {
        await campaignProductRepository.delete(item.id);
        toast.success(t('common.recordDeleted') || 'Product removed successfully');
      } catch (err: any) {
        console.error('Error deleting campaign product:', err);
        toast.error(err.message || 'Error removing product');
        return;
      }
    }
    setCampaignProducts(prev => prev.filter((_, i) => i !== index));
  };

  const getProductDisplay = (item: CampaignProduct) => {
    if (item.productCode) {
      const prod = productsList.find((p) => p.code === item.productCode || p.id === item.productCode);
      const name = prod ? prod.name : item.productCode;
      return {
        title: name,
        code: item.productCode,
        version: item.version,
        type: 'PRODUCT' as const,
      };
    }
    const itemOpt = itemCodeOptions.find((p: any) => (p.code || p.CODE || p.value || p.id) === item.itemCode);
    const label = itemOpt ? (itemOpt.name || itemOpt.NAME || itemOpt.label || itemOpt.description || item.itemCode) : item.itemCode;
    return {
      title: label || 'Warehouse Item',
      code: item.itemCode || '',
      version: item.version,
      type: 'ITEM_WAREHOUSE' as const,
    };
  };

  const onSubmit: SubmitHandler<CommercialProductFormData> = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload: any = {
        ...formData,
        campaignId,
      };

      let commercialProdId = id;
      if (id) {
        await commercialProductRepository.update({ ...payload, id });
        toast.success(t(COMMERCIAL_PRODUCT_CONSTANTS.TOAST.RECORD_UPDATED) || 'Record updated successfully');
      } else {
        const created = await commercialProductRepository.create(payload);
        commercialProdId = created.id;
        toast.success(t(COMMERCIAL_PRODUCT_CONSTANTS.TOAST.RECORD_CREATED) || 'Record created successfully');
      }

      // Persist any staged sub-products that were added before the commercial product was created
      if (commercialProdId && campaignProducts.length > 0) {
        const unsavedProducts = campaignProducts.filter(p => !p.id);
        for (const p of unsavedProducts) {
          try {
            await campaignProductRepository.create({
              commercialProductId: commercialProdId,
              itemCode: p.itemCode,
              productCode: p.productCode,
              version: p.version,
              unitMeasureCode: p.unitMeasureCode,
              cost: p.cost,
              quantity: p.quantity,
              status: p.status || 'ACTIVE',
            } as any);
          } catch (err) {
            console.error('Error creating sub-product:', err);
          }
        }
      }

      router.back();
    } catch (error: any) {
      console.error('Error saving commercial product:', error);
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
          { label: t(COMMERCIAL_PRODUCT_CONSTANTS.TITLE) || 'Commercial Products', href: campaign ? CAMPAIGN_ROUTES.DETAIL(campaign) : undefined },
          { label: id ? t('common.edit') || 'Edit' : t('common.new') || 'New' },
        ]}
      />

      <div className="flex items-center justify-between bg-card p-6 rounded-xl border border-border/40 shadow-sm">
        <div className="flex items-center space-x-4">
          <Button
            type="button"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.CODE)}</label>
                  <Input
                    {...register('code')}
                    className={errors.code ? 'border-destructive focus-visible:ring-destructive/20' : ''}
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

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.NAME)}</label>
                <Input
                  {...register('name')}
                  className={errors.name ? 'border-destructive focus-visible:ring-destructive/20' : ''}
                />
                {errors.name && <p className="text-[10px] text-destructive font-medium ml-1">{t(errors.name.message as string)}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.DESCRIPTION)}</label>
                <Textarea {...register('description')} className="bg-card/80 border-border/50 focus-visible:ring-primary/20" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.PRODUCT_TYPE) || 'Product Type'}</label>
                  <Controller
                    name="productTypeCode"
                    control={control}
                    render={({ field }) => (
                      <select
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                        className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                      >
                        <option value="">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.SELECT_OPTION) || 'Select product type'}</option>
                        {productTypeOptions.map((p: any, idx: number) => {
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
                  {errors.productTypeCode && <p className="text-[10px] text-destructive font-medium ml-1">{t(errors.productTypeCode.message as string)}</p>}
                </div>
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

              <div className="space-y-4 pt-4 border-t border-border/10">
                <h3 className="text-sm font-bold tracking-tight text-foreground">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.ADVANCED_CONFIG) || 'Advanced Configurations'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.WAREHOUSE) || 'Warehouse'}</label>
                    <Controller
                      name="warehouseCode"
                      control={control}
                      render={({ field }) => (
                        <select
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                          className="flex h-11 w-full rounded-md border border-border/55 bg-card px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                        >
                          <option value="">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.SELECT_OPTION) || 'Select warehouse'}</option>
                          {warehouses.map((w: any, idx: number) => (
                            <option key={`${w.code}-${idx}`} value={w.code}>
                              {w.name || w.code}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.warehouseCode && <p className="text-[10px] text-destructive font-medium ml-1">{t(errors.warehouseCode.message as string)}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.SCHEDULE_TYPE) || 'Schedule Type'}</label>
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

          {/* Products Section with Card List */}
          <Card className="border-border/40 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm animate-in slide-in-from-top-4 duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/10">
              <div className="flex items-center gap-2.5">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-bold text-primary">
                  {t('crm.campaignProduct.title') || t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.PRODUCT_CODE) || 'Products'}
                </CardTitle>
                <Badge variant="secondary" className="font-mono text-xs px-2 py-0.5">
                  {campaignProducts.length}
                </Badge>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleOpenAddModal}
                className="gap-1.5 font-semibold shadow-sm hover:scale-[1.02] transition-transform"
              >
                <Plus className="h-4 w-4" />
                {t('common.add') || 'Add'}
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {campaignProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-border/40 rounded-xl bg-card/30">
                  <div className="p-3 bg-primary/10 rounded-full mb-3 text-primary">
                    <Package className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-base mb-1">
                    {t('crm.campaignProduct.noProducts') || 'No products added yet'}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mb-4">
                    {t('crm.campaignProduct.noProductsDesc') || 'Add one or more products or warehouse items to this commercial product.'}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleOpenAddModal}
                    className="gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    {t('common.add') || 'Add'}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaignProducts.map((item, idx) => {
                    const info = getProductDisplay(item);
                    return (
                      <Card
                        key={item.id || `cp-${idx}`}
                        className="group relative border border-border/50 bg-card/70 hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
                      >
                        <CardHeader className="p-4 pb-2 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {info.type === 'PRODUCT' ? (t('crm.campaignProduct.product') || 'Product') : (t('crm.campaignProduct.itemWarehouse') || 'Item Warehouse')}
                                </Badge>
                                {info.version && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
                                    v{info.version}
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-bold text-sm text-foreground truncate" title={info.title || info.code}>
                                {info.title || info.code}
                              </h4>
                              {info.code && info.title !== info.code && (
                                <p className="text-[11px] text-muted-foreground font-mono truncate">{info.code}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEditModal(idx)}
                                className="h-7 w-7 text-muted-foreground hover:text-primary rounded-md"
                                title={t('common.edit') || 'Edit'}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteProduct(idx)}
                                className="h-7 w-7 text-muted-foreground hover:text-destructive rounded-md"
                                title={t('common.delete') || 'Delete'}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-1 pb-3 text-xs space-y-1.5 border-t border-border/20 mt-2 bg-muted/10">
                          <div className="flex justify-between text-muted-foreground">
                            <span>{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.UNIT_MEASURE) || 'Unit Measure'}:</span>
                            <span className="font-medium text-foreground">{item.unitMeasureCode || '-'}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.COST) || 'Cost'}:</span>
                            <span className="font-medium text-foreground">{item.cost != null ? item.cost : '-'}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.QUANTITY) || 'Quantity'}:</span>
                            <span className="font-medium text-foreground">{item.quantity != null ? item.quantity : 1}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add / Edit Product Modal */}
          <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  {editingProductIndex !== null ? (t('common.edit') || 'Edit Product') : (t('common.add') || 'Add Product')}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Type Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    {t('common.type') || 'Create Type'}
                  </label>
                  <select
                    value={modalSourceType}
                    onChange={(e) => {
                      const newType = e.target.value as 'ITEM_WAREHOUSE' | 'PRODUCT';
                      setModalSourceType(newType);
                      setModalItemCode('');
                      if (newType === 'ITEM_WAREHOUSE') {
                        setModalProductCode('');
                        setModalVersion('');
                      }
                    }}
                    className="flex h-11 w-full rounded-md border border-border/50 bg-card px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer font-medium"
                  >
                    <option value="ITEM_WAREHOUSE">{t('crm.campaignProduct.itemWarehouse') || 'Item Warehouse'}</option>
                    <option value="PRODUCT">{t('crm.campaignProduct.product') || 'Product'}</option>
                  </select>
                </div>

                {/* Item Warehouse Dropdown */}
                {modalSourceType === 'ITEM_WAREHOUSE' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      {t('crm.campaignProduct.itemWarehouse') || t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.BASE_PRODUCT) || 'Item Code / Warehouse'}
                    </label>
                    <select
                      value={modalItemCode}
                      onChange={(e) => setModalItemCode(e.target.value)}
                      className="flex h-11 w-full rounded-md border border-border/50 bg-card px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                    >
                      <option value="">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.SELECT_OPTION) || 'Select Option'}</option>
                      {itemCodeOptions.map((p: any, idx: number) => {
                        const val = p.code || p.CODE || p.value || p.id || p.fullCode || (typeof p === 'string' ? p : '');
                        const label = p.name || p.NAME || p.label || p.description || val || `Item ${idx}`;
                        return <option key={`${val}-${idx}`} value={val}>{label}</option>;
                      })}
                    </select>
                  </div>
                )}

                {/* Product Dropdown */}
                {modalSourceType === 'PRODUCT' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      {t('crm.campaignProduct.product') || t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.PRODUCT_CODE) || 'Product'}
                    </label>
                    <select
                      value={modalProductCode}
                      onChange={(e) => {
                        const selectedCode = e.target.value;
                        setModalProductCode(selectedCode);
                        setModalItemCode(selectedCode);
                        const prods = (productsList.length > 0 ? productsList : products) as any[];
                        const selectedProd = prods.find((p) => p.code === selectedCode || p.id === selectedCode);
                        if (selectedProd) {
                          setModalVersion(selectedProd.codeConfiguration || selectedProd.code_configuration || selectedProd.configurationCode || '');
                          if (selectedProd.unitMeasureCode) {
                            setModalUnitMeasureCode(selectedProd.unitMeasureCode);
                          }
                        } else {
                          setModalVersion('');
                        }
                      }}
                      className="flex h-11 w-full rounded-md border border-border/50 bg-card px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                    >
                      <option value="">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.SELECT_OPTION) || 'Select Option'}</option>
                      {(productsList.length > 0 ? productsList : (products as any[])).map((p: any, idx: number) => {
                        const codeVal = p.code || p.id || `PROD-${idx}`;
                        const versionTag = p.version ? ` (v${p.version})` : '';
                        const label = p.name ? `${p.name} (${codeVal})${versionTag}` : `${codeVal}${versionTag}`;
                        return <option key={`${p.id || codeVal}-${idx}`} value={codeVal}>{label}</option>;
                      })}
                    </select>
                  </div>
                )}

                {/* Version */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    {t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.VERSION) || 'Version'}
                  </label>
                  <Input
                    disabled
                    value={modalVersion}
                    placeholder={t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.VERSION) || 'Version'}
                    className="bg-muted/50 cursor-not-allowed opacity-75"
                  />
                </div>

                {/* Unit of Measure */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    {t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.UNIT_MEASURE) || 'Unit Measure'}
                  </label>
                  <select
                    value={modalUnitMeasureCode}
                    onChange={(e) => setModalUnitMeasureCode(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-border/50 bg-card px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                  >
                    <option value="">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.SELECT_OPTION) || 'Select unit measure'}</option>
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
                </div>

                {/* Cost & Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      {t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.COST) || 'Cost'}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={modalCost}
                      onChange={(e) => setModalCost(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      {t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.QUANTITY) || 'Quantity'}
                    </label>
                    <Input
                      type="number"
                      value={modalQuantity}
                      onChange={(e) => setModalQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsProductModalOpen(false)}
                >
                  {t('common.cancel') || 'Cancel'}
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveProductModal}
                  disabled={isSavingProductModal}
                >
                  {isSavingProductModal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingProductIndex !== null ? (t('common.save') || 'Save') : (t('common.add') || 'Add')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-8">
          <Card className="border-primary/20 bg-primary/5 shadow-xl border-dashed">
            <CardHeader>
              <CardTitle className="text-base font-bold text-primary">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.FORM_STATUS) || 'Form Status'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.FORM_MODIFIED) || 'Modified:'}</span>
                <span className={isDirty ? 'text-amber-500 font-bold' : 'text-emerald-500 font-bold'}>
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
        description={t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.DIRTY_WARNING) || 'You have unsaved changes. Are you sure you want to cancel and lose your progress?'}
        confirmText={t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.YES_DISCARD, 'Yes, Discard')}
        cancelText={t(COMMERCIAL_PRODUCT_CONSTANTS.FORM.NO_STAY, 'No, Stay')}
        onConfirm={confirmCancel}
        type="warning"
      />
    </div>
  );
}

