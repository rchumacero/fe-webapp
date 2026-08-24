"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from '@kplian/i18n';
import { TASK_CONSTANTS } from '../../constants/task-constants';
import { TASK_ROUTES } from '../../routes/task-routes';
import { CASE_ROUTES } from '../../../inbox/routes/case-routes';
import { Case } from '../../../inbox/domain/Case';
import { Task } from '../../domain/Task';
import { CaseRepositoryImpl } from '../../../inbox/infrastructure/CaseRepositoryImpl';
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
  User,
  Layers,
  Tag,
  Calendar,
  FileText,
  CheckCircle2,
  ClipboardList,
  HelpCircle,
  Clock,
  UserCheck,
  CircleDot,
  UserPlus,
  HandGrab
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
import { useSession } from 'next-auth/react';
import DynamicForm from '@/presentation/components/DynamicForm/DynamicForm';
import { FORM_SCHEMAS } from '@/presentation/components/DynamicForm/FormSchemas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const caseRepository = new CaseRepositoryImpl();
const taskRepository = new TaskRepositoryImpl();

export default function TaskListPage() {
  const { t } = useTranslation();
  const { vendor } = useVendor();
  const { data: session } = useSession();
  const userVendor = vendor || '';

  const [cases, setCases] = useState<Case[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Task Deletion state
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Dynamic Form modal state
  const [dynamicFormTask, setDynamicFormTask] = useState<Task | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

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
      console.error("Error fetching tasks inbox data:", error);
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

  // Task Categorization States
  // Task Categorization States
  const isTaskDone = useCallback((task: Task): boolean => {
    const status = (task.status || '').toUpperCase();
    return ['COMPLETED', 'FINISHED', 'DONE', 'CANCELLED', 'ANULATED', 'ANNULLED', 'INACTIVE'].includes(status);
  }, []);

  const isTaskInProgress = useCallback((task: Task): boolean => {
    const status = (task.status || '').toUpperCase();
    if (isTaskDone(task)) return false;
    // An active task that has an assignee but is not the current user is in-progress/claimed by someone else
    return ['IN_PROGRESS', 'PROGRESS', 'RUNNING'].includes(status) || 
           (task.collaboratorCode !== null && task.collaboratorCode !== undefined && task.collaboratorCode !== '' && task.collaboratorCode !== userVendor);
  }, [isTaskDone, userVendor]);

  const isTaskAssignedToYou = useCallback((task: Task): boolean => {
    if (isTaskDone(task)) return false;
    return task.collaboratorCode === userVendor;
  }, [isTaskDone, userVendor]);

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

  // Classification logic into columns
  const doneTasks = filteredTasks.filter(isTaskDone);
  const assignedTasks = filteredTasks.filter(isTaskAssignedToYou);
  const inProgressTasks = filteredTasks.filter(t => !isTaskDone(t) && isTaskInProgress(t));
  const pendingTasks = filteredTasks.filter(t => {
    return !isTaskDone(t) && !isTaskAssignedToYou(t) && !isTaskInProgress(t);
  });

  const handleRefresh = () => {
    fetchData(true);
  };

  const handleDeleteClick = (task: Task) => {
    setDeleteTarget(task);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await taskRepository.delete(deleteTarget.id);
      setTasks(prev => prev.filter(t => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClaimTask = async (task: Task) => {
    if (!task.taskInstanceId) {
      console.error("Task does not have an instance ID");
      return;
    }
    
    // User wants to send user name/email instead of UUID (e.g. rodrychm@gmail.com)
    const userId = session?.user?.email || session?.user?.name || userVendor || 'demo';
    
    setIsLoading(true);
    try {
      await taskRepository.claimTask(task.taskInstanceId, userId);
      // Refresh the list after claiming
      handleRefresh();
    } catch (error) {
      console.error("Error claiming task:", error);
      setIsLoading(false); // handleRefresh turns it off normally, but on error we must
    }
  };

  const handleFinishTask = async (task: Task) => {
    if (!task.taskInstanceId) {
      console.error("Task does not have an instance ID");
      return;
    }
    
    
    setIsLoading(true);
    try {
      await taskRepository.completeTask(task.taskInstanceId);
      // Refresh the list after completing
      handleRefresh();
    } catch (error) {
      console.error("Error finishing task:", error);
      setIsLoading(false); // handleRefresh turns it off normally, but on error we must
    }
  };

  const handleDynamicFormSubmit = async (formData: any) => {
    if (!dynamicFormTask || !dynamicFormTask.taskInstanceId) return;
    setIsSubmittingForm(true);
    try {
      // Map form output values to completeTask Camunda DTO variables structure
      const formattedVariables: Record<string, { value: any; type: string }> = {};
      Object.keys(formData).forEach(key => {
        const val = formData[key];
        formattedVariables[key] = {
          value: val,
          type: typeof val === 'number' ? 'Integer' : 'String'
        };
      });

      await taskRepository.completeTask(dynamicFormTask.taskInstanceId, {
        variables: formattedVariables
      });

      setDynamicFormTask(null);
      handleRefresh();
    } catch (error) {
      console.error("Error completing task with dynamic form variables:", error);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Get status badge styling
  const getStatusIconColor = (statusStr: string) => {
    const s = (statusStr || '').toUpperCase();
    if (['COMPLETED', 'FINISHED', 'DONE'].includes(s)) return 'text-emerald-600';
    if (['CANCELLED', 'ANULATED', 'ANNULLED', 'INACTIVE'].includes(s)) return 'text-rose-600';
    if (['IN_PROGRESS', 'PROGRESS', 'RUNNING'].includes(s)) return 'text-amber-600';
    return 'text-primary';
  };

  // Render a Kanban column
  const renderColumn = (title: string, count: number, tasksList: Task[], icon: React.ReactNode, themeClass: string, actionType?: 'claim' | 'finish') => {
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

        {/* Column Body / scrollable area */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 scrollbar-thin select-none">
          {tasksList.length > 0 ? (
            tasksList.map(task => {
              const linkedCase = getTaskCase(task);
              return (
                <Card
                  key={task.id}
                  className="group border border-border/60 bg-card hover:bg-accent/5 transition-all duration-200 shadow-sm hover:shadow flex flex-col justify-between p-3.5 min-h-[90px] relative"
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <CircleDot size={14} className={getStatusIconColor(task.status || '')} strokeWidth={2.5} />
                      <span className="truncate">{task.taskCode || `task-board #${task.id?.substring(0, 4)}`}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {task.collaboratorCode && (
                        <div
                          className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-background shadow-sm z-10"
                          title={`Assigned to: ${task.collaboratorCode}`}
                        >
                          {task.collaboratorCode.substring(0, 2).toUpperCase()}
                        </div>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-accent transition-all outline-none text-muted-foreground/50 hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          {task.formCode && FORM_SCHEMAS[task.formCode] ? (
                            <DropdownMenuItem 
                              className="cursor-pointer font-bold text-primary focus:text-primary"
                              onClick={() => setDynamicFormTask(task)}
                            >
                              <ClipboardList className="mr-2 h-4 w-4" /> Fill Task Form
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="cursor-pointer" asChild>
                              <Link href={TASK_ROUTES.EDIT(task.id)} className="flex items-center w-full">
                                <Edit2 className="mr-2 h-4 w-4" /> Edit Task
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {linkedCase && (
                            <DropdownMenuItem className="cursor-pointer" asChild>
                              <Link href={CASE_ROUTES.EDIT(linkedCase.id)} className="flex items-center w-full">
                                <Layers className="mr-2 h-4 w-4" /> Edit Parent Case
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive cursor-pointer focus:bg-destructive/10"
                            onClick={() => handleDeleteClick(task)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <h4 className="text-[13px] font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 pr-2">
                    {task.notes || (linkedCase ? linkedCase.entity : 'No description provided')}
                  </h4>

                  {/* Action Icon at bottom right */}
                  {actionType === 'claim' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute bottom-2 right-2 h-7 w-7 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground transition-all opacity-60 group-hover:opacity-100 z-10"
                      title={t('workflow.task.claim') || 'Claim Task'}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleClaimTask(task);
                      }}
                    >
                      <HandGrab className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {actionType === 'finish' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute bottom-2 right-2 h-7 w-7 rounded-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white transition-all opacity-60 group-hover:opacity-100 z-10"
                      title={t('workflow.task.finish') || 'Finish Task'}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleFinishTask(task);
                      }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
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
      {/* Sticky Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-background/85 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10 mb-2 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t(TASK_CONSTANTS.TITLE) || 'Task Board'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Coordinate individual system workflow tasks divided by process status and personal responsibility.
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
          <Link href={TASK_ROUTES.CREATE()}>
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
          placeholder="Filter by tasks, notes, status, collaborators, parent cases..."
          className="pl-9 h-11 bg-card/50 border-border/40 focus:ring-primary/20 transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 4-column Kanban Grid */}
      {!isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderColumn(
            "Pending",
            pendingTasks.length,
            pendingTasks,
            <Clock className="h-4 w-4 text-slate-500" />,
            "bg-slate-500/5 text-slate-700 dark:text-slate-400 border-slate-500/10",
            'claim'
          )}
          {renderColumn(
            "Assigned to You",
            assignedTasks.length,
            assignedTasks,
            <UserCheck className="h-4 w-4 text-sky-500" />,
            "bg-sky-500/5 text-sky-700 dark:text-sky-400 border-sky-500/10",
            'finish'
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
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider animate-pulse">Loading Tasks Board...</span>
        </div>
      )}

      {/* Delete Task Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Task"
        description={`This will permanently delete Task "${deleteTarget?.taskCode}" (Case: ${deleteTarget?.caseId}).`}
        confirmText={t('common.confirm') || 'Delete'}
        cancelText={t('common.cancel') || 'Cancel'}
        onConfirm={confirmDelete}
        type="danger"
        isLoading={isDeleting}
      />

      {/* Dynamic Form Fill Dialog Modal */}
      <Dialog
        open={!!dynamicFormTask}
        onOpenChange={(open) => {
          if (!open && !isSubmittingForm) setDynamicFormTask(null);
        }}
      >
        <DialogContent className="sm:max-w-lg border border-border/50 bg-card/95 backdrop-blur shadow-2xl p-6">
          <DialogHeader className="border-b border-border/10 pb-4 mb-2">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ClipboardList className="text-primary h-5 w-5" />
              {dynamicFormTask?.taskCode || 'Task Form Execution'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Provide values to complete variables required for step completion.
            </DialogDescription>
          </DialogHeader>
          
          {dynamicFormTask && dynamicFormTask.formCode && FORM_SCHEMAS[dynamicFormTask.formCode] && (
            <div className="pt-2">
              <DynamicForm
                definition={FORM_SCHEMAS[dynamicFormTask.formCode]}
                defaultValues={{
                  nombre: dynamicFormTask.outputVariables?.nombre?.value || ""
                }}
                onSubmit={handleDynamicFormSubmit}
                submitLabel={isSubmittingForm ? "Submitting..." : "Submit & Complete Task"}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
