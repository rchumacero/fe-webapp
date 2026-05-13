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
import Link from 'next/link';
import { cn } from '@/lib/utils';

const scheduleRepository = new ScheduleRepositoryImpl();

export default function ScheduleAgendaPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const commercialProductId = searchParams.get('commercialProductId');

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchSchedules} className="rounded-full hover:bg-accent hover:rotate-180 transition-all duration-500">
            <RefreshCw className={isLoading ? "animate-spin size-5" : "size-5"} />
          </Button>
          <Link href={SCHEDULE_ROUTES.CREATE(commercialProductId)}>
            <Button size="icon" className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-md group" title={t(SCHEDULE_CONSTANTS.CREATE_TITLE)}>
              <Plus className="size-5 group-hover:scale-110 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-8 gap-4 overflow-x-auto min-w-[800px] pb-4">
        <div className="sticky left-0 bg-background/95 backdrop-blur-sm z-[5]">
          <div className="h-12 border-b border-border/10 flex items-center justify-center font-bold text-xs text-muted-foreground uppercase">{t(SCHEDULE_CONSTANTS.TIME_HEADER)}</div>
          {hours.map(hour => (
            <div key={hour} className="h-20 border-b border-border/10 flex items-start justify-center pt-2 text-[10px] text-muted-foreground/60 font-mono">
              {hour}
            </div>
          ))}
        </div>

        {days.map(day => (
          <div key={day} className="flex-1 min-w-[100px]">
            <div className="h-12 border-b border-border/10 flex items-center justify-center font-bold text-sm text-primary uppercase bg-primary/5 rounded-t-lg">
              {t(SCHEDULE_CONSTANTS.DAYS[day as keyof typeof SCHEDULE_CONSTANTS.DAYS]) || day}
            </div>
            <div className="relative bg-card/30 h-[1920px] border-r border-border/5">
              {schedules.filter(s => s.dayCode === day).map(schedule => {
                const startHour = parseInt(schedule.fromTime.split(':')[0]);
                const startMin = parseInt(schedule.fromTime.split(':')[1]);
                const endHour = parseInt(schedule.toTime.split(':')[0]);
                const endMin = parseInt(schedule.toTime.split(':')[1]);

                const top = (startHour * 80) + (startMin / 60 * 80);
                const height = ((endHour - startHour) * 80) + ((endMin - startMin) / 60 * 80);

                return (
                  <div
                    key={schedule.id}
                    className="absolute left-1 right-1 rounded-md bg-primary/20 border border-primary/30 p-2 overflow-hidden hover:bg-primary/30 transition-all cursor-pointer group z-[2]"
                    style={{ top: `${top}px`, height: `${height}px` }}
                    onClick={() => router.push(SCHEDULE_ROUTES.EDIT(schedule.id, commercialProductId))}
                  >
                    <div className="text-[10px] font-bold text-primary truncate">{schedule.fromTime} - {schedule.toTime}</div>
                    <div className="text-[9px] text-primary/70 font-medium truncate mt-1">
                      {schedule.quantity} {schedule.unitMeasureCode}
                    </div>
                  </div>
                );
              })}
              {hours.map((_, idx) => (
                <div key={idx} className="h-20 border-b border-border/5 w-full pointer-events-none" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-background/20 backdrop-blur-[1px] z-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
