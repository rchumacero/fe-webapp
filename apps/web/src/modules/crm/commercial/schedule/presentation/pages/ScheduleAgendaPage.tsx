"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@kplian/i18n';
import { SCHEDULE_CONSTANTS } from '../../constants/schedule-constants';
import { SCHEDULE_ROUTES } from '../../routes/schedule-routes';
import { Schedule } from '../../domain/Schedule';
import { ScheduleRepositoryImpl } from '../../infrastructure/ScheduleRepositoryImpl';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Plus, Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ScheduleFormModal } from '../components/ScheduleFormModal';
import { ScheduleListModal } from '../components/ScheduleListModal';
import { Badge } from '@/components/ui/badge';

const scheduleRepository = new ScheduleRepositoryImpl();

export default function ScheduleAgendaPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const commercialProductId = searchParams.get('commercialProductId');

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<{ day?: string; fromTime?: string; toTime?: string }>({});

  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Schedule[]>([]);

  const fetchSchedules = useCallback(async () => {
    if (!commercialProductId) return;
    setIsLoading(true);
    try {
      const data = await scheduleRepository.getByCommercialProductId(commercialProductId);
      setSchedules(data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setIsLoading(false);
    }
  }, [commercialProductId]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

  const groupSchedulesByDay = useCallback((daySchedules: Schedule[]) => {
    const sorted = [...daySchedules].sort((a, b) => a.fromTime.localeCompare(b.fromTime));
    const groups: Schedule[][] = [];

    sorted.forEach(schedule => {
      let placed = false;
      for (const group of groups) {
        // Overlap detection
        const overlaps = group.some(s => (schedule.fromTime < s.toTime && schedule.toTime > s.fromTime));
        if (overlaps) {
          group.push(schedule);
          placed = true;
          break;
        }
      }
      if (!placed) groups.push([schedule]);
    });
    return groups;
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, dayCode: string, hourIdx: number) => {
    e.preventDefault();
    const scheduleId = e.dataTransfer.getData("scheduleId");
    if (!scheduleId) return;

    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return;

    // Preserve duration
    const startMins = parseInt(schedule.fromTime.split(':')[0]) * 60 + parseInt(schedule.fromTime.split(':')[1]);
    const endMins = parseInt(schedule.toTime.split(':')[0]) * 60 + parseInt(schedule.toTime.split(':')[1]);
    const duration = endMins - startMins;

    const newFromTime = `${hourIdx.toString().padStart(2, '0')}:00`;
    const newEndMins = hourIdx * 60 + duration;
    const newToTime = `${Math.floor(newEndMins / 60).toString().padStart(2, '0')}:${(newEndMins % 60).toString().padStart(2, '0')}`;

    try {
      setIsLoading(true);
      await scheduleRepository.update({
        ...schedule,
        dayCode,
        fromTime: newFromTime,
        toTime: newToTime
      });
      await fetchSchedules();
    } catch (error) {
      console.error("Error moving schedule:", error);
    } finally {
      setIsLoading(false);
    }
  }, [schedules, fetchSchedules]);

  if (!commercialProductId) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive font-bold">{t(SCHEDULE_CONSTANTS.NO_PRODUCT_ID)}</p>
        <Button variant="link" onClick={() => router.back()}>{t(SCHEDULE_CONSTANTS.GO_BACK)}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-10 py-4 border-b border-border/10 mb-2">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full hover:bg-accent/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t(SCHEDULE_CONSTANTS.LIST_TITLE)}
            </h1>
            <p className="text-xs text-muted-foreground">{t(SCHEDULE_CONSTANTS.AGENDA_SUBTITLE)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-muted/30 p-1 rounded-xl border border-border/10">
            {(['day', 'week', 'month'] as const).map((v) => (
              <Button
                key={v}
                variant={view === v ? "default" : "ghost"}
                size="sm"
                onClick={() => setView(v)}
                className={cn(
                  "rounded-lg px-4 h-8 text-[10px] font-black uppercase tracking-widest transition-all",
                  view === v ? "shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t(`common.${v}`)}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl border border-border/10">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => {
              const newDate = new Date(selectedDate);
              if (view === 'day') newDate.setDate(selectedDate.getDate() - 1);
              else if (view === 'week') newDate.setDate(selectedDate.getDate() - 7);
              else newDate.setMonth(selectedDate.getMonth() - 1);
              setSelectedDate(newDate);
            }}>
              <ChevronLeft size={16} />
            </Button>
            <span className="text-[10px] font-black uppercase tracking-widest px-2 min-w-[100px] text-center">
              {view === 'month'
                ? selectedDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
                : view === 'day'
                  ? selectedDate.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
                  : `Week ${selectedDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => {
              const newDate = new Date(selectedDate);
              if (view === 'day') newDate.setDate(selectedDate.getDate() + 1);
              else if (view === 'week') newDate.setDate(selectedDate.getDate() + 7);
              else newDate.setMonth(selectedDate.getMonth() + 1);
              setSelectedDate(newDate);
            }}>
              <ChevronRight size={16} />
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchSchedules} className="rounded-full hover:bg-accent hover:rotate-180 transition-all duration-500">
            <RefreshCw className={isLoading ? "animate-spin size-5" : "size-5"} />
          </Button>
          <Button
            size="icon"
            className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-md group"
            title={t(SCHEDULE_CONSTANTS.CREATE_TITLE)}
            onClick={() => {
              setSelectedScheduleId(null);
              setInitialData({});
              setIsModalOpen(true);
            }}
          >
            <Plus className="size-5 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      </div>

      <div className="bg-card/30 backdrop-blur-sm border border-border/10 rounded-2xl overflow-hidden shadow-2xl">
        {view !== 'month' ? (
          <div className="grid grid-cols-1 md:grid-cols-8 gap-0 overflow-x-auto min-w-[800px]">
            <div className="sticky left-0 bg-background/95 backdrop-blur-sm z-[10] border-r border-border/10">
              <div className="h-12 border-b border-border/10 flex items-center justify-center font-black text-[10px] text-muted-foreground uppercase tracking-widest bg-muted/20">
                {t(SCHEDULE_CONSTANTS.TIME_HEADER)}
              </div>
              {hours.map(hour => (
                <div key={hour} className="h-20 border-b border-border/5 flex items-start justify-center pt-2 text-[10px] text-muted-foreground/40 font-black tracking-tighter">
                  {hour}
                </div>
              ))}
            </div>

            {(view === 'day'
              ? [days[selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1]]
              : days
            ).map((day, dIdx) => (
              <div key={day} className={cn("flex-1 min-w-[100px] border-r border-border/5 last:border-r-0", view === 'day' && "col-span-7")}>
                <div className={cn(
                  "h-12 border-b border-border/10 flex flex-col items-center justify-center bg-muted/5 transition-colors",
                  day === days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1] && "bg-primary/5"
                )}>
                  <span className="font-black text-[10px] text-primary uppercase tracking-widest">
                    {t(SCHEDULE_CONSTANTS.DAYS[day as keyof typeof SCHEDULE_CONSTANTS.DAYS]) || day}
                  </span>
                  {view === 'week' && (
                    <span className="text-[9px] text-muted-foreground/60 font-bold">
                      {(() => {
                        const d = new Date(selectedDate);
                        const dayOffset = days.indexOf(day) - (selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1);
                        d.setDate(selectedDate.getDate() + dayOffset);
                        return d.getDate();
                      })()}
                    </span>
                  )}
                </div>
                <div className="relative h-[1920px]">
                  {groupSchedulesByDay(schedules.filter(s => s.dayCode === day)).map((group, gIdx) => {
                    const mainSchedule = group[0];
                    const count = group.length;

                    const minStart = group.reduce((m, s) => s.fromTime < m ? s.fromTime : m, mainSchedule.fromTime);
                    const maxEnd = group.reduce((m, s) => s.toTime > m ? s.toTime : m, mainSchedule.toTime);

                    const startHour = parseInt(minStart.split(':')[0]);
                    const startMin = parseInt(minStart.split(':')[1]);
                    const endHour = parseInt(maxEnd.split(':')[0]);
                    const endMin = parseInt(maxEnd.split(':')[1]);

                    const top = (startHour * 80) + (startMin / 60 * 80);
                    const height = Math.max(20, ((endHour - startHour) * 80) + ((endMin - startMin) / 60 * 80));

                    return (
                      <div
                        key={`${day}-${gIdx}`}
                        draggable={count === 1}
                        onDragStart={(e) => {
                          if (count === 1) {
                            e.dataTransfer.setData("scheduleId", mainSchedule.id);
                            e.currentTarget.classList.add("opacity-50");
                          }
                        }}
                        onDragEnd={(e) => {
                          e.currentTarget.classList.remove("opacity-50");
                        }}
                        className={cn(
                          "absolute left-1 right-1 rounded-xl border p-2 overflow-hidden transition-all cursor-pointer group z-[2] shadow-sm hover:shadow-xl hover:-translate-y-0.5 active:scale-95",
                          count > 1
                            ? "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20"
                            : "bg-primary/10 border-primary/20 hover:bg-primary/20"
                        )}
                        style={{ top: `${top}px`, height: `${height}px` }}
                        onClick={() => {
                          if (count > 1) {
                            setCurrentGroup(group);
                            setIsListModalOpen(true);
                          } else {
                            setSelectedScheduleId(mainSchedule.id);
                            setIsModalOpen(true);
                          }
                        }}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <div className={cn("text-[9px] font-black truncate tracking-tighter uppercase", count > 1 ? "text-amber-700 dark:text-amber-400" : "text-primary")}>
                            {minStart} - {maxEnd}
                          </div>
                          {count > 1 && (
                            <Badge variant="secondary" className="text-[8px] px-1 h-3.5 bg-amber-500 text-white border-none font-black">
                              +{count - 1}
                            </Badge>
                          )}
                        </div>
                        <div className={cn("text-[8px] font-black truncate mt-0.5 uppercase opacity-60", count > 1 ? "text-amber-600" : "text-primary")}>
                          {count > 1 ? `${count} ${t('common.schedules')}` : `${mainSchedule.quantity} ${mainSchedule.unitMeasureCode}`}
                        </div>
                      </div>
                    );
                  })}
                  {hours.map((_, idx) => {
                    const fromTime = `${idx.toString().padStart(2, '0')}:00`;
                    const toTime = `${(idx + 1).toString().padStart(2, '0')}:00`;
                    return (
                      <div
                        key={idx}
                        className="h-20 border-b border-border/5 w-full hover:bg-primary/5 transition-colors cursor-crosshair relative group/cell"
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add("bg-primary/10");
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove("bg-primary/10");
                        }}
                        onDrop={(e) => {
                          e.currentTarget.classList.remove("bg-primary/10");
                          handleDrop(e, day, idx);
                        }}
                        onClick={() => {
                          setSelectedScheduleId(null);
                          setInitialData({ day, fromTime, toTime });
                          setIsModalOpen(true);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-0">
            {days.map(day => (
              <div key={day} className="h-10 flex items-center justify-center font-black text-[10px] text-muted-foreground uppercase tracking-widest border-b border-r border-border/10 bg-muted/20 last:border-r-0">
                {t(SCHEDULE_CONSTANTS.DAYS[day as keyof typeof SCHEDULE_CONSTANTS.DAYS]) || day}
              </div>
            ))}
            {(() => {
              const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
              const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
              const startDay = startOfMonth.getDay() === 0 ? 6 : startOfMonth.getDay() - 1;
              const totalDays = endOfMonth.getDate();

              const cells = [];
              for (let i = 0; i < startDay; i++) {
                cells.push(<div key={`empty-${i}`} className="h-32 border-b border-r border-border/5 bg-muted/5 last:border-r-0" />);
              }

              for (let d = 1; d <= totalDays; d++) {
                const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), d);
                const dayCode = days[date.getDay() === 0 ? 6 : date.getDay() - 1];
                const daySchedules = schedules.filter(s => s.dayCode === dayCode);
                const isToday = new Date().toDateString() === date.toDateString();

                cells.push(
                  <div key={d} className={cn(
                    "h-32 border-b border-r border-border/5 p-2 transition-all hover:bg-muted/10 last:border-r-0 relative group",
                    isToday && "bg-primary/5"
                  )}>
                    <div className={cn(
                      "text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full mb-1",
                      isToday ? "bg-primary text-white" : "text-muted-foreground"
                    )}>
                      {d}
                    </div>
                    <div className="space-y-1">
                      {daySchedules.slice(0, 3).map((s, idx) => (
                        <div key={s.id} className="text-[8px] font-black bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.5 truncate uppercase tracking-tighter">
                          {s.fromTime} - {s.quantity}{s.unitMeasureCode}
                        </div>
                      ))}
                      {daySchedules.length > 3 && (
                        <div className="text-[8px] font-black text-muted-foreground ml-1.5 uppercase">
                          + {daySchedules.length - 3} {t('common.more')}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity size-6 rounded-lg"
                      onClick={() => {
                        setSelectedScheduleId(null);
                        setInitialData({ day: dayCode });
                        setIsModalOpen(true);
                      }}
                    >
                      <Plus size={12} />
                    </Button>
                  </div>
                );
              }
              return cells;
            })()}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-background/20 backdrop-blur-[1px] z-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}

      <ScheduleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchSchedules}
        id={selectedScheduleId}
        commercialProductId={commercialProductId}
        initialDay={initialData.day}
        initialFromTime={initialData.fromTime}
        initialToTime={initialData.toTime}
      />

      <ScheduleListModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        schedules={currentGroup}
        onSelect={(id) => {
          setIsListModalOpen(false);
          setSelectedScheduleId(id);
          setIsModalOpen(true);
        }}
      />
    </div>
  );
}
