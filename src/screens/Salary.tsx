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
import { useSalary, formatVND } from '../hooks/useSalary';

const Salary: React.FC = () => {
  const {
    salaryHistory,
    isLoading,
    isError,
    selectedIndex,
    setSelectedIndex,
    selected,
    monthLabel,
    goBack,
  } = useSalary();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lương & phúc lợi</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Đang tải dữ liệu lương...</Text>
        </View>
      )}

      {isError && (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Không thể tải dữ liệu lương. Vui lòng thử lại.</Text>
        </View>
      )}

      {!isLoading && !isError && salaryHistory.length === 0 && (
        <View style={styles.centered}>
          <Ionicons name="document-text-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyText}>Chưa có dữ liệu lương.</Text>
        </View>
      )}

      {!isLoading && !isError && salaryHistory.length > 0 && (
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
              <Text style={styles.netValue}>{formatVND(selected.net_salary)}</Text>
              {selected.payment_date && (
                <Text style={styles.paidDate}>
                  Ngày trả: {new Date(selected.payment_date).toLocaleDateString('vi-VN')}
                </Text>
              )}
            </View>

            {/* Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thu nhập</Text>
              <DetailRow label="Lương cơ bản" value={selected.base_salary} color="#1E293B" />
              <DetailRow label="Phụ cấp" value={selected.allowance} color="#10B981" />
              <DetailRow label="Làm thêm giờ" value={selected.overtime_pay} color="#3B82F6" />
              <DetailRow label="Thưởng" value={selected.bonus} color="#8B5CF6" />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Khấu trừ</Text>
              <DetailRow label="BHXH" value={-selected.social_insurance} color="#EF4444" />
              <DetailRow label="BHYT" value={-selected.health_insurance} color="#EF4444" />
              <DetailRow label="BHTN" value={-selected.unemployment_insurance} color="#EF4444" />
              <DetailRow label="Thuế TNCN" value={-selected.personal_income_tax} color="#EF4444" />
              <DetailRow label="Khấu trừ khác" value={-(selected.total_deductions - selected.social_insurance - selected.health_insurance - selected.unemployment_insurance - selected.personal_income_tax)} color="#EF4444" />
            </View>

            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng thực nhận</Text>
              <Text style={styles.totalValue}>{formatVND(selected.net_salary)}</Text>
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
      )}
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
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94A3B8',
  },
});

export default Salary;
