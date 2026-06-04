"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@kplian/i18n';
import { COLLABORATOR_CONSTANTS } from '../../constants/collaborator-constants';
import { Collaborator, CreateCollaboratorDto, UpdateCollaboratorDto } from '../../domain/Collaborator';
import { CollaboratorRepositoryImpl } from '../../infrastructure/CollaboratorRepositoryImpl';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, X, Loader2, User, DollarSign, Clock, Hash } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useVendor } from '@/hooks/use-vendor';
import { PersonRepositoryImpl } from '@/modules/crm/personal-data/person/infrastructure/repositories/PersonRepositoryImpl';
import { Person } from '@/modules/crm/personal-data/person/domain/entities/Person';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const collaboratorRepository = new CollaboratorRepositoryImpl();
const personRepository = new PersonRepositoryImpl();

const collaboratorSchema = z.object({
  commercialProductId: z.string().min(1, "Commercial Product is required"),
  employeeId: z.string().min(1, "Employee is required"),
  type: z.string().optional().nullable(),
  status: z.string().optional().default('ACTIVE'),
  feeAmount: z.coerce.number().min(0, "Fee must be non-negative").optional().nullable(),
  currencyCode: z.string().optional().nullable(),
  appointmentTime: z.string().optional().nullable(),
  unitMeasureCode: z.string().optional().nullable(),
});

type CollaboratorFormData = z.infer<typeof collaboratorSchema>;

interface CollaboratorFormPageProps {
  id?: string;
}

export default function CollaboratorFormPage({ id }: CollaboratorFormPageProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const commercialProductId = searchParams.get('commercialProductId');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const { vendor } = useVendor();
  const [persons, setPersons] = useState<Person[]>([]);
  const [isLoadingPersons, setIsLoadingPersons] = useState(false);

  const fetchPersons = useCallback(async () => {
    if (!vendor) return;
    setIsLoadingPersons(true);
    try {
      const data = await personRepository.getByVendorId(vendor);
      setPersons(data);
    } catch (error) {
      console.error("Error fetching persons:", error);
    } finally {
      setIsLoadingPersons(false);
    }
  }, [vendor]);

  useEffect(() => {
    fetchPersons();
  }, [fetchPersons]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<CollaboratorFormData>({
    resolver: zodResolver(collaboratorSchema),
    defaultValues: {
      commercialProductId: commercialProductId || '',
      employeeId: '',
      type: 'STANDARD',
      status: 'ACTIVE',
      feeAmount: 0,
      currencyCode: 'USD',
      appointmentTime: '',
      unitMeasureCode: 'MIN',
    }
  });

  useEffect(() => {
    if (id) {
      const fetchCollaborator = async () => {
        setIsLoading(true);
        try {
          const data = await collaboratorRepository.getById(id);
          reset({
            commercialProductId: data.commercialProductId,
            employeeId: data.employeeId,
            type: data.type || 'STANDARD',
            status: data.status || 'ACTIVE',
            feeAmount: data.feeAmount || 0,
            currencyCode: data.currencyCode || 'USD',
            appointmentTime: data.appointmentTime || '',
            unitMeasureCode: data.unitMeasureCode || 'MIN',
          });
        } catch (error) {
          console.error("Error fetching collaborator:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCollaborator();
    }
  }, [id, reset]);

  const onSubmit = async (data: CollaboratorFormData) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await collaboratorRepository.update({ ...data, id });
        toast.success(t('common.recordUpdated') || 'Record updated successfully');
      } else {
        await collaboratorRepository.create(data);
        toast.success(t('common.recordCreated') || 'Record created successfully');
      }
      router.back();
    } catch (error: any) {
      console.error("Error saving collaborator:", error);
      toast.error(error.message || t('common.errorSaving') || 'Error saving record');
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
              {id ? t(COLLABORATOR_CONSTANTS.EDIT_TITLE) || 'Edit Collaborator' : t(COLLABORATOR_CONSTANTS.CREATE_TITLE) || 'New Collaborator'}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {id ? t(COLLABORATOR_CONSTANTS.DESCRIPTION_EDIT) || 'Edit collaborator record details.' : t(COLLABORATOR_CONSTANTS.DESCRIPTION_TITLE) || 'Add a new collaborator to this product.'}
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
                  <User size={14} className="text-primary" /> Employee
                </label>
                <Controller
                  name="employeeId"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <select
                        {...field}
                        disabled={isLoadingPersons || !vendor}
                        className={cn(
                          "w-full h-11 px-3 py-2 text-sm bg-card border border-border/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none",
                          errors.employeeId ? "border-destructive" : "focus:border-primary/40",
                          (isLoadingPersons || !vendor) && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        <option value="">
                          {isLoadingPersons
                            ? t('common.loading') || 'Loading...'
                            : t(COLLABORATOR_CONSTANTS.FORM.SELECT_OPTION) || 'Select Employee'}
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
                {errors.employeeId && <p className="text-[10px] text-destructive font-medium ml-1">{errors.employeeId.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                  Type
                </label>
                <Input {...register("type")} className="h-11 bg-card/80 border-border/50" placeholder="e.g. PARTNER, CONTRACTOR" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                  <DollarSign size={14} className="text-primary" /> Fee Amount
                </label>
                <Input type="number" step="0.01" {...register("feeAmount")} className="h-11 bg-card/80 border-border/50" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                  Currency
                </label>
                <Input {...register("currencyCode")} className="h-11 bg-card/80 border-border/50" placeholder="e.g. USD, PYG" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                  <Clock size={14} className="text-primary" /> Appointment Duration
                </label>
                <Input {...register("appointmentTime")} className="h-11 bg-card/80 border-border/50" placeholder="e.g. 30" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                  Unit of Measure
                </label>
                <Input {...register("unitMeasureCode")} className="h-11 bg-card/80 border-border/50" placeholder="e.g. MIN, HOUR" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                  Status
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
            </div>
          </CardContent>
          <CardFooter className="bg-primary/5 p-8 flex gap-4">
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 h-12 font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {t(COLLABORATOR_CONSTANTS.FORM.SUBMIT)}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all h-12 font-bold"
              onClick={handleCancel}
            >
              <X className="mr-2 h-5 w-5" />
              {t(COLLABORATOR_CONSTANTS.FORM.CANCEL)}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <ConfirmDialog
        open={showConfirmCancel}
        onOpenChange={setShowConfirmCancel}
        title={t(COLLABORATOR_CONSTANTS.FORM.CONFIRM_CANCEL)}
        description={t(COLLABORATOR_CONSTANTS.FORM.DIRTY_WARNING)}
        onConfirm={() => router.back()}
      />
    </div>
  );
}
