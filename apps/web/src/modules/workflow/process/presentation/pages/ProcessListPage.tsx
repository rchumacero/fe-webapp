"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from '@kplian/i18n';
import { PROCESS_CONSTANTS } from '../../constants/process-constants';
import { PROCESS_ROUTES } from '../../routes/process-routes';
import { FORM_ROUTES } from '@/modules/workflow/forms/routes/form-routes';
import { Process } from '../../domain/Process';
import { ProcessRepositoryImpl } from '../../infrastructure/ProcessRepositoryImpl';
import { formatDate, formatDateTime, DEFAULT_PAGE_SIZE } from '@kplian/core';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RefreshCw, Plus, Search, Edit2, Trash2, MoreHorizontal, Loader2, Clipboard, Layers, User, FileText } from 'lucide-react';
import Link from 'next/link';
import { useVendor } from '@/hooks/use-vendor';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

const processRepository = new ProcessRepositoryImpl();

export default function ProcessListPage() {
  const { t } = useTranslation();
  const { vendor } = useVendor();

  const [processes, setProcesses] = useState<Process[]>([]);
  const [filteredProcesses, setFilteredProcesses] = useState<Process[]>([]);
  const [page, setPage] = useState(1);
  const [displayedProcesses, setDisplayedProcesses] = useState<Process[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Deletion state
  const [deleteTarget, setDeleteTarget] = useState<Process | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Fetch all processes from repository
  const fetchAllProcesses = useCallback(async (isRefresh: boolean = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setIsLoading(true);

    try {
      const data = await processRepository.getAll();
      const sortedData = Array.isArray(data)
        ? [...data].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA; // Newest first
        })
        : [];

      setProcesses(sortedData);

      // Reset to page 1 on refresh
      if (isRefresh) {
        setPage(1);
      }
    } catch (error) {
      console.error("Error fetching processes:", error);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAllProcesses();
  }, [fetchAllProcesses]);

  // Client-side filtering and search
  useEffect(() => {
    const term = search.toLowerCase().trim();
    if (!term) {
      setFilteredProcesses(processes);
      return;
    }

    const filtered = processes.filter(p => {
      const name = (p.name || '').toLowerCase();
      const code = (p.code || '').toLowerCase();
      const moduleCode = (p.moduleCode || '').toLowerCase();
      const vendorCode = (p.vendorCode || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();

      return name.includes(term) ||
        code.includes(term) ||
        moduleCode.includes(term) ||
        vendorCode.includes(term) ||
        desc.includes(term);
    });

    setFilteredProcesses(filtered);
    setPage(1); // Reset page on search filter change
  }, [search, processes]);

  // Client-side pagination (Infinite Scroll simulation)
  useEffect(() => {
    const startIndex = 0;
    const endIndex = page * DEFAULT_PAGE_SIZE;
    const paginated = filteredProcesses.slice(startIndex, endIndex);

    setDisplayedProcesses(paginated);
    setHasMore(endIndex < filteredProcesses.length);
  }, [page, filteredProcesses]);

  const handleRefresh = () => {
    fetchAllProcesses(true);
  };

  const handleDeleteClick = (process: Process) => {
    setDeleteTarget(process);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await processRepository.delete(deleteTarget.id);
      // Remove from state
      setProcesses(prev => prev.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting process:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Sticky Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-background/85 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10 mb-2 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t(PROCESS_CONSTANTS.LIST_TITLE) || 'Workflow Processes'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(PROCESS_CONSTANTS.FORM_SUBTITLE) || 'Create, update, and manage processes'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="rounded-full hover:bg-accent hover:rotate-180 transition-all duration-500"
            disabled={isLoading}
          >
            <RefreshCw className={isLoading ? "animate-spin size-5" : "size-5"} />
          </Button>
          <Link href={PROCESS_ROUTES.CREATE()}>
            <Button size="icon" className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-md group">
              <Plus className="size-5 group-hover:scale-110 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('common.filter') || 'Search processes...'}
          className="pl-9 h-11 bg-card/50 border-border/40 focus:ring-primary/20 transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Processes Grid Layout */}
      {displayedProcesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProcesses.map((process, index) => (
            <Card
              key={process.id}
              ref={index === displayedProcesses.length - 1 ? lastElementRef : null}
              className="group border-border/40 bg-card hover:bg-accent/5 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-primary/5 flex flex-col justify-between"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="space-y-1.5 overflow-hidden flex-1 mr-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                    <FileText size={13} className="shrink-0" />
                    <span>{process.code}</span>
                  </div>
                  <CardTitle title={process.name} className="text-base font-bold group-hover:text-primary transition-colors truncate max-w-full block">
                    {process.name}
                  </CardTitle>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 bg-muted/30">
                      Module: {process.moduleCode}
                    </Badge>
                    <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 bg-muted/30">
                      Vendor: {process.vendorCode}
                    </Badge>
                  </div>
                </div>

                {/* Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent/80 transition-all outline-none">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem className="cursor-pointer">
                      <Link href={FORM_ROUTES.LIST(process.id)} className="flex items-center w-full">
                        <Layers className="mr-2 h-4 w-4" /> {t(PROCESS_CONSTANTS.VIEW_FORMS)}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Link href={PROCESS_ROUTES.EDIT(process.id)} className="flex items-center w-full">
                        <Edit2 className="mr-2 h-4 w-4" /> {t(PROCESS_CONSTANTS.EDIT)}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive cursor-pointer focus:bg-destructive/10"
                      onClick={() => handleDeleteClick(process)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> {t(PROCESS_CONSTANTS.DELETE) || 'Delete'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent className="pt-0 pb-4 flex-1">
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {process.description || t('workflow.form.no_description') || 'No description provided.'}
                </p>
              </CardContent>

              <CardFooter className="py-3 border-t border-border/5 flex flex-col items-start gap-2 bg-muted/10">
                <div className="w-full flex justify-between items-center text-[9px] text-muted-foreground/50 font-medium">
                  <span className="flex items-center gap-1">
                    Created: {process.createdAt ? formatDate(process.createdAt) : 'N/A'}
                  </span>
                  <div className="flex items-center gap-1 max-w-[120px] truncate">
                    <User size={10} className="text-muted-foreground/60 shrink-0" />
                    <span className="truncate">{process.createdBy || 'System'}</span>
                  </div>
                </div>
                <div className="w-full flex justify-between items-center mt-0.5">
                  <Badge
                    variant={process.status === 'ACTIVE' ? 'default' : 'secondary'}
                    className="text-[9px] py-0 h-4 uppercase font-semibold"
                  >
                    {process.status}
                  </Badge>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-border/40 rounded-xl bg-card/20 text-center animate-in fade-in duration-700">
            <Clipboard className="h-12 w-12 text-muted-foreground/40 mb-4 stroke-[1.5]" />
            <h3 className="text-lg font-bold text-foreground">{t('common.recordNotFound') || 'No processes found'}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {t(PROCESS_CONSTANTS.EMPTY_LIST) || 'Try adjusting your search criteria, refreshing the list, or create a brand new process.'}
            </p>
            <Link href={PROCESS_ROUTES.CREATE()} className="mt-5">
              <Button className="bg-primary hover:bg-primary/95 text-white font-semibold">
                <Plus className="mr-2 h-4 w-4" /> {t('common.addRecord') || 'Add Process'}
              </Button>
            </Link>
          </div>
        )
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* End of list message */}
      {!hasMore && displayedProcesses.length > 0 && (
        <p className="text-center text-muted-foreground text-xs py-10 border-t border-border/5 uppercase tracking-wider font-semibold">
          {t('common.endOfRecords') || 'End of processes list'}
        </p>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={`${t('common.deleteRecord') || 'Delete Process'}`}
        description={`${t('common.confirmationDeleteDescription') || 'This will permanently delete the process'} "${deleteTarget?.name}" (${deleteTarget?.code}).`}
        confirmText={t('common.confirm') || 'Delete'}
        cancelText={t('common.cancel') || 'Cancel'}
        onConfirm={confirmDelete}
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
