"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from '@kplian/i18n';
import { CASE_CONSTANTS } from '../../constants/case-constants';
import { CASE_ROUTES } from '../../routes/case-routes';
import { Case } from '../../domain/Case';
import { Task } from '../../domain/Task';
import { CaseRepositoryImpl } from '../../infrastructure/CaseRepositoryImpl';
import { TaskRepositoryImpl } from '../../infrastructure/TaskRepositoryImpl';
import { formatDate } from '@kplian/core';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  RefreshCw, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MoreHorizontal, 
  Loader2, 
  Inbox, 
  Briefcase, 
  User, 
  Layers, 
  Tag, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  ClipboardList, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useVendor } from '@/hooks/use-vendor';

const caseRepository = new CaseRepositoryImpl();
const taskRepository = new TaskRepositoryImpl();

export default function CaseListPage() {
  const { t } = useTranslation();
  const { vendor } = useVendor();
  const userVendor = vendor || '';

  const [cases, setCases] = useState<Case[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Case Deletion state
  const [deleteTarget, setDeleteTarget] = useState<Case | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isFetching = useRef(false);

  const fetchData = useCallback(async (isRefresh: boolean = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setIsLoading(true);

    try {
      const [casesData, tasksData] = await Promise.all([
        caseRepository.getAll(),
        taskRepository.getAll()
      ]);

      const sortedCases = Array.isArray(casesData) ? casesData : [];
      const sortedTasks = Array.isArray(tasksData)
        ? [...tasksData].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA; // Newest first
          })
        : [];

      setCases(sortedCases);
      setTasks(sortedTasks);
    } catch (error) {
      console.error("Error fetching inbox data:", error);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Find corresponding case for a task
  const getTaskCase = useCallback((task: Task): Case | undefined => {
    return cases.find(c => c.id === task.caseId);
  }, [cases]);

  // Determine if a task is completed/annulled
  const isTaskDone = useCallback((task: Task): boolean => {
    const status = (task.status || '').toUpperCase();
    return ['COMPLETED', 'FINISHED', 'DONE', 'CANCELLED', 'ANULATED', 'ANNULLED', 'INACTIVE'].includes(status);
  }, []);

  // Search filtering
  useEffect(() => {
    const term = search.toLowerCase().trim();
    if (!term) {
      setFilteredTasks(tasks);
      return;
    }

    const filtered = tasks.filter(task => {
      const linkedCase = getTaskCase(task);
      
      const taskCode = (task.taskCode || '').toLowerCase();
      const collCode = (task.collaboratorCode || '').toLowerCase();
      const taskNotes = (task.notes || '').toLowerCase();
      const taskStatus = (task.status || '').toLowerCase();

      const caseProcess = linkedCase ? (linkedCase.processCode || '').toLowerCase() : '';
      const caseEntity = linkedCase ? (linkedCase.entity || '').toLowerCase() : '';
      const caseEntityId = linkedCase ? (linkedCase.entityId || '').toLowerCase() : '';
      const caseVendor = linkedCase ? (linkedCase.vendorCode || '').toLowerCase() : '';

      return taskCode.includes(term) ||
             collCode.includes(term) ||
             taskNotes.includes(term) ||
             taskStatus.includes(term) ||
             caseProcess.includes(term) ||
             caseEntity.includes(term) ||
             caseEntityId.includes(term) ||
             caseVendor.includes(term);
    });

    setFilteredTasks(filtered);
  }, [search, tasks, getTaskCase]);

  // Classify filtered tasks into Todo, In Progress, and Done columns
  const todoTasks = filteredTasks.filter(t => {
    // 1. Assigned to me, and not finished/annulled
    return t.collaboratorCode === userVendor && !isTaskDone(t);
  });

  const inProgressTasks = filteredTasks.filter(t => {
    // 2. Related to me (Case belongs to my vendorCode), but assigned to another collaborator, and not finished/annulled
    const linkedCase = getTaskCase(t);
    const isRelatedCase = linkedCase?.vendorCode === userVendor;
    return isRelatedCase && t.collaboratorCode !== userVendor && !isTaskDone(t);
  });

  const doneTasks = filteredTasks.filter(t => {
    // 3. Related to me (either assigned to me OR linked to my cases) and is completed/annulled
    const linkedCase = getTaskCase(t);
    const isRelatedCase = linkedCase?.vendorCode === userVendor;
    const isAssignedToMe = t.collaboratorCode === userVendor;
    return (isAssignedToMe || isRelatedCase) && isTaskDone(t);
  });

  const handleRefresh = () => {
    fetchData(true);
  };

  const handleDeleteCaseClick = (caseItem: Case) => {
    setDeleteTarget(caseItem);
  };

  const confirmDeleteCase = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await caseRepository.delete(deleteTarget.id);
      setCases(prev => prev.filter(c => c.id !== deleteTarget.id));
      setTasks(prev => prev.filter(t => t.caseId !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting case:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Get status color styling for badge
  const getStatusBadge = (statusStr: string) => {
    const s = statusStr.toUpperCase();
    if (['COMPLETED', 'FINISHED', 'DONE'].includes(s)) {
      return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] py-0 px-2 h-5 font-bold uppercase">{statusStr}</Badge>;
    }
    if (['CANCELLED', 'ANULATED', 'ANNULLED', 'INACTIVE'].includes(s)) {
      return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[10px] py-0 px-2 h-5 font-bold uppercase">{statusStr}</Badge>;
    }
    return <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] py-0 px-2 h-5 font-bold uppercase">{statusStr}</Badge>;
  };

  // Render a Kanban column
  const renderColumn = (title: string, count: number, tasksList: Task[], icon: React.ReactNode, themeClass: string) => {
    return (
      <div className="flex flex-col bg-card/40 border border-border/30 rounded-xl overflow-hidden shadow-sm h-[640px] w-full">
        {/* Column Header */}
        <div className={`p-4 border-b border-border/40 flex justify-between items-center ${themeClass}`}>
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-extrabold text-sm uppercase tracking-wider">{title}</span>
          </div>
          <Badge variant="secondary" className="font-bold text-xs bg-background/80 shadow-sm border px-2 py-0.5 rounded-full shrink-0">
            {count}
          </Badge>
        </div>

        {/* Column Body / Scroll Workspace */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 scrollbar-thin select-none">
          {tasksList.length > 0 ? (
            tasksList.map(task => {
              const linkedCase = getTaskCase(task);
              return (
                <Card 
                  key={task.id}
                  className="group border-border/40 bg-card hover:bg-accent/5 hover:border-primary/30 transition-all duration-300 shadow-md hover:shadow-primary/5 cursor-pointer relative"
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-2">
                    <div className="space-y-1.5 overflow-hidden flex-1 mr-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                        <Tag size={11} className="shrink-0" />
                        <span>{task.taskCode}</span>
                      </div>
                      <CardTitle className="text-sm font-bold group-hover:text-primary transition-colors truncate block">
                        {linkedCase ? `Case: ${linkedCase.entity}` : 'Case (Not Found)'}
                      </CardTitle>
                    </div>

                    {/* Actions Dropdown for Parent Case */}
                    {linkedCase && (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent/80 transition-all outline-none">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem className="cursor-pointer">
                            <Link href={CASE_ROUTES.EDIT(linkedCase.id)} className="flex items-center w-full">
                              <Edit2 className="mr-2 h-4 w-4" /> {t('common.edit') || 'Edit Case'}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive cursor-pointer focus:bg-destructive/10"
                            onClick={() => handleDeleteCaseClick(linkedCase)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> {t('common.delete') || 'Delete Case'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </CardHeader>

                  <CardContent className="p-4 pt-0 pb-3 space-y-3">
                    {/* Case and Process Details */}
                    {linkedCase && (
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 bg-muted/40 font-mono">
                          Process: {linkedCase.processCode}
                        </Badge>
                        <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 bg-muted/40 font-mono">
                          ID: {linkedCase.entityId}
                        </Badge>
                      </div>
                    )}

                    {/* Task Notes */}
                    {task.notes && (
                      <div className="text-[11px] text-muted-foreground/90 bg-muted/20 p-2 rounded border border-border/10 flex gap-1.5 items-start">
                        <FileText size={12} className="text-muted-foreground/60 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed" title={task.notes}>
                          {task.notes}
                        </span>
                      </div>
                    )}

                    {/* Responsibility Indicator */}
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/75 font-semibold">
                      <User size={11} className="shrink-0 text-muted-foreground/60" />
                      <span>Responsibility:</span>
                      {task.collaboratorCode === userVendor ? (
                        <Badge variant="default" className="text-[9px] py-0 h-4 bg-primary/20 text-primary border-0 font-bold">Me</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] py-0 h-4 font-mono font-medium">{task.collaboratorCode || 'System'}</Badge>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="p-3 pt-0 border-t border-border/5 flex items-center justify-between bg-muted/5 rounded-b-xl mt-1">
                    <span className="flex items-center gap-1 text-[9px] text-muted-foreground/60 font-medium">
                      <Calendar size={10} className="shrink-0" />
                      {task.taskDate ? formatDate(task.taskDate) : 'N/A'}
                    </span>
                    {getStatusBadge(task.status)}
                  </CardFooter>
                </Card>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/20 rounded-xl bg-card/10 text-center min-h-[300px]">
              <Inbox className="h-9 w-9 text-muted-foreground/30 mb-2 stroke-[1.25]" />
              <h4 className="text-xs font-bold text-muted-foreground">{t('common.recordNotFound') || 'No tasks in this state'}</h4>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-background/85 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10 mb-2 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t(CASE_CONSTANTS.LIST_TITLE) || 'Workflow Inbox'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor and coordinate workflow tasks divided by assignment responsibility and execution status.
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
          <Link href={CASE_ROUTES.CREATE()}>
            <Button size="icon" className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-md group">
              <Plus className="size-5 group-hover:scale-110 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Live Search bar */}
      <div className="relative max-w-md mx-auto mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter by tasks, process codes, entities, collaborators..."
          className="pl-9 h-11 bg-card/50 border-border/40 focus:ring-primary/20 transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Kanban Board Grid */}
      {!isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderColumn(
            "Todo",
            todoTasks.length,
            todoTasks,
            <ClipboardList className="h-4 w-4 text-sky-500" />,
            "bg-sky-500/5 text-sky-700 dark:text-sky-400 border-sky-500/10"
          )}
          {renderColumn(
            "In Progress",
            inProgressTasks.length,
            inProgressTasks,
            <Layers className="h-4 w-4 text-amber-500" />,
            "bg-amber-500/5 text-amber-700 dark:text-amber-400 border-amber-500/10"
          )}
          {renderColumn(
            "Done",
            doneTasks.length,
            doneTasks,
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
            "bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 border-emerald-500/10"
          )}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center p-24 gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider animate-pulse">Loading Inbox Kanban Board...</span>
        </div>
      )}

      {/* Delete Parent Case Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Case and Tasks"
        description={`This will permanently delete Case "${deleteTarget?.entity}" (Process: ${deleteTarget?.processCode}) along with all its active workflow tasks.`}
        confirmText={t('common.confirm') || 'Delete'}
        cancelText={t('common.cancel') || 'Cancel'}
        onConfirm={confirmDeleteCase}
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
