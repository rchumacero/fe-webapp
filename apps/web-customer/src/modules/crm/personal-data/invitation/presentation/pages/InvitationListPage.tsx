"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from '@kplian/i18n';
import { INVITATION_CONSTANTS } from '../../constants/invitation-constants';
import { INVITATION_ROUTES } from '../../routes/invitation-routes';
import { Invitation } from '../../domain/entities/Invitation';
import { InvitationRepositoryImpl } from '../../infrastructure/repositories/InvitationRepositoryImpl';
import { formatDate, formatDateTime, DEFAULT_PAGE_SIZE } from '@kplian/core';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  RefreshCw,
  Plus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Calendar,
  Link as LinkIcon,
  MoreHorizontal,
  Loader2,
  Eye,
  User,
  Paperclip,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { useVendor } from '@/hooks/use-vendor';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const invitationRepository = new InvitationRepositoryImpl();

export default function InvitationListPage() {
  const { t } = useTranslation();
  const { vendor } = useVendor();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const isFetching = useRef(false);

  const fetchInvitations = useCallback(async (pageNum: number, isNewSearch: boolean = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setIsLoading(true);

    if (!vendor) {
      setIsLoading(false);
      isFetching.current = false;
      return;
    }

    try {
      const newData = await invitationRepository.getAllByPersonId(vendor, {
        page: pageNum,
        pageSize: DEFAULT_PAGE_SIZE,
        filter: search,
      });

      const dataArray = Array.isArray(newData) ? newData : [];

      setInvitations(prev => isNewSearch ? dataArray : [...prev, ...dataArray]);
      setHasMore(dataArray.length === DEFAULT_PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, [search, vendor]);

  useEffect(() => {
    if (vendor) {
      fetchInvitations(page, page === 1);
    }
  }, [page, fetchInvitations, vendor]);

  const handleRefresh = () => {
    if (page === 1) {
      fetchInvitations(1, true);
    } else {
      setPage(1);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t(INVITATION_CONSTANTS.CONFIRM_DELETE) || 'Are you sure you want to delete this record?')) return;
    try {
      await invitationRepository.delete(id);
      handleRefresh();
    } catch (error) {
      console.error("Error deleting invitation:", error);
    }
  };

  const handleCopyUrl = (invitation: Invitation) => {
    if (!invitation.id) {
      toast.error('Invitation ID missing');
      return;
    }
    const finalUrl = `${window.location.origin}/?invitationId=${invitation.id}`;
    navigator.clipboard.writeText(finalUrl);
    toast.success('URL copied to clipboard');
  };

  const filteredInvitations = invitations.filter(inv => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      inv.to.toLowerCase().includes(term) ||
      inv.subjectNotify.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10 mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t(INVITATION_CONSTANTS.LIST_TITLE)}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="rounded-full hover:bg-accent hover:rotate-180 transition-all duration-500"
          >
            <RefreshCw className={isLoading ? "animate-spin size-5" : "size-5"} />
          </Button>
          <Link href={INVITATION_ROUTES.CREATE(vendor || '')}>
            <Button
              size="icon"
              className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-md group"
            >
              <Plus className="size-5 group-hover:scale-110 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t(INVITATION_CONSTANTS.SEARCH_PLACEHOLDER)}
          className="pl-9 h-11 bg-card/50 border-border/40 focus:ring-primary/20 transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInvitations.map((inv, index) => (
          <Card
            key={`${inv.id}-${index}`}
            ref={index === invitations.length - 1 ? lastElementRef : null}
            className="group border-border/40 bg-card hover:bg-accent/5 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-primary/5"
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1 overflow-hidden flex-1 mr-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{inv.to}</p>
                <CardTitle title={inv.subjectNotify} className="text-lg font-bold group-hover:text-primary transition-colors truncate max-w-full block">
                  {inv.subjectNotify}
                </CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent transition-all outline-none group-data-[state=open]:bg-accent">
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleCopyUrl(inv)}>
                    <Paperclip className="mr-2 h-4 w-4" /> {t('common.copyUrl') || 'Copy URL'}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href={INVITATION_ROUTES.DETAIL(inv.id!, vendor || '')} className="flex items-center w-full">
                      <Eye className="mr-2 h-4 w-4" /> {t(INVITATION_CONSTANTS.VIEW_DETAIL) || 'Detail'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href={INVITATION_ROUTES.EDIT(inv.id!, vendor || '')} className="flex items-center w-full">
                      <Edit2 className="mr-2 h-4 w-4" /> {t(INVITATION_CONSTANTS.EDIT_RECORD) || 'Edit'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive cursor-pointer focus:bg-destructive/10"
                    onClick={() => inv.id && handleDelete(inv.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> {t(INVITATION_CONSTANTS.CONFIRM_DELETE) || 'Delete'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 pb-4 flex justify-between items-start gap-3">
              <div className="flex-1">
                <div className="flex flex-col gap-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail size={14} className="text-primary/60" />
                    <span className="truncate">{inv.to}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar size={14} className="text-primary/60" />
                    <span>{formatDate(inv.fromDate)} - {formatDate(inv.toDate)}</span>
                  </div>
                </div>
              </div>
              <div className="h-14 w-14 rounded-xl bg-accent/20 flex items-center justify-center shrink-0 border border-border/10 shadow-inner group-hover:bg-accent/40 transition-colors">
                <Mail size={32} className="text-muted-foreground/30" />
              </div>
            </CardContent>
            <CardFooter className="py-2 border-t border-border/5 flex flex-col items-start gap-2 h-auto mt-0">
              <div className="w-full flex justify-between items-center">
                <Badge variant="secondary" className="bg-accent/50 text-[10px] uppercase font-bold px-2 py-0">
                  {inv.profiles || 'NO PROFILES'}
                </Badge>
                {inv.url && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full hover:bg-primary/20 hover:text-primary transition-colors"
                    onClick={() => handleCopyUrl(inv)}
                    title="Copy Invitation URL"
                  >
                    <Paperclip size={12} />
                  </Button>
                )}
              </div>
              <div className="w-full flex justify-between items-center text-[9px] text-muted-foreground/40 uppercase tracking-widest font-medium">
                <span className="flex items-center gap-1">
                  Created: {formatDateTime(inv.createdAt)}
                </span>
                <span className="truncate max-w-[100px]">By: {inv.createdBy || 'System'}</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!hasMore && invitations.length > 0 && (
        <p className="text-center text-muted-foreground text-sm py-8 border-t border-border/5">
          {t(INVITATION_CONSTANTS.END_OF_RECORDS) || 'End of records'}
        </p>
      )}

      {invitations.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
          <div className="p-4 bg-muted/20 rounded-full">
            <Mail size={40} className="text-muted-foreground/40" />
          </div>
          <div>
            <h3 className="text-lg font-bold">No invitations found</h3>
            <p className="text-muted-foreground">Create your first invitation to start tracking.</p>
          </div>
          <Link href={INVITATION_ROUTES.CREATE(vendor || '')}>
            <Button className="rounded-full px-6">
              <Plus className="mr-2 size-4" />
              Create Invitation
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
