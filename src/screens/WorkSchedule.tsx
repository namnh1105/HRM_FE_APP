import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Mock shift data
const SHIFTS = [
  { id: '1', name: 'Ca sáng', startTime: '08:00', endTime: '12:00', color: '#3B82F6' },
  { id: '2', name: 'Ca chiều', startTime: '13:00', endTime: '17:00', color: '#8B5CF6' },
  { id: '3', name: 'Ca tối', startTime: '18:00', endTime: '22:00', color: '#F59E0B' },
];

// Mock weekly schedule
const getWeekSchedule = () => {
  const days = [];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday

  const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const isWeekend = i >= 5;
    const isToday =
      date.toISOString().split('T')[0] === today.toISOString().split('T')[0];

    days.push({
      dayName: dayNames[i],
      date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      fullDate: date.toISOString().split('T')[0],
      isWeekend,
      isToday,
      shift: isWeekend
        ? null
        : { name: 'Ca sáng + chiều', time: '08:00 - 17:00', color: '#3B82F6' },
    });
  }
  return days;
};

// Mock upcoming holidays
const HOLIDAYS = [
  { date: '30/04/2026', name: 'Ngày Giải phóng miền Nam' },
  { date: '01/05/2026', name: 'Quốc tế Lao động' },
  { date: '02/09/2026', name: 'Quốc khánh' },
];

const WorkSchedule: React.FC = () => {
  const navigation = useNavigation<any>();
  const weekSchedule = getWeekSchedule();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch làm việc</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Shifts Legend */}
        <Text style={styles.sectionTitle}>Ca làm việc</Text>
        <View style={styles.shiftsRow}>
          {SHIFTS.map((shift) => (
            <View key={shift.id} style={styles.shiftCard}>
              <View style={[styles.shiftDot, { backgroundColor: shift.color }]} />
              <View>
                <Text style={styles.shiftName}>{shift.name}</Text>
                <Text style={styles.shiftTime}>
                  {shift.startTime} - {shift.endTime}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Weekly Schedule */}
        <Text style={styles.sectionTitle}>Lịch tuần này</Text>
        <View style={styles.weekCard}>
          {weekSchedule.map((day, idx) => (
            <View
              key={idx}
              style={[
                styles.dayRow,
                day.isToday && styles.dayRowToday,
                idx < weekSchedule.length - 1 && styles.dayRowBorder,
              ]}
            >
              <View style={styles.dayLeft}>
                <Text
                  style={[
                    styles.dayName,
                    day.isToday && styles.dayNameToday,
                    day.isWeekend && styles.dayNameWeekend,
                  ]}
                >
                  {day.dayName}
                </Text>
                <Text style={styles.dayDate}>{day.date}</Text>
              </View>
              {day.shift ? (
                <View style={styles.dayShift}>
                  <View style={[styles.shiftIndicator, { backgroundColor: day.shift.color }]} />
                  <View>
                    <Text style={styles.dayShiftName}>{day.shift.name}</Text>
                    <Text style={styles.dayShiftTime}>{day.shift.time}</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.dayOff}>Nghỉ</Text>
              )}
            </View>
          ))}
        </View>

        {/* Holidays */}
        <Text style={styles.sectionTitle}>Ngày nghỉ lễ sắp tới</Text>
        {HOLIDAYS.map((h, idx) => (
          <View key={idx} style={styles.holidayCard}>
            <View style={styles.holidayIcon}>
              <Ionicons name="flag" size={18} color="#EF4444" />
            </View>
            <View style={styles.holidayInfo}>
              <Text style={styles.holidayName}>{h.name}</Text>
              <Text style={styles.holidayDate}>{h.date}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  // Shifts
  shiftsRow: {
    paddingHorizontal: 20,
  },
  shiftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  shiftDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  shiftName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  shiftTime: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  // Week
  weekCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dayRowToday: {
    backgroundColor: '#EFF6FF',
  },
  dayRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dayLeft: {
    flex: 1,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  dayNameToday: {
    color: '#3B82F6',
  },
  dayNameWeekend: {
    color: '#EF4444',
  },
  dayDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  dayShift: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shiftIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: 8,
  },
  dayShiftName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'right',
  },
  dayShiftTime: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'right',
  },
  dayOff: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  // Holidays
  holidayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  holidayIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  holidayInfo: {
    flex: 1,
  },
  holidayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  holidayDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
});

export default WorkSchedule;
