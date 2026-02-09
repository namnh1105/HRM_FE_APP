import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import type { AttendanceRecord } from '../types/hrm';

const AttendanceHistory: React.FC = () => {
  const navigation = useNavigation<any>();
  const { history } = useSelector((state: RootState) => state.attendance);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'checked_out':
        return { label: 'Hoàn thành', color: '#10B981', bg: '#ECFDF5' };
      case 'checked_in':
        return { label: 'Đang làm', color: '#3B82F6', bg: '#EFF6FF' };
      default:
        return { label: 'Chưa chấm', color: '#F59E0B', bg: '#FEF3C7' };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const dayName = dayNames[date.getDay()];
    return {
      dayName,
      day: String(date.getDate()).padStart(2, '0'),
      month: String(date.getMonth() + 1).padStart(2, '0'),
    };
  };

  const renderItem = ({ item }: { item: AttendanceRecord }) => {
    const statusInfo = getStatusInfo(item.status);
    const dateInfo = formatDate(item.date);

    return (
      <View style={styles.card}>
        <View style={styles.dateBox}>
          <Text style={styles.dayName}>{dateInfo.dayName}</Text>
          <Text style={styles.dayNum}>{dateInfo.day}</Text>
          <Text style={styles.monthNum}>{dateInfo.month}</Text>
        </View>
        <View style={styles.info}>
          <View style={styles.timeRow}>
            <Ionicons name="log-in-outline" size={16} color="#3B82F6" />
            <Text style={styles.timeText}>{item.checkInTime || '--:--'}</Text>
            <Ionicons name="arrow-forward" size={14} color="#CBD5E1" style={{ marginHorizontal: 6 }} />
            <Ionicons name="log-out-outline" size={16} color="#EF4444" />
            <Text style={styles.timeText}>{item.checkOutTime || '--:--'}</Text>
          </View>
          <Text style={styles.hoursText}>
            {item.workHours != null ? `${item.workHours} giờ làm việc` : 'Chưa có dữ liệu'}
          </Text>
          {item.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color="#94A3B8" />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử chấm công</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {history.filter((r) => r.status === 'checked_out').length}
          </Text>
          <Text style={styles.summaryLabel}>Ngày đi làm</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: '#10B981' }]}>
            {history.reduce((sum, r) => sum + (r.workHours || 0), 0).toFixed(1)}h
          </Text>
          <Text style={styles.summaryLabel}>Tổng giờ</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
            {history.filter((r) => r.status === 'not_checked').length}
          </Text>
          <Text style={styles.summaryLabel}>Chưa chấm</Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
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
  // Summary
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3B82F6',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  dateBox: {
    width: 48,
    alignItems: 'center',
    marginRight: 12,
  },
  dayName: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  dayNum: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  monthNum: {
    fontSize: 11,
    color: '#94A3B8',
  },
  info: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 4,
  },
  hoursText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default AttendanceHistory;
