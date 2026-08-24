"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@kplian/i18n';
import { TASK_CONSTANTS } from '../../constants/task-constants';
import { TASK_ROUTES } from '../../routes/task-routes';
import { TaskRepositoryImpl } from '../../infrastructure/TaskRepositoryImpl';
import { CaseRepositoryImpl } from '../../../inbox/infrastructure/CaseRepositoryImpl';
import { Case } from '../../../inbox/domain/Case';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Save, X, ArrowLeft, Loader2, Info, Briefcase, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useVendor } from '@/hooks/use-vendor';

const taskRepository = new TaskRepositoryImpl();
const caseRepository = new CaseRepositoryImpl();

const taskValidationSchema = z.object({
  caseId: z.string().min(1, "Case link is required"),
  taskCode: z.string().min(1, "Task Code is required").max(50, "Task Code is too long"),
  taskDate: z.string().min(1, "Task Date is required"),
  collaboratorCode: z.string().min(1, "Collaborator Code is required"),
  receivedOrder: z.number().int("Received Order must be an integer").min(1, "Order must be 1 or higher"),
  sendOrder: z.number().int("Send Order must be an integer").min(1, "Order must be 1 or higher"),
  notes: z.string().optional().or(z.literal('')),
  status: z.string().min(1, "Status is required"),
});

type TaskFormData = z.infer<typeof taskValidationSchema>;

interface TaskFormProps {
  id?: string;
}

