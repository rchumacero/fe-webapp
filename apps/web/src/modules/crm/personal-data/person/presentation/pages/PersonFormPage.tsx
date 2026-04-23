"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@kplian/i18n';
import { PERSON_CONSTANTS } from '../../constants/person-constants';
import { PERSON_ROUTES } from '../../routes/person-routes';
import { PersonRepositoryImpl } from '../../infrastructure/repositories/PersonRepositoryImpl';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Save, X, ArrowLeft, Loader2, User, UserCircle, Calendar, MapPin, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { PERSON_DOMAIN_PARAMETERS, P_TYPE, P_LOCATION, P_GENDER } from '../../constants/parameter';
import { IDENTIFICATION_DOMAIN_PARAMETERS, P_IDENT_TYPE } from '@/modules/crm/personal-data/identification/constants/parameter';
import { COMMUNICATION_CHANNEL_DOMAIN_PARAMETERS, P_COMM_CHANNNEL, P_COMM_CHANNNEL_KIND } from '@/modules/crm/personal-data/communication-channel/constants/parameter';
import { PERSON_DIGITAL_CONTENT_DOMAIN_PARAMETERS, P_MEDIA_TYPE } from '@/modules/crm/personal-data/person-digital-content/constants/parameter';
import { IdentificationRepositoryImpl } from '@/modules/crm/personal-data/identification/infrastructure/repositories/IdentificationRepositoryImpl';
import { CommunicationChannelRepositoryImpl } from '@/modules/crm/personal-data/communication-channel/infrastructure/repositories/CommunicationChannelRepositoryImpl';
import { PersonDigitalContentRepositoryImpl } from '@/modules/crm/personal-data/person-digital-content/infrastructure/repositories/PersonDigitalContentRepositoryImpl';
import { IDENTIFICATION_CONSTANTS } from '@/modules/crm/personal-data/identification/constants/identification-constants';
import { COMMUNICATION_CHANNEL_CONSTANTS } from '@/modules/crm/personal-data/communication-channel/constants/communication-channel-constants';
import { PERSON_DIGITAL_CONTENT_CONSTANTS } from '@/modules/crm/personal-data/person-digital-content/constants/person-digital-content-constants';
import { bucketService } from '@kplian/core';
import { Fingerprint, MessageSquare, ImageIcon, Upload, FileText, PlusCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

const personRepository = new PersonRepositoryImpl();
const identificationRepository = new IdentificationRepositoryImpl();
const communicationChannelRepository = new CommunicationChannelRepositoryImpl();
const personDigitalContentRepository = new PersonDigitalContentRepositoryImpl();

// Zod Schema based on instructions
const personSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name1: z.string().min(2, "Name 1 is required"),
  name2: z.string().optional(),
  name3: z.string().optional(),
  surname1: z.string().optional(),
  surname2: z.string().optional(),
  surname3: z.string().optional(),
  birthdate: z.string().optional().or(z.literal('')),
  gender: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  cityOrigin: z.string().min(1, "City is required"),
  // Optional sections for new record
  identification: z.object({
    type: z.string().optional(),
    numberIdent: z.string().optional(),
    prefix: z.string().optional(),
    sufix: z.string().optional(),
    priority: z.coerce.number().optional().default(1),
  }).optional(),
  communication: z.object({
    type: z.string().optional(),
    kind: z.string().optional(),
    contactData: z.string().optional(),
    priority: z.coerce.number().optional().default(1),
  }).optional(),
  digitalContent: z.object({
    type: z.string().optional(),
    priority: z.coerce.number().optional().default(1),
  }).optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'nat') {
    if (!data.surname1 || data.surname1.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Surname 1 is required",
        path: ["surname1"],
      });
    }
    if (!data.birthdate || !/^\d{4}-\d{2}-\d{2}$/.test(data.birthdate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid date format",
        path: ["birthdate"],
      });
    }
  }
});

type PersonFormData = z.infer<typeof personSchema>;

interface PersonFormProps {
  id?: string;
}

