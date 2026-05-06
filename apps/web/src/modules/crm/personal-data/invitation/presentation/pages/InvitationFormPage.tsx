"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@kplian/i18n';
import { INVITATION_CONSTANTS } from '../../constants/invitation-constants';
import { INVITATION_ROUTES } from '../../routes/invitation-routes';
import { InvitationRepositoryImpl } from '../../infrastructure/repositories/InvitationRepositoryImpl';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, X, ArrowLeft, Loader2, Mail, Calendar, Link as LinkIcon, Info, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDomainParameters } from '@/hooks/use-domain-parameters';
import { INVITATION_DOMAIN_PARAMETERS } from '../../constants/parameter';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';



const invitationSchema = z.object({
  to: z.string().email("Invalid email").min(1, "Recipient email is required"),
  subjectNotify: z.string().min(3, "Subject is required"),
  bodyNotify: z.string().min(10, "Body is required"),
  url: z.string().url("Invalid URL").optional().or(z.literal('')),
  fromDate: z.string().min(1, "From date is required"),
  toDate: z.string().min(1, "To date is required"),
  profiles: z.string().optional().or(z.literal('')),
});

type InvitationFormData = z.infer<typeof invitationSchema>;

interface InvitationFormProps {
  id?: string;
  personId?: string;
}

const invitationRepository = new InvitationRepositoryImpl();