export default function TaskFormPage({ id }: TaskFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { vendor } = useVendor();

  const [cases, setCases] = useState<Case[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isDirty },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskValidationSchema),
    defaultValues: {
      caseId: '',
      taskCode: '',
      taskDate: new Date().toISOString().substring(0, 10),
      collaboratorCode: vendor || '',
      receivedOrder: 1,
      sendOrder: 1,
      notes: '',
      status: 'TODO',
    }
  });

  // Pre-fill collaboratorCode from vendor session once loaded
  useEffect(() => {
    if (vendor && !id) {
      setValue('collaboratorCode', vendor, { shouldDirty: false });
    }
  }, [vendor, id, setValue]);

  // Load parent Cases and Task details
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const casesList = await caseRepository.getAll();
        setCases(casesList || []);

        if (id) {
          const taskData = await taskRepository.getById(id);
          // format taskDate to YYYY-MM-DD
          let formattedDate = '';
          if (taskData.taskDate) {
            formattedDate = new Date(taskData.taskDate).toISOString().substring(0, 10);
          }
          reset({
            caseId: taskData.caseId || '',
            taskCode: taskData.taskCode || '',
            taskDate: formattedDate,
            collaboratorCode: taskData.collaboratorCode || '',
            receivedOrder: taskData.receivedOrder || 1,
            sendOrder: taskData.sendOrder || 1,
            notes: taskData.notes || '',
            status: taskData.status || 'TODO',
          });
        }
      } catch (error) {
        console.error("Error loading task dependencies:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id, reset]);

  const onSubmit: SubmitHandler<TaskFormData> = async (formData) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await taskRepository.update({
          ...formData,
          id,
        });
      } else {
        await taskRepository.create(formData);
      }
      router.push(TASK_ROUTES.LIST());
      router.refresh();
    } catch (error) {
      console.error("Error saving task:", error);
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
    router.push(TASK_ROUTES.LIST());
  };

  const confirmCancel = () => {
    setShowConfirmCancel(false);
    router.push(TASK_ROUTES.LIST());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header section */}
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
              {id ? t(TASK_CONSTANTS.EDIT_TITLE) || 'Edit Task' : t(TASK_CONSTANTS.CREATE_TITLE) || 'Create Task'}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {id
                ? 'Update execution parameters, notes, and progress status for this dynamic task.'
                : 'Configure a new task associated with a parent case, target date, and collaborator.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Form layout */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card: Task Core details */}
          <Card className="border-border/40 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border/5 pb-2">
                Task Definition
              </h3>

              {/* Case binding dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Workflow Case Association
                </label>
                <Controller
                  name="caseId"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="flex h-11 w-full rounded-md border border-border/50 bg-card/30 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer font-medium"
                    >
                      <option value="">-- Select Active Parent Case --</option>
                      {cases.map(c => (
                        <option key={c.id} value={c.id}>
                          Entity: {c.entity} (Process: {c.processCode})
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.caseId && <p className="text-[10px] text-destructive font-medium ml-1">{errors.caseId.message}</p>}
              </div>

              {/* Row: Task Code & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Task Code Tag
                  </label>
                  <Input
                    {...register("taskCode")}
                    placeholder="e.g. APPROVAL_SIGNATURE"
                    className={errors.taskCode ? "border-destructive focus-visible:ring-destructive/20 h-11 bg-card/30" : "h-11 bg-card/30"}
                  />
                  {errors.taskCode && <p className="text-[10px] text-destructive font-medium ml-1">{errors.taskCode.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Task Target Date
                  </label>
                  <Input
                    type="date"
                    {...register("taskDate")}
                    className={errors.taskDate ? "border-destructive focus-visible:ring-destructive/20 h-11 bg-card/30" : "h-11 bg-card/30"}
                  />
                  {errors.taskDate && <p className="text-[10px] text-destructive font-medium ml-1">{errors.taskDate.message}</p>}
                </div>
              </div>

              {/* Row: Orders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Received Order Index
                  </label>
                  <Input
                    type="number"
                    {...register("receivedOrder", { valueAsNumber: true })}
                    placeholder="e.g. 1"
                    className={errors.receivedOrder ? "border-destructive focus-visible:ring-destructive/20 h-11 bg-card/30" : "h-11 bg-card/30"}
                  />
                  {errors.receivedOrder && <p className="text-[10px] text-destructive font-medium ml-1">{errors.receivedOrder.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Send Order Index
                  </label>
                  <Input
                    type="number"
                    {...register("sendOrder", { valueAsNumber: true })}
                    placeholder="e.g. 1"
                    className={errors.sendOrder ? "border-destructive focus-visible:ring-destructive/20 h-11 bg-card/30" : "h-11 bg-card/30"}
                  />
                  {errors.sendOrder && <p className="text-[10px] text-destructive font-medium ml-1">{errors.sendOrder.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes Card */}
          <Card className="border-border/40 shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Task Description / Execution Notes
              </label>
              <textarea
                {...register("notes")}
                placeholder="Describe execution instructions, dependency flags, or workflow checks..."
                rows={5}
                className="flex w-full rounded-md border border-border/50 bg-card/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all resize-none"
              />
              {errors.notes && <p className="text-[10px] text-destructive font-medium ml-1">{errors.notes.message}</p>}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5 shadow-xl border-dashed">
            <CardHeader>
              <CardTitle className="text-base font-bold text-primary flex items-center gap-2">
                <ClipboardList size={18} />
                Task Meta Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Collaborator */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Responsible Collaborator
                </label>
                <Input
                  {...register("collaboratorCode")}
                  placeholder="e.g. COLL_1234"
                  className={errors.collaboratorCode ? "border-destructive focus-visible:ring-destructive/20 h-11 bg-card/30 font-mono" : "h-11 bg-card/30 font-mono"}
                />
                {errors.collaboratorCode && <p className="text-[10px] text-destructive font-medium ml-1">{errors.collaboratorCode.message}</p>}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Workflow State
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="flex h-11 w-full rounded-md border border-border/50 bg-card/30 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all cursor-pointer font-medium"
                    >
                      <option value="TODO">TODO</option>
                      <option value="PENDING">PENDING</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  )}
                />
                {errors.status && <p className="text-[10px] text-destructive font-medium ml-1">{errors.status.message}</p>}
              </div>

              <div className="flex justify-between text-xs border-b border-border/5 pb-2 pt-4">
                <span className="text-muted-foreground">Modified:</span>
                <span className={isDirty ? "text-amber-500 font-bold" : "text-emerald-500 font-bold"}>
                  {isDirty ? "YES" : "NO"}
                </span>
              </div>
              <div className="flex gap-2.5 text-xs text-muted-foreground leading-relaxed pt-2">
                <Info size={16} className="text-primary shrink-0 animate-bounce" />
                <span>
                  Tasks represent atomic procedural items mapped under Cases to verify parameters, upload artifacts, or trigger approvals.
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-6 pb-8 px-6 border-t border-border/5">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 h-12 font-bold transition-all duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                {t('common.save') || 'Save'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all h-12 font-bold"
                onClick={handleCancel}
              >
                <X className="mr-2 h-5 w-5" />
                {t('common.cancel') || 'Cancel'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>

      {/* Cancel Confirmation */}
      <ConfirmDialog
        open={showConfirmCancel}
        onOpenChange={setShowConfirmCancel}
        title="Discard Changes?"
        description="You have unsaved task modifications. Are you sure you want to discard your edits and return to the task board?"
        confirmText={t('common.confirm') || 'Discard'}
        cancelText={t('common.cancel') || 'Keep Editing'}
        onConfirm={confirmCancel}
        type="warning"
      />
    </div>
  );
}
