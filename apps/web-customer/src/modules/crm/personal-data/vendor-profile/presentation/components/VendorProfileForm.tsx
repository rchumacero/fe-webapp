"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from '@kplian/i18n';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Globe, Palette, Monitor } from 'lucide-react';
import { VENDOR_PROFILE_CONSTANTS } from '../../constants/vendor-profile-constants';
import { VendorProfileRepositoryImpl } from '../../infrastructure/repositories/VendorProfileRepositoryImpl';
import { VendorProfile } from '../../domain/entities/VendorProfile';
import { useVendor } from '@/hooks/use-vendor';
import { toast } from '@/hooks/use-toast';

const profileSchema = z.object({
  logo: z.string().optional(),
  description: z.string().optional(),
  timezone: z.string().min(1, "Required"),
  language: z.string().min(1, "Required"),
  theme: z.string().min(1, "Required"),
  primaryColour: z.string().optional(),
  secondaryColour: z.string().optional(),
  tertiaryColour: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const repository = new VendorProfileRepositoryImpl();

export const VendorProfileForm = () => {
  const { t } = useTranslation();
  const { vendor } = useVendor();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      timezone: 'UTC',
      language: 'en',
      theme: 'dark',
      description: '',
      url: '',
    }
  });

  useEffect(() => {
    if (vendor) {
      repository.getByPersonId(vendor).then(data => {
        if (data) {
          setProfileId(data.id || null);
          form.reset({
            logo: data.logo || '',
            description: data.description || '',
            timezone: data.timezone,
            language: data.language,
            theme: data.theme,
            primaryColour: data.primaryColour || '',
            secondaryColour: data.secondaryColour || '',
            tertiaryColour: data.tertiaryColour || '',
            url: data.url || '',
          });
        }
        setIsLoading(false);
      }).catch(() => setIsLoading(false));
    }
  }, [vendor, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!vendor) return;
    setIsSaving(true);
    try {
      if (profileId) {
        await repository.update(profileId, values);
      } else {
        await repository.save({ ...values, personId: vendor } as VendorProfile);
      }
      toast.success(t(VENDOR_PROFILE_CONSTANTS.FORM.SUCCESS));
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary size-8" />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Basic Info & Branding */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Monitor className="text-primary size-5" />
                </div>
                <CardTitle>{t(VENDOR_PROFILE_CONSTANTS.TITLE)}</CardTitle>
              </div>
              <CardDescription>{t(VENDOR_PROFILE_CONSTANTS.DESCRIPTION)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    {t(VENDOR_PROFILE_CONSTANTS.FORM.URL)}
                  </label>
                  <Input {...form.register('url')} placeholder="https://example.com" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    {t(VENDOR_PROFILE_CONSTANTS.FORM.LOGO)}
                  </label>
                  <Input {...form.register('logo')} placeholder="Logo URL" className="bg-background/50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {t(VENDOR_PROFILE_CONSTANTS.FORM.DESCRIPTION)}
                </label>
                <Textarea {...form.register('description')} className="min-h-[120px] bg-background/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Palette className="text-primary size-5" />
                </div>
                <CardTitle>Branding & Colors</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Primary</label>
                <div className="flex gap-2">
                  <Input {...form.register('primaryColour')} type="color" className="w-12 h-10 p-1 bg-transparent border-none" />
                  <Input {...form.register('primaryColour')} className="bg-background/50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Secondary</label>
                <div className="flex gap-2">
                  <Input {...form.register('secondaryColour')} type="color" className="w-12 h-10 p-1 bg-transparent border-none" />
                  <Input {...form.register('secondaryColour')} className="bg-background/50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Tertiary</label>
                <div className="flex gap-2">
                  <Input {...form.register('tertiaryColour')} type="color" className="w-12 h-10 p-1 bg-transparent border-none" />
                  <Input {...form.register('tertiaryColour')} className="bg-background/50" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration */}
        <div className="space-y-6">
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Globe className="text-primary size-5" />
                </div>
                <CardTitle>Regional & Preferences</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {t(VENDOR_PROFILE_CONSTANTS.FORM.TIMEZONE)}
                </label>
                <Input {...form.register('timezone')} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {t(VENDOR_PROFILE_CONSTANTS.FORM.LANGUAGE)}
                </label>
                <Input {...form.register('language')} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {t(VENDOR_PROFILE_CONSTANTS.FORM.THEME)}
                </label>
                <Input {...form.register('theme')} className="bg-background/50" />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={isSaving} className="w-full h-14 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 group">
            {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 group-hover:scale-110 transition-transform" />}
            {t(VENDOR_PROFILE_CONSTANTS.FORM.SUBMIT)}
          </Button>
        </div>
      </div>
    </form>
  );
};
