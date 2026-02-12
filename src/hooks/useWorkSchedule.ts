import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useGetActiveWorkShiftsQuery } from '../store/api/workshiftApi';
import { formatShiftTime } from '../utils';
import type { WorkShift } from '../types/workshift';

const SHIFT_COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#EC4899'];
const DAY_NAMES = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

export const getShiftColor = (index: number) => SHIFT_COLORS[index % SHIFT_COLORS.length];

export interface WeekDay {
  dayName: string;
  date: string;
  fullDate: string;
  isWeekend: boolean;
  isToday: boolean;
  shift: { name: string; time: string; color: string } | null;
}

const buildWeekSchedule = (shifts: WorkShift[]): WeekDay[] => {
  const days: WeekDay[] = [];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday

  const shiftLabel =
    shifts.length > 0
      ? shifts.map((s) => s.name).join(' + ')
      : 'Chưa có ca';
  const shiftTimeRange =
    shifts.length > 0
      ? `${formatShiftTime(shifts[0].start_time)} - ${formatShiftTime(shifts[shifts.length - 1].end_time)}`
      : '--:-- - --:--';
  const shiftColor = shifts.length > 0 ? getShiftColor(0) : '#94A3B8';

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const isWeekend = i >= 5;
    const isToday =
      date.toISOString().split('T')[0] === today.toISOString().split('T')[0];

    days.push({
      dayName: DAY_NAMES[i],
      date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      fullDate: date.toISOString().split('T')[0],
      isWeekend,
      isToday,
      shift: isWeekend
        ? null
        : { name: shiftLabel, time: shiftTimeRange, color: shiftColor },
    });
  }
  return days;
};

// Upcoming holidays (static)
export const HOLIDAYS = [
  { date: '30/04/2026', name: 'Ngày Giải phóng miền Nam' },
  { date: '01/05/2026', name: 'Quốc tế Lao động' },
  { date: '02/09/2026', name: 'Quốc khánh' },
];

export const useWorkSchedule = () => {
  const navigation = useNavigation<any>();
  const { data, isLoading, error, refetch } = useGetActiveWorkShiftsQuery();

  const shifts = data?.data ?? [];
  const weekSchedule = useMemo(() => buildWeekSchedule(shifts), [shifts]);

  const goBack = () => navigation.goBack();

  return {
    shifts,
    isLoading,
    error,
    refetch,
    weekSchedule,
    goBack,
  };
};
