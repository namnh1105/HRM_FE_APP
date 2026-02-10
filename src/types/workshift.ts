// Work Shift types (matching backend WorkShiftResponse DTO)

export interface WorkShift {
  id: string;
  name: string;
  code: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  total_hours: number;
  description: string | null;
  is_active: boolean;
  is_night_shift: boolean;
  created_at: string;
  updated_at: string;
}

/** Frontend-only composite for calendar view */
export interface ScheduleDay {
  date: string;
  shift?: WorkShift;
  isHoliday: boolean;
  holidayName?: string;
  isWeekend: boolean;
}
