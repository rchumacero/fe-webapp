"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@kplian/i18n';
import { ADDRESS_CONSTANTS } from '../../constants/address-constants';
import { ADDRESS_ROUTES } from '../../routes/address-routes';
import { AddressRepositoryImpl } from '../../infrastructure/repositories/AddressRepositoryImpl';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, X, Loader2, MapPin } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('../components/MapPicker'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full rounded-lg bg-muted flex items-center justify-center animate-pulse"><Loader2 className="animate-spin text-muted-foreground" size={30} /></div>
});

const addressRepository = new AddressRepositoryImpl();

const addressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  latitude: z.coerce.number().optional().default(0),
  longitude: z.coerce.number().optional().default(0),
  priority: z.coerce.number().optional().default(1),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormPageProps {
  id?: string;
}

export default function AddressFormPage({ id }: AddressFormPageProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const personId = searchParams.get('personId');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    setValue,
    watch
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: '',
      description: '',
      latitude: 0,
      longitude: 0,
      priority: 1,
    }
  });

  useEffect(() => {
    if (id) {
      const fetchAddress = async () => {
        setIsLoading(true);
        try {
          const data = await addressRepository.getById(id);
          reset({
            name: data.name || '',
            description: data.description || '',
            latitude: data.latitude || 0,
            longitude: data.longitude || 0,
            priority: data.priority || 1,
          });
        } catch (error) {
          console.error("Error fetching address:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAddress();
    }
  }, [id, reset]);

  const onSubmit = async (data: AddressFormData) => {
    if (!personId) {
      console.error("Missing personId for Address creation");
      return;
    }
    setIsSubmitting(true);
    try {
      if (id) {
        await addressRepository.update({ ...data, id });
      } else {
        await addressRepository.create({ ...data, personId });
      }
      router.push(ADDRESS_ROUTES.LIST(personId));
    } catch (error) {
      console.error("Error saving address:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowConfirmCancel(true);
    } else {
      if (personId) router.push(ADDRESS_ROUTES.LIST(personId));
      else router.back();
    }
  };

  const confirmCancel = () => {
    setShowConfirmCancel(false);
    if (personId) router.push(ADDRESS_ROUTES.LIST(personId));
    else router.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

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
              {id ? t(ADDRESS_CONSTANTS.EDIT_TITLE) : t(ADDRESS_CONSTANTS.CREATE_TITLE)}
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-border/40 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8 space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                <MapPin size={14} className="text-primary" /> {t(ADDRESS_CONSTANTS.FORM.NAME) || 'Name (e.g. Home, Office)'}
              </label>
              <Input {...register("name")} className="h-11 bg-card/80 border-border/50" />
              {errors.name && <p className="text-[10px] text-destructive font-medium ml-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                <MapPin size={14} className="text-primary" /> {t(ADDRESS_CONSTANTS.FORM.DESCRIPTION) || 'Detailed Address'}
              </label>
              <Input {...register("description")} className="h-11 bg-card/80 border-border/50" />
              {errors.description && <p className="text-[10px] text-destructive font-medium ml-1">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                <MapPin size={14} className="text-primary" /> Select Location on Map
              </label>
              <MapPicker
                latitude={watch('latitude') || 0}
                longitude={watch('longitude') || 0}
                onChange={(lat, lng) => {
                  setValue('latitude', lat, { shouldValidate: true, shouldDirty: true });
                  setValue('longitude', lng, { shouldValidate: true, shouldDirty: true });
                }}
              />
              <p className="text-[10px] text-muted-foreground ml-1 mt-1">Click on the map to place a pin and set the coordinates.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                  {t(ADDRESS_CONSTANTS.FORM.LATITUDE) || 'Latitude'}
                </label>
                <Input type="number" step="any" {...register("latitude")} className="h-11 bg-card/80 border-border/50" />
                {errors.latitude && <p className="text-[10px] text-destructive font-medium ml-1">{errors.latitude.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                  {t(ADDRESS_CONSTANTS.FORM.LONGITUDE) || 'Longitude'}
                </label>
                <Input type="number" step="any" {...register("longitude")} className="h-11 bg-card/80 border-border/50" />
                {errors.longitude && <p className="text-[10px] text-destructive font-medium ml-1">{errors.longitude.message}</p>}
              </div>
            </div>

            <div className="space-y-2 max-w-xs">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                {t(ADDRESS_CONSTANTS.FORM.PRIORITY) || 'Priority'}
              </label>
              <Input type="number" {...register("priority")} className="h-11 bg-card/80 border-border/50" />
              {errors.priority && <p className="text-[10px] text-destructive font-medium ml-1">{errors.priority.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="bg-primary/5 p-8 flex gap-4">
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 h-12 font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {t(ADDRESS_CONSTANTS.FORM.SUBMIT) || 'Save'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all h-12 font-bold"
              onClick={handleCancel}
            >
              <X className="mr-2 h-5 w-5" />
              {t(ADDRESS_CONSTANTS.FORM.CANCEL) || 'Cancel'}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <ConfirmDialog
        open={showConfirmCancel}
        onOpenChange={setShowConfirmCancel}
        title="Discard Changes?"
        description="You have unsaved changes. Are you sure you want to cancel and lose your progress?"
        onConfirm={confirmCancel}
      />
    </div>
  );
}