export default function PersonFormPage({ id }: PersonFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: parameters, isLoading: isLoadingParams } = useDomainParameters({
    parameters: [
      ...PERSON_DOMAIN_PARAMETERS,
      ...IDENTIFICATION_DOMAIN_PARAMETERS,
      ...COMMUNICATION_CHANNEL_DOMAIN_PARAMETERS,
      ...PERSON_DIGITAL_CONTENT_DOMAIN_PARAMETERS
    ]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [initialData, setInitialData] = useState<PersonFormData | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    identification: false,
    communication: false,
    digitalContent: false
  });
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors, isDirty },
  } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      code: '',
      name1: '',
      name2: '',
      name3: '',
      surname1: '',
      surname2: '',
      surname3: '',
      birthdate: '',
      gender: 'MAL',
      type: 'nat',
      cityOrigin: '',
      identification: {
        type: '',
        numberIdent: '',
        prefix: '',
        sufix: '',
        priority: 1,
      },
      communication: {
        type: '',
        kind: '',
        contactData: '',
        priority: 1,
      },
      digitalContent: {
        type: '',
        priority: 1,
      }
    }
  });

  useEffect(() => {
    if (id) {
      const fetchPerson = async () => {
        setIsLoading(true);
        try {
          const person = await personRepository.getById(id);
          const data: PersonFormData = {
            code: person.code || '',
            name1: person.name1 || '',
            name2: person.name2 || '',
            name3: person.name3 || '',
            surname1: person.surname1 || '',
            surname2: person.surname2 || '',
            surname3: person.surname3 || '',
            birthdate: person.birthdate || '',
            gender: person.gender || 'OTH',
            type: person.type || 'nat',
            cityOrigin: person.cityOrigin || '',
          };
          setInitialData(data);
          reset(data);
        } catch (error) {
          console.error("Error fetching person:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPerson();
    }
  }, [id, reset]);

  const { data: session } = useSession();
  const personType = watch("type");
  const isLegal = personType === 'leg';

  const onSubmit = async (formData: PersonFormData) => {
    setIsSubmitting(true);
    const currentUser = (session?.user as any)?.username;
    try {
      let personId = id;
      const { identification, communication, digitalContent, ...data } = formData;

      if (id) {
        await personRepository.update({ ...data, id });
      } else {
        const result = await personRepository.create({ ...data, vendorCode: currentUser });
        personId = result.id;

        // Multi-step persist for new record
        if (personId) {
          // 1. Identification
          if (identification?.type && identification?.numberIdent) {
            await identificationRepository.create({
              ...identification,
              personId,
              type: identification.type,
              numberIdent: identification.numberIdent,
              priority: identification.priority ?? 1
            });
          }

          // 2. Communication Channel
          if (communication?.type && communication?.kind && communication?.contactData) {
            await communicationChannelRepository.create({
              ...communication,
              personId,
              type: communication.type,
              kind: communication.kind,
              contactData: communication.contactData,
              priority: communication.priority ?? 1
            });
          }

          // 3. Digital Content / Document
          if (digitalContent?.type || selectedFile) {
            const dcResult = await personDigitalContentRepository.create({
              personId,
              type: digitalContent?.type || 'OTH', // Fallback if only file selected
              priority: digitalContent?.priority || 1,
              digitalContentCode: 'PENDING_UPLOAD'
            });

            if (selectedFile && dcResult?.id) {
              const uploadResult = await bucketService.uploadFile({
                file: selectedFile,
                moduleCode: PERSON_DIGITAL_CONTENT_CONSTANTS.MODULE_CODE,
                entityName: PERSON_DIGITAL_CONTENT_CONSTANTS.ENTITY_NAME,
                entityId: dcResult.id,
                bucketName: PERSON_DIGITAL_CONTENT_CONSTANTS.BUCKET_NAME,
                securityLevelCode: 'PUBLIC'
              });

              const fileId = uploadResult?.id || uploadResult?.code || uploadResult?.fileId;
              if (fileId) {
                await personDigitalContentRepository.update({
                  id: dcResult.id,
                  personId,
                  type: digitalContent?.type || 'OTH',
                  digitalContentCode: fileId.toString(),
                  priority: digitalContent?.priority || 1
                });
              }
            }
          }
        }
      }
      router.push(PERSON_ROUTES.LIST);
    } catch (error) {
      console.error("Error saving person and sub-modules:", error);
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
    router.push(PERSON_ROUTES.LIST);
  };

  const confirmCancel = () => {
    setShowConfirmCancel(false);
    router.push(PERSON_ROUTES.LIST);
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
      {/* Header */}
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
              {id ? t(PERSON_CONSTANTS.EDIT_TITLE) : t(PERSON_CONSTANTS.CREATE_TITLE)}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">{id ? t(PERSON_CONSTANTS.DESCRIPTION_EDIT) : t(PERSON_CONSTANTS.DESCRIPTION_TITLE)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Single Main Column: Profile Information */}
        <div className="lg:col-span-2">
          <Card className="border-border/40 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm h-full">
            <CardContent className="p-8 space-y-8">
              {/* Identity Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(PERSON_CONSTANTS.FORM.TYPE)}</label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                      >
                        <option value="" className="bg-card text-foreground">{t('common.notDefined')}</option>
                        {parameters[P_TYPE]?.map((p: any, idx: number) => {
                          const val = p.KEY ?? p.CODE ?? p.VALUE ?? p.ID ?? p.code ?? p.value ?? p.id ?? p.valueStr ?? p.fullCode ?? p;
                          const label = p.NAME || p.name || p.label || p.description || p.valueStr || val || `Item ${idx}`;
                          return (
                            <option key={`${val}-${idx}`} value={val} className="bg-card text-foreground">{label}</option>
                          );
                        })}
                      </select>
                    )}
                  />
                  {errors.type && <p className="text-[10px] text-destructive font-medium ml-1">{errors.type.message}</p>}
                </div>
                <div className="space-y-2">
                  NUEVO TEXTO
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(PERSON_CONSTANTS.FORM.CODE)}</label>
                  <Input {...register("code")} className={errors.code ? "border-destructive focus-visible:ring-destructive/20" : ""} />
                  {errors.code && <p className="text-[10px] text-destructive font-medium ml-1">{errors.code.message}</p>}
                </div>
              </div>
              {/* Names Section */}
              <div className="space-y-6">
                <div className={`grid grid-cols-1 ${isLegal ? 'md:grid-cols-1' : 'md:grid-cols-3'} gap-6`}>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      {isLegal ? t('crm.company', 'Company') : t(PERSON_CONSTANTS.FORM.NAME1)}
                    </label>
                    <Input {...register("name1")} className={errors.name1 ? "border-destructive focus-visible:ring-destructive/20" : ""} />
                    {errors.name1 && <p className="text-[10px] text-destructive font-medium ml-1">{errors.name1.message}</p>}
                  </div>
                  {!isLegal && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(PERSON_CONSTANTS.FORM.NAME2)}</label>
                        <Input {...register("name2")} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(PERSON_CONSTANTS.FORM.NAME3)}</label>
                        <Input {...register("name3")} />
                      </div>
                    </>
                  )}
                </div>

                {!isLegal && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(PERSON_CONSTANTS.FORM.SURNAME1)}</label>
                      <Input {...register("surname1")} className={errors.surname1 ? "border-destructive focus-visible:ring-destructive/20" : ""} />
                      {errors.surname1 && <p className="text-[10px] text-destructive font-medium ml-1">{errors.surname1.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(PERSON_CONSTANTS.FORM.SURNAME2)}</label>
                      <Input {...register("surname2")} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t(PERSON_CONSTANTS.FORM.SURNAME3)}</label>
                      <Input {...register("surname3")} />
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Details Section */}
              <div className="space-y-6">
                <div className={`grid grid-cols-1 ${isLegal ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-8`}>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                      <Calendar size={14} className="text-primary/60" />
                      {isLegal ? t('crm.establishmentDate', 'Date of establishment') : t(PERSON_CONSTANTS.FORM.BIRTHDATE)}
                    </label>
                    <input
                      type="date"
                      {...register("birthdate")}
                      className={`flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all ${errors.birthdate ? "border-destructive" : ""}`}
                    />
                    {errors.birthdate && <p className="text-[10px] text-destructive font-medium ml-1">{errors.birthdate.message}</p>}
                  </div>

                  {!isLegal && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                        <User size={14} className="text-primary/60" />
                        {t(PERSON_CONSTANTS.FORM.GENDER)}
                      </label>
                      <Controller
                        name="gender"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium cursor-pointer"
                          >
                            <option value="" className="bg-card text-foreground">{t('common.notDefined') || 'Select Gender'}</option>
                            {parameters[P_GENDER]?.map((p: any, idx: number) => {
                              const val = p.KEY ?? p.CODE ?? p.VALUE ?? p.ID ?? p.code ?? p.value ?? p.id ?? p.valueStr ?? p.fullCode ?? p;
                              const label = p.NAME || p.name || p.label || p.description || p.valueStr || val || `Item ${idx}`;
                              return (
                                <option key={`${val}-${idx}`} value={val} className="bg-card text-foreground">{label}</option>
                              );
                            })}
                          </select>
                        )}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                      <MapPin size={14} className="text-primary/60" />
                      {t(PERSON_CONSTANTS.FORM.CITY)}
                    </label>
                    <Controller
                      name="cityOrigin"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer"
                        >
                          <option value="" className="bg-card text-foreground">{t('common.notDefined')}</option>
                          {parameters[P_LOCATION]?.map((p: any, idx: number) => {
                            const val = p.KEY ?? p.CODE ?? p.VALUE ?? p.ID ?? p.code ?? p.value ?? p.id ?? p.valueStr ?? p.fullCode ?? p;
                            const label = p.NAME || p.name || p.label || p.description || p.valueStr || val || `Item ${idx}`;
                            return (
                              <option key={`${val}-${idx}`} value={val} className="bg-card text-foreground">{label}</option>
                            );
                          })}
                        </select>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Optional Collapsible Sections ONLY for NEW record */}
              {!id && (
                <div className="space-y-4 pt-4">
                  <Separator className="bg-border/10 mb-4" />

                  <div className="px-1 mb-2">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary/70">
                      Additional Details
                    </h3>
                  </div>

                  {/* Identification Collapsible */}
                  <div className="border border-border/40 rounded-xl overflow-hidden bg-background/30 transition-all">
                    <button
                      type="button"
                      onClick={() => toggleSection('identification')}
                      className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Fingerprint size={18} className={cn("transition-colors", expandedSections.identification ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-sm font-bold uppercase tracking-wider">Identification Document</span>
                      </div>
                      {expandedSections.identification ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>

                    {expandedSections.identification && (
                      <div className="p-6 pt-2 border-t border-border/10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Type</label>
                          <Controller
                            name="identification.type"
                            control={control}
                            render={({ field }) => (
                              <select
                                {...field}
                                className="flex h-10 w-full rounded-md border border-border/50 bg-card/50 px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                              >
                                <option value="">Select Type</option>
                                {parameters[P_IDENT_TYPE]?.map((p: any, idx: number) => {
                                  const val = p.KEY ?? p.CODE ?? p.VALUE ?? p.ID ?? p.code ?? p.value ?? p.id ?? p.valueStr ?? p.fullCode ?? p;
                                  const label = p.NAME || p.name || p.label || p.description || p.valueStr || val || `Item ${idx}`;
                                  return <option key={`${val}-${idx}`} value={val}>{label}</option>;
                                })}
                              </select>
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Number</label>
                          <Input {...register("identification.numberIdent")} placeholder="ID Number" className="h-10 bg-card/50" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Communication Channel Collapsible */}
                  <div className="border border-border/40 rounded-xl overflow-hidden bg-background/30 transition-all">
                    <button
                      type="button"
                      onClick={() => toggleSection('communication')}
                      className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare size={18} className={cn("transition-colors", expandedSections.communication ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-sm font-bold uppercase tracking-wider">Communication Channel</span>
                      </div>
                      {expandedSections.communication ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>

                    {expandedSections.communication && (
                      <div className="p-6 pt-2 border-t border-border/10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Type</label>
                          <Controller
                            name="communication.type"
                            control={control}
                            render={({ field }) => (
                              <select
                                {...field}
                                className="flex h-10 w-full rounded-md border border-border/50 bg-card/50 px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                              >
                                <option value="">Select Type</option>
                                {parameters[P_COMM_CHANNNEL]?.map((p: any, idx: number) => {
                                  const val = p.KEY ?? p.CODE ?? p.VALUE ?? p.ID ?? p.code ?? p.value ?? p.id ?? p.valueStr ?? p.fullCode ?? p;
                                  const label = p.NAME || p.name || p.label || p.description || p.valueStr || val || `Item ${idx}`;
                                  return <option key={`${val}-${idx}`} value={val}>{label}</option>;
                                })}
                              </select>
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Kind</label>
                          <Controller
                            name="communication.kind"
                            control={control}
                            render={({ field }) => (
                              <select
                                {...field}
                                className="flex h-10 w-full rounded-md border border-border/50 bg-card/50 px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                              >
                                <option value="">Select Kind</option>
                                {parameters[P_COMM_CHANNNEL_KIND]?.map((p: any, idx: number) => {
                                  const val = p.KEY ?? p.CODE ?? p.VALUE ?? p.ID ?? p.code ?? p.value ?? p.id ?? p.valueStr ?? p.fullCode ?? p;
                                  const label = p.NAME || p.name || p.label || p.description || p.valueStr || val || `Item ${idx}`;
                                  return <option key={`${val}-${idx}`} value={val}>{label}</option>;
                                })}
                              </select>
                            )}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Contact Data</label>
                          <Input {...register("communication.contactData")} placeholder="Email, phone, etc." className="h-10 bg-card/50" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Digital Content Collapsible */}
                  <div className="border border-border/40 rounded-xl overflow-hidden bg-background/30 transition-all">
                    <button
                      type="button"
                      onClick={() => toggleSection('digitalContent')}
                      className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <ImageIcon size={18} className={cn("transition-colors", expandedSections.digitalContent ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-sm font-bold uppercase tracking-wider">Upload Document</span>
                      </div>
                      {expandedSections.digitalContent ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>

                    {expandedSections.digitalContent && (
                      <div className="p-6 pt-2 border-t border-border/10 space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Media Type</label>
                          <Controller
                            name="digitalContent.type"
                            control={control}
                            render={({ field }) => (
                              <select
                                {...field}
                                className="flex h-10 w-full rounded-md border border-border/50 bg-card/50 px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                              >
                                <option value="">Select Media Type</option>
                                {parameters[P_MEDIA_TYPE]?.map((p: any, idx: number) => {
                                  const val = p.KEY ?? p.CODE ?? p.VALUE ?? p.ID ?? p.code ?? p.value ?? p.id ?? p.valueStr ?? p.fullCode ?? p;
                                  const label = p.NAME || p.name || p.label || p.description || p.valueStr || val || `Item ${idx}`;
                                  return <option key={`${val}-${idx}`} value={val}>{label}</option>;
                                })}
                              </select>
                            )}
                          />
                        </div>

                        <div
                          className={cn(
                            "border-2 border-dashed rounded-xl p-6 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group",
                            selectedFile ? "border-primary/40 bg-primary/5" : "border-border/40 hover:border-primary/20 hover:bg-accent/5"
                          )}
                          onClick={() => document.getElementById('file-upload-inline')?.click()}
                        >
                          <input
                            id="file-upload-inline"
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setSelectedFile(file);
                            }}
                          />

                          {selectedFile ? (
                            <div className="flex items-center gap-3">
                              <FileText size={18} className="text-primary" />
                              <span className="text-xs font-bold truncate max-w-[150px]">{selectedFile.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive"
                                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                              >
                                <X size={14} />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                              <Upload size={16} />
                              <span className="text-xs font-bold">Upload document</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Actions and Meta */}
        <div className="space-y-8">
          <Card className="border-primary/20 bg-primary/5 shadow-xl border-dashed">
            <CardHeader>
              <CardTitle className="text-base font-bold text-primary">Form Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Modified:</span>
                <span className={isDirty ? "text-amber-500 font-bold" : "text-emerald-500 font-bold"}>
                  {isDirty ? "YES" : "NO"}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed italic border-t border-border/10 pt-4">
                Verify all information before saving. National identity data is sensitive and requires accuracy.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-6 pb-8 px-6">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 h-12 font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                {t(PERSON_CONSTANTS.FORM.SUBMIT)}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all h-12 font-bold"
                onClick={handleCancel}
              >
                <X className="mr-2 h-5 w-5" />
                {t(PERSON_CONSTANTS.FORM.CANCEL)}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>

      <ConfirmDialog
        open={showConfirmCancel}
        onOpenChange={setShowConfirmCancel}
        title={t('common.confirmCancel', 'Discard Changes?')}
        description={t(PERSON_CONSTANTS.FORM.DIRTY_WARNING) || "You have unsaved changes. Are you sure you want to cancel and lose your progress?"}
        confirmText={t('common.yesDiscard', 'Yes, Discard')}
        cancelText={t('common.noStay', 'No, Stay')}
        onConfirm={confirmCancel}
        type="warning"
      />
    </div>
  );
}
