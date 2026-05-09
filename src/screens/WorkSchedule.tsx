import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useWorkSchedule,
  HOLIDAYS,
} from '../hooks/useWorkSchedule';
import { useGetAllEmployeesQuery } from '../store/api/employeeApi';

const WorkSchedule: React.FC = () => {
  const {
    shifts,
    todayShifts,
    isLoading,
    isAssigning,
    error,
    refetch,
    weekSchedule,
    assignWorkShift,
    isManager,
    goBack,
  } = useWorkSchedule();

  const { data: employeeRes } = useGetAllEmployeesQuery();
  const allEmployees = employeeRes?.data ?? [];

  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [selectedShiftIds, setSelectedShiftIds] = useState<string[]>([]);
  const [employeeQuery, setEmployeeQuery] = useState('');
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [shiftQuery, setShiftQuery] = useState('');
  const [showShiftDropdown, setShowShiftDropdown] = useState(false);

  const toLocalDateStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const todayStr = toLocalDateStr(new Date());
  const isPastDate = (dateStr: string) => dateStr < todayStr;

  const filteredEmployees = allEmployees.filter((emp) => {
    const query = employeeQuery.trim().toLowerCase();
    if (!query) return true;
    const name = (emp.fullName || '').toLowerCase();
    const code = (emp.employeeCode || '').toLowerCase();
    return name.includes(query) || code.includes(query);
  });

  const filteredShifts = shifts.filter((s) => {
    const query = shiftQuery.trim().toLowerCase();
    if (!query) return true;
    return s.name.toLowerCase().includes(query) || s.code?.toLowerCase()?.includes(query);
  });

  const handleAssign = async () => {
    if (!selectedDay || selectedEmployeeIds.length === 0 || selectedShiftIds.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn đầy đủ thông tin');
      return;
    }

    if (isPastDate(selectedDay)) {
      Alert.alert('Thông báo', 'Không thể gán ca cho ngày đã qua');
      return;
    }

    try {
      const tasks: Promise<any>[] = [];
      selectedEmployeeIds.forEach((employeeId) => {
        selectedShiftIds.forEach((workShiftId) => {
          tasks.push(assignWorkShift(employeeId, workShiftId, selectedDay));
        });
      });
      await Promise.all(tasks);
      Alert.alert('Thành công', 'Đã gán ca làm việc cho nhân viên');
      setAssignModalVisible(false);
      setSelectedEmployeeIds([]);
      setSelectedShiftIds([]);
      setEmployeeQuery('');
      setShowEmployeeDropdown(false);
      setShiftQuery('');
      setShowShiftDropdown(false);
    } catch (err: any) {
      Alert.alert('Lỗi', err.data?.message || 'Không thể gán ca làm việc');
    }
  };

  const openAssignModal = (date: string) => {
    if (isPastDate(date)) {
      Alert.alert('Thông báo', 'Không thể gán ca cho ngày đã qua');
      return;
    }
    setSelectedDay(date);
    setSelectedEmployeeIds([]);
    setSelectedShiftIds([]);
    setEmployeeQuery('');
    setShowEmployeeDropdown(false);
    setShiftQuery('');
    setShowShiftDropdown(false);
    setAssignModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch làm việc</Text>
        <TouchableOpacity onPress={refetch} disabled={isLoading}>
          <Ionicons name="refresh" size={22} color="#1E293B" />
        </TouchableOpacity>
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
                <View key={idx} style={styles.todayShiftRow}>
                  <View style={[styles.shiftDot, { backgroundColor: s.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.todayShiftName}>{s.name}</Text>
                    <Text style={styles.employeeNameText}>{s.employees.join(', ')}</Text>
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
                {isManager && (
                  <TouchableOpacity 
                    style={styles.addBtn}
                    disabled={isPastDate(day.fullDate)}
                    onPress={() => openAssignModal(day.fullDate)}
                  >
                    <Ionicons name="add-circle-outline" size={16} color={isPastDate(day.fullDate) ? '#94A3B8' : '#3B82F6'} />
                    <Text style={[styles.addText, isPastDate(day.fullDate) && styles.addTextDisabled]}>Gán ca</Text>
                  </TouchableOpacity>
                )}
              </View>
              {day.shifts.length > 0 ? (
                <View style={styles.dayShifts}>
                  {day.shifts.map((s, sIdx) => (
                    <View key={sIdx} style={styles.dayShift}>
                      <View style={[styles.shiftIndicator, { backgroundColor: s.color }]} />
                      <View>
                        <Text style={styles.dayShiftName}>{s.name}</Text>
                        <Text style={styles.dayEmployeeName}>{s.employees.join(', ')}</Text>
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

        {/* Modal for Assigning Shift */}
        <Modal
          visible={assignModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setAssignModalVisible(false);
            setShowEmployeeDropdown(false);
            setShowShiftDropdown(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Gán ca làm việc</Text>
              <Text style={styles.modalSub}>Ngày: {selectedDay}</Text>

              <Text style={styles.inputLabel}>Nhân viên</Text>
              <View style={[styles.dropdownContainer, { zIndex: 20 }]}>
                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() => {
                    setShowEmployeeDropdown((prev) => !prev);
                    setShowShiftDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownTriggerText}>
                    {selectedEmployeeIds.length > 0
                      ? `Đã chọn ${selectedEmployeeIds.length} nhân viên`
                      : 'Chọn nhân viên'}
                  </Text>
                  <Ionicons
                    name={showEmployeeDropdown ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#64748B"
                  />
                </TouchableOpacity>
                {showEmployeeDropdown && (
                  <View style={styles.dropdownPanel}>
                    <TextInput
                      placeholder="Tìm nhân viên..."
                      value={employeeQuery}
                      onChangeText={(text) => {
                        setEmployeeQuery(text);
                      }}
                      style={styles.searchInput}
                    />
                    {selectedEmployeeIds.length > 0 && (
                      <View style={styles.selectedChips}>
                        {selectedEmployeeIds.map((id) => {
                          const emp = allEmployees.find((e) => e.id === id);
                          if (!emp) return null;
                          return (
                            <TouchableOpacity
                              key={id}
                              style={styles.chip}
                              onPress={() =>
                                setSelectedEmployeeIds((prev) => prev.filter((x) => x !== id))
                              }
                            >
                              <Text style={styles.chipText}>{emp.fullName}</Text>
                              <Ionicons name="close" size={14} color="#64748B" />
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                    <View style={styles.dropdownList}>
                      <ScrollView style={{ maxHeight: 180 }} keyboardShouldPersistTaps="handled">
                        {filteredEmployees.length === 0 ? (
                          <Text style={styles.emptyText}>Không tìm thấy nhân viên</Text>
                        ) : (
                          filteredEmployees.map((emp) => (
                            <TouchableOpacity
                              key={emp.id}
                              style={[styles.dropdownItem, selectedEmployeeIds.includes(emp.id) && styles.dropdownItemActive]}
                              onPress={() => {
                                setSelectedEmployeeIds((prev) =>
                                  prev.includes(emp.id)
                                    ? prev.filter((x) => x !== emp.id)
                                    : [...prev, emp.id]
                                );
                              }}
                            >
                              <Text style={[styles.dropdownItemText, selectedEmployeeIds.includes(emp.id) && styles.dropdownItemTextActive]}>
                                {emp.fullName}
                              </Text>
                            </TouchableOpacity>
                          ))
                        )}
                      </ScrollView>
                    </View>
                  </View>
                )}
              </View>

              <Text style={styles.inputLabel}>Ca làm việc</Text>
              <View style={[styles.dropdownContainer, { zIndex: 10 }]}>
                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() => {
                    setShowShiftDropdown((prev) => !prev);
                    setShowEmployeeDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownTriggerText}>
                    {selectedShiftIds.length > 0
                      ? `Đã chọn ${selectedShiftIds.length} ca`
                      : 'Chọn ca làm việc'}
                  </Text>
                  <Ionicons
                    name={showShiftDropdown ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#64748B"
                  />
                </TouchableOpacity>
                {showShiftDropdown && (
                  <View style={styles.dropdownPanel}>
                    <TextInput
                      placeholder="Tìm ca làm việc..."
                      value={shiftQuery}
                      onChangeText={(text) => {
                        setShiftQuery(text);
                      }}
                      style={styles.searchInput}
                    />
                    {selectedShiftIds.length > 0 && (
                      <View style={styles.selectedChips}>
                        {selectedShiftIds.map((id) => {
                          const shift = shifts.find((s) => s.id === id);
                          if (!shift) return null;
                          return (
                            <TouchableOpacity
                              key={id}
                              style={styles.chip}
                              onPress={() =>
                                setSelectedShiftIds((prev) => prev.filter((x) => x !== id))
                              }
                            >
                              <Text style={styles.chipText}>
                                {shift.name} ({shift.startTime.slice(0, 5)} - {shift.endTime.slice(0, 5)})
                              </Text>
                              <Ionicons name="close" size={14} color="#64748B" />
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                    <View style={styles.dropdownList}>
                      <ScrollView style={{ maxHeight: 180 }} keyboardShouldPersistTaps="handled">
                        {filteredShifts.length === 0 ? (
                          <Text style={styles.emptyText}>Không có ca làm việc</Text>
                        ) : (
                          filteredShifts.map((s) => (
                            <TouchableOpacity
                              key={s.id}
                              style={[styles.dropdownItem, selectedShiftIds.includes(s.id) && styles.dropdownItemActive]}
                              onPress={() => {
                                setSelectedShiftIds((prev) =>
                                  prev.includes(s.id)
                                    ? prev.filter((x) => x !== s.id)
                                    : [...prev, s.id]
                                );
                              }}
                            >
                              <Text style={[styles.dropdownItemText, selectedShiftIds.includes(s.id) && styles.dropdownItemTextActive]}>
                                {s.name} ({s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)})
                              </Text>
                            </TouchableOpacity>
                          ))
                        )}
                      </ScrollView>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setAssignModalVisible(false);
                    setShowEmployeeDropdown(false);
                    setShowShiftDropdown(false);
                  }}
                >
                  <Text style={styles.cancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, isAssigning && { opacity: 0.7 }]}
                  onPress={handleAssign}
                  disabled={isAssigning}
                >
                  {isAssigning ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.confirmText}>Xác nhận</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
  shiftDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
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
  // Add & Modal
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  addText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 4,
  },
  addTextDisabled: {
    color: '#94A3B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  dropdownContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  dropdownTriggerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  dropdownPanel: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 10,
    backgroundColor: '#FFF',
    padding: 10,
    zIndex: 50,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#334155',
    backgroundColor: '#FFF',
  },
  dropdownList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFF',
  },
  selectedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
  },
  chipText: {
    fontSize: 12,
    color: '#334155',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemActive: {
    backgroundColor: '#3B82F6',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#334155',
  },
  dropdownItemTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerItemActive: {
    backgroundColor: '#3B82F6',
  },
  pickerItemText: {
    fontSize: 14,
    color: '#334155',
  },
  pickerItemTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  emptyText: {
    padding: 12,
    fontSize: 13,
    color: '#94A3B8',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#3B82F6',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default WorkSchedule;
