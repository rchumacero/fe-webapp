import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from '@kplian/i18n';
import { MainLayout } from '../../../../../../shared/layout/MainLayout';
import { Colors, Spacing, Typography } from '../../../../../../shared/theme/constants';
import { ScheduleRepositoryImpl } from '@kplian/infrastructure';
import { Schedule } from '@kplian/core';
import { SCHEDULE_CONSTANTS } from '../../constants/schedule-constants';
import { Ionicons } from '@expo/vector-icons';

const scheduleRepo = new ScheduleRepositoryImpl();

interface ScheduleCalendarScreenProps {
  commercialProductId?: string;
  collaboratorId?: string;
  onBack: () => void;
}

export default function ScheduleCalendarScreen({ 
  commercialProductId, 
  collaboratorId, 
  onBack 
}: ScheduleCalendarScreenProps) {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Validaciones de entrada
  const isInputInvalid = useMemo(() => {
    return (!commercialProductId && !collaboratorId) || (!!commercialProductId && !!collaboratorId);
  }, [commercialProductId, collaboratorId]);

  useEffect(() => {
    if (isInputInvalid) return;

    const fetchSchedules = async () => {
      setLoading(true);
      try {
        let data: Schedule[] = [];
        if (collaboratorId) {
          data = await scheduleRepo.getByCollaboratorId(collaboratorId);
        } else if (commercialProductId) {
          data = await scheduleRepo.getByCommercialProductId(commercialProductId);
        }
        setSchedules(data);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [commercialProductId, collaboratorId, isInputInvalid]);

  // Genera un rango de 7 días (Lunes a Domingo) correspondiente a la semana de selectedDate
  const weekDays = useMemo(() => {
    const list = [];
    const base = new Date(selectedDate);
    const day = base.getDay();
    const diff = base.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(base.setDate(diff));

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      list.push(date);
    }
    return list;
  }, [selectedDate]);

  // Filtrar horarios por el día seleccionado
  const daySchedules = useMemo(() => {
    return schedules.filter(s => {
      const sDate = new Date(s.fromDate);
      return sDate.getFullYear() === selectedDate.getFullYear() &&
             sDate.getMonth() === selectedDate.getMonth() &&
             sDate.getDate() === selectedDate.getDate();
    }).sort((a, b) => {
      return new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime();
    });
  }, [schedules, selectedDate]);

  // Formato del título de fecha
  const formattedSelectedDate = useMemo(() => {
    return selectedDate.toLocaleDateString(undefined, { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }, [selectedDate]);

  const parseTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const getDayLetter = (date: Date) => {
    const days = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    return days[date.getDay()];
  };

  if (isInputInvalid) {
    return (
      <MainLayout headerTitle={t(SCHEDULE_CONSTANTS.TITLE, 'Schedule')}>
        <TouchableOpacity style={styles.backLink} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={Colors.muted} />
          <Text style={styles.backLinkText}>Volver</Text>
        </TouchableOpacity>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.destructive} />
          <Text style={styles.errorText}>
            Error de configuración: Debe proporcionar commercialProductId o collaboratorId (pero no ambos).
          </Text>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout headerTitle={t(SCHEDULE_CONSTANTS.TITLE, 'Schedule')}>
      <TouchableOpacity style={styles.backLink} onPress={onBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.muted} />
        <Text style={styles.backLinkText}>Volver</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>{t(SCHEDULE_CONSTANTS.LIST_TITLE, 'Schedules')}</Text>

      {/* Weekly Navigation Buttons */}
      <View style={styles.weekNavigation}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => {
            const prev = new Date(selectedDate);
            prev.setDate(selectedDate.getDate() - 7);
            setSelectedDate(prev);
          }}
        >
          <Ionicons name="chevron-back" size={18} color={Colors.primary} />
          <Text style={styles.navButtonText}>Semana anterior</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => {
            const next = new Date(selectedDate);
            next.setDate(selectedDate.getDate() + 7);
            setSelectedDate(next);
          }}
        >
          <Text style={styles.navButtonText}>Semana siguiente</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Horizontal Day Picker */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.dayPickerContainer}
        contentContainerStyle={styles.dayPickerContent}
      >
        {weekDays.map((date, idx) => {
          const isSelected = date.getDate() === selectedDate.getDate() &&
                             date.getMonth() === selectedDate.getMonth() &&
                             date.getFullYear() === selectedDate.getFullYear();
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.dayCard, isSelected && styles.dayCardSelected]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[styles.dayLetter, isSelected && styles.textSelected]}>
                {getDayLetter(date)}
              </Text>
              <Text style={[styles.dayNumber, isSelected && styles.textSelected]}>
                {date.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Selected Date Header */}
      <View style={styles.dateHeader}>
        <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
        <Text style={styles.dateHeaderText}>{formattedSelectedDate}</Text>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : daySchedules.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color={Colors.muted} />
          <Text style={styles.emptyText}>No hay horarios agendados para este día</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll}>
          {daySchedules.map((schedule) => (
            <View key={schedule.id} style={styles.scheduleCard}>
              <View style={styles.timeInfo}>
                <Ionicons name="time" size={22} color={Colors.primary} />
                <Text style={styles.timeText}>
                  {parseTime(schedule.fromDate)} - {parseTime(schedule.toDate)} ({new Date(schedule.fromDate).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })})
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.details}>
                {schedule.quantity !== null && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Cantidad:</Text>
                    <Text style={styles.detailValue}>
                      {schedule.quantity} {schedule.unitMeasureCode || ''}
                    </Text>
                  </View>
                )}

                {schedule.collaboratorId && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Colaborador:</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>
                      {schedule.collaboratorId}
                    </Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Estado:</Text>
                  <View style={[
                    styles.statusBadge,
                    schedule.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive
                  ]}>
                    <Text style={styles.statusText}>{schedule.status}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: 4,
  },
  backLinkText: {
    color: Colors.muted,
    fontSize: Typography.sizes.md,
    fontWeight: 'medium',
  },
  sectionTitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 40,
    padding: Spacing.lg,
  },
  errorText: {
    color: Colors.destructive,
    textAlign: 'center',
    fontSize: Typography.sizes.md,
    marginTop: Spacing.md,
  },
  dayPickerContainer: {
    maxHeight: 74,
    marginBottom: Spacing.md,
  },
  dayPickerContent: {
    gap: 8,
    paddingRight: Spacing.md,
  },
  dayCard: {
    width: 46,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayLetter: {
    color: Colors.muted,
    fontSize: Typography.sizes.xs,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  dayNumber: {
    color: Colors.foreground,
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
    marginTop: 2,
  },
  textSelected: {
    color: Colors.sidebar,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  dateHeaderText: {
    color: Colors.muted,
    fontSize: Typography.sizes.md,
    fontWeight: 'medium',
    textTransform: 'capitalize',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 30,
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    color: Colors.muted,
    fontSize: Typography.sizes.md,
    marginTop: 12,
  },
  scroll: {
    flex: 1,
  },
  scheduleCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
    width: 90,
  },
  detailValue: {
    color: Colors.foreground,
    fontSize: Typography.sizes.sm,
    fontWeight: 'medium',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  statusText: {
    color: Colors.foreground,
    fontSize: Typography.sizes.xs,
    fontWeight: 'bold',
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navButtonText: {
    color: Colors.foreground,
    fontSize: Typography.sizes.sm,
    fontWeight: 'medium',
  },
});
