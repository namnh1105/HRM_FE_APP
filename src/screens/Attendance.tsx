import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { checkIn, checkOut } from '../store/slices/attendanceSlice';

const Attendance: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { todayRecord, history } = useSelector((state: RootState) => state.attendance);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.authPrompt}>
          <Ionicons name="lock-closed-outline" size={64} color="#94A3B8" />
          <Text style={styles.authTitle}>Vui lòng đăng nhập</Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginBtnText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const timeStr = currentTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const dateStr = currentTime.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const handleCheckIn = () => {
    Alert.alert('Xác nhận chấm công vào', 'Bạn có muốn chấm công vào ngay bây giờ?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Chấm công',
        onPress: () => dispatch(checkIn()),
      },
    ]);
  };

  const handleCheckOut = () => {
    Alert.alert('Xác nhận chấm công ra', 'Bạn có muốn chấm công ra ngay bây giờ?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Chấm công',
        style: 'destructive',
        onPress: () => dispatch(checkOut()),
      },
    ]);
  };

  const isCheckedIn = todayRecord.status === 'checked_in';
  const isCheckedOut = todayRecord.status === 'checked_out';
  const canCheckIn = todayRecord.status === 'not_checked';
  const canCheckOut = isCheckedIn;

  const recentHistory = history.filter((r) => r.date !== todayRecord.date).slice(0, 5);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chấm công</Text>
        </View>

        {/* Clock */}
        <View style={styles.clockSection}>
          <Text style={styles.time}>{timeStr}</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>

        {/* Check-in / Check-out Button */}
        <View style={styles.buttonSection}>
          {canCheckIn && (
            <TouchableOpacity
              style={[styles.mainBtn, styles.checkInBtn]}
              onPress={handleCheckIn}
              activeOpacity={0.8}
            >
              <Ionicons name="finger-print" size={40} color="#FFF" />
              <Text style={styles.mainBtnText}>CHẤM CÔNG VÀO</Text>
            </TouchableOpacity>
          )}

          {canCheckOut && (
            <TouchableOpacity
              style={[styles.mainBtn, styles.checkOutBtn]}
              onPress={handleCheckOut}
              activeOpacity={0.8}
            >
              <Ionicons name="finger-print" size={40} color="#FFF" />
              <Text style={styles.mainBtnText}>CHẤM CÔNG RA</Text>
            </TouchableOpacity>
          )}

          {isCheckedOut && (
            <View style={[styles.mainBtn, styles.doneBtn]}>
              <Ionicons name="checkmark-circle" size={40} color="#FFF" />
              <Text style={styles.mainBtnText}>ĐÃ HOÀN THÀNH</Text>
            </View>
          )}
        </View>

        {/* Today Info */}
        <View style={styles.todayCard}>
          <Text style={styles.cardTitle}>Hôm nay</Text>
          <View style={styles.todayRow}>
            <View style={styles.todayItem}>
              <Ionicons name="log-in-outline" size={20} color="#3B82F6" />
              <Text style={styles.todayLabel}>Giờ vào</Text>
              <Text style={styles.todayValue}>
                {todayRecord.checkInTime || '--:--'}
              </Text>
            </View>
            <View style={styles.todayItem}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.todayLabel}>Giờ ra</Text>
              <Text style={styles.todayValue}>
                {todayRecord.checkOutTime || '--:--'}
              </Text>
            </View>
            <View style={styles.todayItem}>
              <Ionicons name="time-outline" size={20} color="#10B981" />
              <Text style={styles.todayLabel}>Tổng giờ</Text>
              <Text style={styles.todayValue}>
                {todayRecord.workHours != null ? `${todayRecord.workHours}h` : '--'}
              </Text>
            </View>
          </View>
        </View>

        {/* History */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lịch sử gần đây</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AttendanceHistory')}>
            <Text style={styles.seeAll}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {recentHistory.map((record) => (
          <View key={record.id} style={styles.historyCard}>
            <View style={styles.historyDate}>
              <Text style={styles.historyDateText}>{record.date}</Text>
            </View>
            <View style={styles.historyInfo}>
              <Text style={styles.historyTime}>
                {record.checkInTime || '--:--'} → {record.checkOutTime || '--:--'}
              </Text>
              <Text style={styles.historyHours}>
                {record.workHours != null ? `${record.workHours} giờ` : '--'}
              </Text>
            </View>
            <View
              style={[
                styles.historyStatus,
                {
                  backgroundColor:
                    record.status === 'checked_out' ? '#ECFDF5' : '#FEF3C7',
                },
              ]}
            >
              <Text
                style={[
                  styles.historyStatusText,
                  {
                    color:
                      record.status === 'checked_out' ? '#10B981' : '#F59E0B',
                  },
                ]}
              >
                {record.status === 'checked_out' ? '✓' : '•'}
              </Text>
            </View>
          </View>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  authTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 24,
  },
  loginBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
  },
  // Clock
  clockSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  time: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1E293B',
    fontVariant: ['tabular-nums'],
  },
  date: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  // Main Button
  buttonSection: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  mainBtn: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  checkInBtn: {
    backgroundColor: '#3B82F6',
  },
  checkOutBtn: {
    backgroundColor: '#EF4444',
  },
  doneBtn: {
    backgroundColor: '#10B981',
  },
  mainBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  // Today Card
  todayCard: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  todayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  todayItem: {
    alignItems: 'center',
  },
  todayLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  todayValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  // History
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  seeAll: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  historyDate: {
    marginRight: 12,
  },
  historyDateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  historyInfo: {
    flex: 1,
  },
  historyTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  historyHours: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  historyStatus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyStatusText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default Attendance;
