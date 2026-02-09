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
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import type { SalaryDetail } from '../types/hrm';

const formatVND = (amount: number) =>
  amount.toLocaleString('vi-VN') + ' ₫';

const Salary: React.FC = () => {
  const navigation = useNavigation<any>();
  const { salaryHistory } = useSelector((state: RootState) => state.salary);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const selected: SalaryDetail | undefined = salaryHistory[selectedIndex];

  const monthLabel = (s: SalaryDetail) =>
    `Tháng ${String(s.month).padStart(2, '0')}/${s.year}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lương & phúc lợi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Month Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthRow}
        >
          {salaryHistory.map((s, idx) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.monthChip, selectedIndex === idx && styles.monthChipActive]}
              onPress={() => setSelectedIndex(idx)}
            >
              <Text
                style={[
                  styles.monthText,
                  selectedIndex === idx && styles.monthTextActive,
                ]}
              >
                {monthLabel(s)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selected && (
          <>
            {/* Net Salary Card */}
            <View style={styles.netCard}>
              <Text style={styles.netLabel}>Lương thực nhận</Text>
              <Text style={styles.netValue}>{formatVND(selected.netSalary)}</Text>
              {selected.paidDate && (
                <Text style={styles.paidDate}>
                  Ngày trả: {new Date(selected.paidDate).toLocaleDateString('vi-VN')}
                </Text>
              )}
            </View>

            {/* Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thu nhập</Text>
              <DetailRow label="Lương cơ bản" value={selected.baseSalary} color="#1E293B" />
              <DetailRow label="Phụ cấp" value={selected.allowance} color="#10B981" />
              <DetailRow label="Làm thêm giờ" value={selected.overtime} color="#3B82F6" />
              <DetailRow label="Thưởng" value={selected.bonus} color="#8B5CF6" />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Khấu trừ</Text>
              <DetailRow label="Khấu trừ khác" value={-selected.deduction} color="#EF4444" />
              <DetailRow label="Bảo hiểm" value={-selected.insurance} color="#EF4444" />
              <DetailRow label="Thuế TNCN" value={-selected.tax} color="#EF4444" />
            </View>

            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng thực nhận</Text>
              <Text style={styles.totalValue}>{formatVND(selected.netSalary)}</Text>
            </View>

            {/* Download */}
            <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.7}>
              <Ionicons name="download-outline" size={20} color="#3B82F6" />
              <Text style={styles.downloadText}>Tải phiếu lương (PDF)</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Reusable row
const DetailRow = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <View style={detailStyles.row}>
    <Text style={detailStyles.label}>{label}</Text>
    <Text style={[detailStyles.value, { color }]}>
      {value >= 0 ? '+' : ''}{formatVND(Math.abs(value))}
    </Text>
  </View>
);

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  label: {
    fontSize: 14,
    color: '#64748B',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
});

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
  // Month selector
  monthRow: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  monthChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  monthChipActive: {
    backgroundColor: '#3B82F6',
  },
  monthText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  monthTextActive: {
    color: '#FFF',
  },
  // Net Card
  netCard: {
    marginHorizontal: 20,
    backgroundColor: '#1E40AF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  netLabel: {
    fontSize: 14,
    color: '#93C5FD',
  },
  netValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 4,
  },
  paidDate: {
    fontSize: 12,
    color: '#93C5FD',
    marginTop: 8,
  },
  // Sections
  section: {
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  // Total
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669',
  },
  // Download
  downloadBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  downloadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 8,
  },
});

export default Salary;
