"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from '@kplian/i18n';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  ImageIcon,
  Loader2,
  Upload,
  FileText
} from 'lucide-react';
import { bucketService } from '@kplian/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PERSON_DIGITAL_CONTENT_CONSTANTS } from '../../constants/person-digital-content-constants';
import { PersonDigitalContentRepositoryImpl } from '../../infrastructure/repositories/PersonDigitalContentRepositoryImpl';
import { PERSON_DIGITAL_CONTENT_DOMAIN_PARAMETERS, P_MEDIA_TYPE } from '../../constants/parameter';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

const personDigitalContentSchema = z.object({
  personId: z.string().min(1, "Person ID is required"),
  type: z.string().trim().min(1, "Type is required"),
  priority: z.coerce.number().min(1, "Priority minimum 1").optional().default(1),
});

type PersonDigitalContentFormData = z.infer<typeof personDigitalContentSchema>;

const personDigitalContentRepository = new PersonDigitalContentRepositoryImpl();

interface PersonDigitalContentFormPageProps {
  params?: Promise<{ id?: string }>;
}

export const PersonDigitalContentFormPage = ({ params }: PersonDigitalContentFormPageProps) => {
  const resolvedParams = params ? React.use(params) : null;
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const id = resolvedParams?.id || null;
  const personId = searchParams.get('personId') || null;

  const { data: parametersData } = useDomainParameters({
    parameters: PERSON_DIGITAL_CONTENT_DOMAIN_PARAMETERS
  });
  const typeOptions = parametersData[P_MEDIA_TYPE] || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    setValue,
    control
  } = useForm<PersonDigitalContentFormData>({
    resolver: zodResolver(personDigitalContentSchema),
    defaultValues: {
      personId: personId || '',
      type: '',
      priority: 1,
    }
  });

  useEffect(() => {
    if (personId && !id) {
      setValue('personId', personId);
    }
  }, [personId, id, setValue]);

  useEffect(() => {
    if (id) {
      const fetchContent = async () => {
        setIsLoading(true);
        try {
          const data = await personDigitalContentRepository.getById(id);
          reset({
            personId: data.personId,
            type: data.type,
            priority: data.priority || 1,
          });
        } catch (error) {
          console.error("Error fetching digital content:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchContent();
    }
  }, [id, reset]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.warn("PersonDigitalContent validation errors:", errors);
    }
  }, [errors]);

  const onSubmit = async (data: PersonDigitalContentFormData) => {
    setIsSubmitting(true);
    try {
      let result;
      
      // Step 1: Create or Update (initially with placeholder if new)
      if (id) {
        result = await personDigitalContentRepository.update({ ...data, id });
      } else {
        // Use a temp value for digitalContentCode as it's likely mandatory in the back
        result = await personDigitalContentRepository.create({ 
          ...data, 
          digitalContentCode: 'PENDING_UPLOAD' 
        });
      }

      // Step 2: Handle file upload if a file is selected
      if (selectedFile && result?.id) {
        console.log("Step 2: Uploading file to bucket for entity ID:", result.id);
        const uploadResult = await bucketService.uploadFile({
          file: selectedFile,
          moduleCode: PERSON_DIGITAL_CONTENT_CONSTANTS.MODULE_CODE,
          entityName: PERSON_DIGITAL_CONTENT_CONSTANTS.ENTITY_NAME,
          entityId: result.id,
          bucketName: PERSON_DIGITAL_CONTENT_CONSTANTS.BUCKET_NAME,
          securityLevelCode: 'PUBLIC'
        });

        // Step 3: Update PersonDigitalContent with the result ID from bucket
        // uploadResult.id is expected
        const fileId = uploadResult?.id || uploadResult?.code || uploadResult?.fileId;
        if (fileId) {
          console.log("Step 3: Updating digitalContentCode with bucket ID:", fileId);
          await personDigitalContentRepository.update({
            ...data,
            id: result.id,
            digitalContentCode: fileId.toString()
          });
        }
      }

      router.back();
    } catch (error) {
      console.error("Error in complex submission flow:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
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
    <div className="max-w-xl mx-auto space-y-6 py-6 px-4 font-sans">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel} className="rounded-full h-10 w-10">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">
            {id ? t(PERSON_DIGITAL_CONTENT_CONSTANTS.EDIT_TITLE) : t(PERSON_DIGITAL_CONTENT_CONSTANTS.CREATE_TITLE)}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{id ? t(PERSON_DIGITAL_CONTENT_CONSTANTS.DESCRIPTION_EDIT) : t(PERSON_DIGITAL_CONTENT_CONSTANTS.DESCRIPTION_TITLE)}</p>
        </div>
      </div>

      <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register("personId")} />
          <CardContent className="space-y-6 pt-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t(PERSON_DIGITAL_CONTENT_CONSTANTS.FORM.TYPE)}
              </label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className={cn(
                      "w-full h-10 px-3 py-2 text-sm bg-card border border-border/40 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all",
                      errors.type ? "border-destructive" : "focus:border-primary/40"
                    )}
                  >
                    <option value="">{t('common.selectOption') || 'Select Media Type'}</option>
                    {typeOptions.map((p: any, idx: number) => {
                      const val = p.KEY ?? p.CODE ?? p.VALUE ?? p.ID ?? p.code ?? p.value ?? p.id ?? p.valueStr ?? p.fullCode ?? p;
                      const label = p.NAME || p.name || p.label || p.description || p.valueStr || val || `Item ${idx}`;
                      return (
                        <option key={`${val}-${idx}`} value={val}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                )}
              />
              {errors.type && <p className="text-[10px] text-destructive font-bold uppercase">{errors.type.message}</p>}
            </div>


            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t(PERSON_DIGITAL_CONTENT_CONSTANTS.FORM.PRIORITY)}
              </label>
              <Input
                type="number"
                {...register("priority")}
                className={errors.priority ? "border-destructive focus-visible:ring-destructive/20" : ""}
              />
            </div>

            <div className="pt-4">
              <Separator className="bg-border/10 mb-6" />
              <div className="space-y-4">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Upload size={14} className="text-primary/60" />
                  {t(PERSON_DIGITAL_CONTENT_CONSTANTS.FORM.FILE) || 'Digital File'}
                </label>
                
                <div 
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group",
                    selectedFile 
                      ? "border-primary/40 bg-primary/5" 
                      : "border-border/40 hover:border-primary/20 hover:bg-accent/5"
                  )}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setSelectedFile(file);
                    }}
                  />
                  
                  {selectedFile ? (
                    <>
                      <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <FileText size={24} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-foreground truncate max-w-[200px]">
                          {selectedFile.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase mt-1">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-[10px] font-bold uppercase text-destructive hover:bg-destructive/10 mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                      >
                        Remove file
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="h-12 w-12 bg-muted/20 rounded-full flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform">
                        <Upload size={24} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-muted-foreground">
                          Click or drag to upload
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 uppercase mt-1">
                          PDF, Images, or Documents
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 pb-8 pt-4 px-8 border-t border-border/10">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              className="font-bold uppercase text-[10px] tracking-widest px-6"
            >
              {t(PERSON_DIGITAL_CONTENT_CONSTANTS.FORM.CANCEL)}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="font-bold uppercase text-[10px] tracking-widest px-8 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={14} /> : <Save className="mr-2" size={14} />}
              {t(PERSON_DIGITAL_CONTENT_CONSTANTS.FORM.SUBMIT)}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <ConfirmDialog
        open={showConfirmCancel}
        onOpenChange={setShowConfirmCancel}
        title={t('common.confirmCancel', 'Discard Changes?')}
        description={t(PERSON_DIGITAL_CONTENT_CONSTANTS.FORM.DIRTY_WARNING) || "You have unsaved changes. Are you sure you want to cancel?"}
        confirmText={t('common.yesDiscard', 'Yes, Discard')}
        cancelText={t('common.noStay', 'No, Stay')}
        onConfirm={confirmCancel}
        type="warning"
      />
    </div>
  );
};