export default function InvitationFormPage({ id, personId }: InvitationFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      to: '',
      subjectNotify: 'Invitation to join CRM',
      bodyNotify: 'You have been invited to collaborate with us in the CRM platform.',
      url: '',
      fromDate: new Date().toISOString().split('T')[0],
      toDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      profiles: '',
    }
  });


  useEffect(() => {
    if (id) {
      const fetchInvitation = async () => {
        setIsLoading(true);
        try {
          const invitation = await invitationRepository.getById(id);
          reset({
            to: invitation.to,
            subjectNotify: invitation.subjectNotify,
            bodyNotify: invitation.bodyNotify,
            url: invitation.url,
            fromDate: invitation.fromDate.split(' ')[0],
            toDate: invitation.toDate.split(' ')[0],
            profiles: invitation.profiles || '',
          });
        } catch (error) {
          console.error("Error fetching invitation:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchInvitation();
    } else if (typeof window !== 'undefined') {
      // Set default URL for new records
      reset(prev => ({
        ...prev,
        url: window.location.origin
      }));
    }
  }, [id, reset]);

  const onSubmit = async (formData: InvitationFormData) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await invitationRepository.update({ ...formData, id, personId: personId || '' });
      } else {
        await invitationRepository.create({ ...formData, personId: personId || '' });
      }
      router.push(INVITATION_ROUTES.LIST);
    } catch (error) {
      console.error("Error saving invitation:", error);
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
    router.push(INVITATION_ROUTES.LIST);
  };

  const confirmCancel = () => {
    setShowConfirmCancel(false);
    router.push(INVITATION_ROUTES.LIST);
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
              {id ? t(INVITATION_CONSTANTS.EDIT_TITLE) : t(INVITATION_CONSTANTS.CREATE_TITLE)}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">{id ? t(INVITATION_CONSTANTS.DESCRIPTION_EDIT) : t(INVITATION_CONSTANTS.DESCRIPTION_TITLE)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Column */}
        <div className="lg:col-span-2">
          <Card className="border-border/40 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm h-full">
            <CardContent className="p-8 space-y-8">
              {/* Recipient and URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                    <Mail size={14} className="text-primary/60" />
                    {t(INVITATION_CONSTANTS.FORM.TO)}
                  </label>
                  <Input {...register("to")} placeholder="email@example.com" className={errors.to ? "border-destructive focus-visible:ring-destructive/20" : ""} />
                  {errors.to && <p className="text-[10px] text-destructive font-medium ml-1">{errors.to.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                    <LinkIcon size={14} className="text-primary/60" />
                    {t(INVITATION_CONSTANTS.FORM.URL)}
                  </label>
                  <Input {...register("url")} placeholder="https://..." disabled className={errors.url ? "border-destructive focus-visible:ring-destructive/20 bg-muted/30" : "bg-muted/30"} />
                  {errors.url && <p className="text-[10px] text-destructive font-medium ml-1">{errors.url.message}</p>}
                </div>
              </div>

              {/* Subject and Profiles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    {t(INVITATION_CONSTANTS.FORM.SUBJECT)}
                  </label>
                  <Input {...register("subjectNotify")} className={errors.subjectNotify ? "border-destructive focus-visible:ring-destructive/20" : ""} />
                  {errors.subjectNotify && <p className="text-[10px] text-destructive font-medium ml-1">{errors.subjectNotify.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    {t(INVITATION_CONSTANTS.FORM.PROFILES)}
                  </label>
                  <Input {...register("profiles")} placeholder="ADMIN, USER" />
                </div>
              </div>

              {/* Body */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  {t(INVITATION_CONSTANTS.FORM.BODY)}
                </label>
                <Textarea {...register("bodyNotify")} className={cn("min-h-[120px]", errors.bodyNotify ? "border-destructive focus-visible:ring-destructive/20" : "")} />
                {errors.bodyNotify && <p className="text-[10px] text-destructive font-medium ml-1">{errors.bodyNotify.message}</p>}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                    <Calendar size={14} className="text-primary/60" />
                    {t(INVITATION_CONSTANTS.FORM.FROM_DATE)}
                  </label>
                  <input
                    type="date"
                    {...register("fromDate")}
                    className={`flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all ${errors.fromDate ? "border-destructive" : ""}`}
                  />
                  {errors.fromDate && <p className="text-[10px] text-destructive font-medium ml-1">{errors.fromDate.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-2">
                    <Calendar size={14} className="text-primary/60" />
                    {t(INVITATION_CONSTANTS.FORM.TO_DATE)}
                  </label>
                  <input
                    type="date"
                    {...register("toDate")}
                    className={`flex h-11 w-full rounded-md border border-border/50 bg-card/80 px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all ${errors.toDate ? "border-destructive" : ""}`}
                  />
                  {errors.toDate && <p className="text-[10px] text-destructive font-medium ml-1">{errors.toDate.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-8">
          <Card className="border-primary/20 bg-primary/5 shadow-xl border-dashed">
            <CardHeader>
              <CardTitle className="text-base font-bold text-primary">{t(INVITATION_CONSTANTS.FORM.FORM_STATUS)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{t(INVITATION_CONSTANTS.FORM.FORM_MODIFIED)}</span>
                <span className={isDirty ? "text-amber-500 font-bold" : "text-emerald-500 font-bold"}>
                  {isDirty ? "YES" : "NO"}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed italic border-t border-border/10 pt-4">
                {t(INVITATION_CONSTANTS.FORM.FORM_WARNING) || 'Ensure the recipient email and dates are correct. The invitation link will be active within the specified range.'}
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-6 pb-8 px-6">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 h-12 font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (id ? <Save className="mr-2 h-5 w-5" /> : <Send className="mr-2 h-5 w-5" />)}
                {id ? t(INVITATION_CONSTANTS.FORM.SUBMIT) : 'Send Invitation'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all h-12 font-bold"
                onClick={handleCancel}
              >
                <X className="mr-2 h-5 w-5" />
                {t(INVITATION_CONSTANTS.FORM.CANCEL)}
              </Button>
            </CardFooter>
          </Card>

          <div className="p-4 bg-muted/20 rounded-xl border border-border/10">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-full text-primary mt-1">
                <Info size={16} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider">Invitation Tips</p>
                <p className="text-[10px] text-muted-foreground">The Redirect URL is where the user will be sent after accepting the invitation.</p>
              </div>
            </div>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={showConfirmCancel}
        onOpenChange={setShowConfirmCancel}
        title={t(INVITATION_CONSTANTS.FORM.CONFIRM_CANCEL)}
        description={t(INVITATION_CONSTANTS.FORM.DIRTY_WARNING)}
        confirmText={t(INVITATION_CONSTANTS.FORM.YES_DISCARD)}
        cancelText={t(INVITATION_CONSTANTS.FORM.NO_STAY)}
        onConfirm={confirmCancel}
        type="warning"
      />
    </div>
  );
}

// Helper function for cn
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
