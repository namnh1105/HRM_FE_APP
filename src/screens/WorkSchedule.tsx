import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useWorkSchedule,
  HOLIDAYS,
} from '../hooks/useWorkSchedule';

const WorkSchedule: React.FC = () => {
  const {
    todayShifts,
    isLoading,
    error,
    refetch,
    weekSchedule,
    goBack,
  } = useWorkSchedule();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch làm việc</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Đang tải lịch làm việc...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Không thể tải dữ liệu</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Today's Shifts */}
        {todayShifts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Ca hôm nay</Text>
            <View style={styles.todayCard}>
              {todayShifts.map((s, idx) => (
                  <View style={[styles.shiftDot, { backgroundColor: s.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.todayShiftName}>{s.name}</Text>
                    {s.employeeName && (
                      <Text style={styles.employeeNameText}>{s.employeeName}</Text>
                    )}
                    {s.isUnderstaffed && (
                      <View style={styles.warningRow}>
                        <Ionicons name="alert-circle" size={12} color="#EF4444" />
                        <Text style={styles.warningText}>Thiếu nhân sự</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.todayShiftTime}>{s.time}</Text>
                </View>
              ))}
            </View>
          </>
        )}

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
              {day.shifts.length > 0 ? (
                <View style={styles.dayShifts}>
                  {day.shifts.map((s, sIdx) => (
                    <View key={sIdx} style={styles.dayShift}>
                      <View style={[styles.shiftIndicator, { backgroundColor: s.color }]} />
                      <View>
                        <Text style={styles.dayShiftName}>{s.name}</Text>
                        {s.employeeName && (
                          <Text style={styles.dayEmployeeName}>{s.employeeName}</Text>
                        )}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                          {s.isUnderstaffed && (
                            <Ionicons name="alert-circle" size={10} color="#EF4444" />
                          )}
                          <Text style={styles.dayShiftTime}>{s.time}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
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
      )}
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
  // Loading / Error
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  errorText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  // Today's shifts
  todayCard: {
    marginHorizontal: 20,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  todayShiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  todayShiftName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
  },
  employeeNameText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  warningText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#EF4444',
  },
  todayShiftTime: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
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
  dayShifts: {
    alignItems: 'flex-end',
    gap: 6,
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
  dayEmployeeName: {
    fontSize: 11,
    color: '#64748B',
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
