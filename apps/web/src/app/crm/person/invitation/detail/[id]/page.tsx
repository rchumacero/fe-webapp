"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from "next/navigation";
import { useTranslation } from '@kplian/i18n';
import { INVITATION_CONSTANTS } from '@/modules/crm/personal-data/invitation/constants/invitation-constants';
import { INVITATION_ROUTES } from '@/modules/crm/personal-data/invitation/routes/invitation-routes';
import { InvitationRepositoryImpl } from '@/modules/crm/personal-data/invitation/infrastructure/repositories/InvitationRepositoryImpl';
import { Invitation } from '@/modules/crm/personal-data/invitation/domain/entities/Invitation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Edit2, Mail, Calendar, Link as LinkIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@kplian/core';

const repository = new InvitationRepositoryImpl();

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const id = params.id as string;
  const personId = searchParams.get('personId') || '';
  
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      repository.getById(id)
        .then(setInvitation)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!invitation) return <div>Not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8">
      <div className="flex items-center justify-between">
        <Link href={INVITATION_ROUTES.LIST}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft size={16} />
            {t('common.back')}
          </Button>
        </Link>
        <Link href={INVITATION_ROUTES.EDIT(id, personId)}>
          <Button className="gap-2">
            <Edit2 size={16} />
            {t(INVITATION_CONSTANTS.EDIT_RECORD)}
          </Button>
        </Link>
      </div>

      <Card className="border-border/40 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardHeader className="bg-primary/5 border-b border-border/10">
          <CardTitle className="flex items-center gap-3">
            <Mail className="text-primary" />
            {invitation.subjectNotify}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recipient</p>
              <p className="font-bold">{invitation.to}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Validity</p>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-primary/60" />
                <span>{formatDate(invitation.fromDate)} - {formatDate(invitation.toDate)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Redirect URL</p>
            <div className="flex items-center gap-2 text-sm text-primary">
              <LinkIcon size={14} />
              <a href={invitation.url} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">
                {invitation.url}
              </a>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Message Body</p>
            <div className="p-4 bg-muted/30 rounded-lg text-sm whitespace-pre-wrap leading-relaxed">
              {invitation.bodyNotify}
            </div>
          </div>

          {invitation.profiles && (
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Profiles</p>
              <p className="text-sm">{invitation.profiles}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
