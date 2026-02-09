import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { addRequest } from '../store/slices/leaveSlice';
import type { LeaveType } from '../types/hrm';
import { LEAVE_TYPE_LABELS } from '../types/hrm';

const LEAVE_TYPES: { value: LeaveType; icon: string }[] = [
  { value: 'annual_leave', icon: 'sunny' },
  { value: 'sick_leave', icon: 'medkit' },
  { value: 'business_trip', icon: 'airplane' },
  { value: 'overtime', icon: 'time' },
  { value: 'other', icon: 'document-text' },
];

const CreateLeaveRequest: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const [selectedType, setSelectedType] = useState<LeaveType>('annual_leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!startDate.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập ngày bắt đầu (DD/MM/YYYY)');
      return;
    }
    if (!reason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do');
      return;
    }

    // Parse date from DD/MM/YYYY format
    const parseDate = (str: string) => {
      const parts = str.split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      return str;
    };

    dispatch(
      addRequest({
        type: selectedType,
        startDate: parseDate(startDate),
        endDate: endDate.trim() ? parseDate(endDate) : parseDate(startDate),
        reason: reason.trim(),
      }),
    );

    Alert.alert('Thành công', 'Đơn đã được gửi, chờ duyệt.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo đơn mới</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Leave Type Selection */}
        <Text style={styles.label}>Loại đơn</Text>
        <View style={styles.typeGrid}>
          {LEAVE_TYPES.map((lt) => (
            <TouchableOpacity
              key={lt.value}
              style={[
                styles.typeCard,
                selectedType === lt.value && styles.typeCardActive,
              ]}
              onPress={() => setSelectedType(lt.value)}
            >
              <Ionicons
                name={lt.icon as any}
                size={22}
                color={selectedType === lt.value ? '#3B82F6' : '#94A3B8'}
              />
              <Text
                style={[
                  styles.typeLabel,
                  selectedType === lt.value && styles.typeLabelActive,
                ]}
                numberOfLines={1}
              >
                {LEAVE_TYPE_LABELS[lt.value]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Start Date */}
        <Text style={styles.label}>Ngày bắt đầu</Text>
        <View style={styles.inputRow}>
          <Ionicons name="calendar-outline" size={20} color="#94A3B8" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.input}
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#CBD5E1"
            value={startDate}
            onChangeText={setStartDate}
            keyboardType="default"
          />
        </View>

        {/* End Date */}
        <Text style={styles.label}>Ngày kết thúc (nếu khác)</Text>
        <View style={styles.inputRow}>
          <Ionicons name="calendar-outline" size={20} color="#94A3B8" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.input}
            placeholder="DD/MM/YYYY (tùy chọn)"
            placeholderTextColor="#CBD5E1"
            value={endDate}
            onChangeText={setEndDate}
            keyboardType="default"
          />
        </View>

        {/* Reason */}
        <Text style={styles.label}>Lý do</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Nhập lý do..."
          placeholderTextColor="#CBD5E1"
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Submit */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
          <Ionicons name="paper-plane" size={20} color="#FFF" />
          <Text style={styles.submitText}>Gửi đơn</Text>
        </TouchableOpacity>
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
  // Form
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    marginTop: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeCard: {
    width: '30%',
    marginRight: '3.33%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  typeCardActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'center',
  },
  typeLabelActive: {
    color: '#3B82F6',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#1E293B',
  },
  textArea: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1E293B',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 32,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default CreateLeaveRequest;
