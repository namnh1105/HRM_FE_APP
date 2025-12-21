import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { DraftVideo } from '../types/api';
import { useVideoUpload } from '../hooks/useVideoUpload';
import { deleteDraftVideo, updateDraftVideo } from '../utils/draftVideoStorage';
import LoadingIndicator from '../components/LoadingIndicator';
import CustomAlert from '../components/CustomAlert';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

type UploadDraftRouteProp = RouteProp<{ params: { draft: DraftVideo } }, 'params'>;

const UploadDraft = () => {
  const navigation = useNavigation();
  const route = useRoute<UploadDraftRouteProp>();
  const { draft } = route.params;

  const [caption, setCaption] = useState(draft.caption || '');
  const [hashtags, setHashtags] = useState(draft.hashtags?.join(' ') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info' | 'warning'>('info');

  const { uploadVideo, isLoading: isUploading } = useVideoUpload();

  const handleUpload = async () => {
    setIsLoading(true);
    setLoadingMessage('Đang tải video lên...');

    try {
      // Parse hashtags from string to array
      const hashtagsArray = hashtags.trim()
        ? hashtags.split(/\s+/).map(tag => tag.replace(/^#/, '').trim()).filter(tag => tag.length > 0)
        : undefined;

      await uploadVideo({
        videoUri: draft.videoUri,
        thumbnailUri: draft.thumbnailUri,
        caption: caption.trim() || undefined,
        hashtags: hashtagsArray,
      });

      // Delete draft after successful upload
      await deleteDraftVideo(draft.id);

      setAlertTitle('Thành công');
      setAlertMessage('Video đã được đăng thành công!');
      setAlertType('success');
      setAlertVisible(true);

      // Navigate back after 2 seconds
      setTimeout(() => {
        setAlertVisible(false);
        navigation.goBack();
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setAlertTitle('Lỗi');
      setAlertMessage('Không thể tải video lên. Vui lòng thử lại');
      setAlertType('error');
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleSaveChanges = async () => {
    try {
      const hashtagsArray = hashtags.trim()
        ? hashtags.split(/\s+/).map(tag => tag.replace(/^#/, '').trim()).filter(tag => tag.length > 0)
        : undefined;

      await updateDraftVideo(draft.id, {
        caption: caption.trim() || undefined,
        hashtags: hashtagsArray,
      });

      Toast.show({
        type: 'success',
        text1: 'Đã cập nhật nháp',
      });

      navigation.goBack();
    } catch (error) {
      console.error('Update draft error:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật nháp');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xóa video nháp',
      'Bạn có chắc chắn muốn xóa video này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDraftVideo(draft.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa video nháp');
            }
          },
        },
      ]
    );
  };

  if (isLoading || isUploading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingIndicator />
        <Text style={styles.loadingText}>{loadingMessage || 'Đang xử lý...'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa video nháp</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={24} color="#ff3040" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.contentRow}>
          {/* Thumbnail Section */}
          <View style={styles.thumbnailSection}>
            {draft.thumbnailUri && (
              <Image source={{ uri: draft.thumbnailUri }} style={styles.thumbnail} />
            )}
            <View style={styles.draftBadge}>
              <Ionicons name="folder-outline" size={16} color="#fff" />
              <Text style={styles.draftBadgeText}>Nháp</Text>
            </View>
          </View>

          {/* Caption Input */}
          <View style={styles.inputSection}>
            <TextInput
              style={styles.captionInput}
              placeholder="Thêm mô tả..."
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={200}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Hashtags Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetag" size={20} color="#000" />
            <Text style={styles.sectionTitle}>Hashtag</Text>
          </View>
          <TextInput
            style={styles.hashtagInput}
            value={hashtags}
            onChangeText={setHashtags}
            maxLength={100}
            placeholderTextColor="#999"
            placeholder="Thêm hashtag..."
          />
        </View>

        {/* Created Date */}
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Ngày tạo:</Text>
          <Text style={styles.infoValue}>
            {new Date(draft.createdAt).toLocaleString('vi-VN')}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Ionicons name="save-outline" size={20} color="#000" />
          <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postButton} onPress={handleUpload}>
          <Text style={styles.postButtonText}>Đăng ngay</Text>
        </TouchableOpacity>
      </View>

      <Toast />
      <CustomAlert
        visible={alertVisible}
        message={alertMessage}
        title={alertTitle}
        onClose={() => setAlertVisible(false)}
        onConfirm={() => setAlertVisible(false)}
        confirmText="OK"
        type={alertType}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  scrollContent: {
    flex: 1,
  },
  contentRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  thumbnailSection: {
    marginRight: 12,
    position: 'relative',
  },
  thumbnail: {
    width: 100,
    height: 140,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  draftBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(254, 44, 85, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  draftBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  inputSection: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  captionInput: {
    fontSize: 16,
    color: '#000',
    textAlignVertical: 'top',
    minHeight: 140,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#000',
  },
  hashtagInput: {
    fontSize: 15,
    color: '#000',
    paddingVertical: 8,
  },
  infoSection: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  bottomButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
    gap: 6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  postButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 4,
    backgroundColor: '#FE2C55',
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default UploadDraft;
