"use client";

import React from 'react';
import { useTranslation } from '@kplian/i18n';
import { SCHEDULE_CONSTANTS } from '../../constants/schedule-constants';
import { Schedule } from '../../domain/Schedule';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Clock, Calendar as CalendarIcon, Hash, Users, Building, Edit2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ScheduleListModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: Schedule[];
  onSelect: (id: string) => void;
}

export function ScheduleListModal({ isOpen, onClose, schedules, onSelect }: ScheduleListModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl bg-transparent">
        <div className="bg-background/95 backdrop-blur-xl border border-border/40 rounded-xl overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 bg-primary/5 border-b border-border/10">
            <DialogTitle className="text-xl font-black tracking-tight text-foreground uppercase flex items-center gap-2">
              <CalendarIcon className="size-5 text-primary" />
              {t(SCHEDULE_CONSTANTS.LIST_TITLE)}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              {schedules.length} {t('common.records_found') || 'records found for this slot'}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="p-4 space-y-3">
              {schedules.map((schedule) => (
                <div 
                  key={schedule.id}
                  className="group relative bg-card/40 border border-border/40 hover:border-primary/40 rounded-xl p-4 transition-all hover:bg-primary/5"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-primary" />
                      <span className="text-sm font-bold">{schedule.fromTime} - {schedule.toTime}</span>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold px-1.5 py-0">
                        {schedule.status}
                      </Badge>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="size-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onSelect(schedule.id)}
                    >
                      <Edit2 size={14} />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 truncate">
                      <Users size={12} className="text-primary/70" />
                      <span className="truncate text-primary font-medium">{schedule.collaboratorId}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Building size={12} className="text-primary/70" />
                      <span className="truncate text-primary font-medium">{schedule.organizationId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash size={12} className="text-primary/70" />
                      <span className="text-primary font-medium">{schedule.quantity} {schedule.unitMeasureCode}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 bg-primary/5 border-t border-border/10 flex justify-end">
            <Button variant="ghost" onClick={onClose} className="font-bold uppercase text-xs tracking-widest">
              {t('common.close') || 'Close'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
