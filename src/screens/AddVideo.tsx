import React, { useRef, useState, useEffect } from "react";
import {
  Alert,
  Animated,
  Button,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import * as MediaLibrary from 'expo-media-library';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import LoadingIndicator from "../components/LoadingIndicator";
import CustomAlert from "../components/CustomAlert";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useVideoUpload } from "../hooks/useVideoUpload";
import { useNavigation } from "@react-navigation/native";
import { saveDraftVideo } from "../utils/draftVideoStorage";

const { width, height } = Dimensions.get('window');

export default function AddVideo() {
  const navigation = useNavigation();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();

  const ref = useRef<CameraView>(null);
  const [mode, setMode] = useState<CameraMode>("video");
  const [facing, setFacing] = useState<CameraType>("front");
  const [recording, setRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  // States for CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info' | 'warning'>('info');

  // Video upload hook
  const { uploadVideo, isLoading: isUploading } = useVideoUpload();

  // States for video metadata
  const [showCaptionInput, setShowCaptionInput] = useState(false);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);

  useEffect(() => {
    if (!micPermission?.granted) {
      requestMicPermission();
    }
    if (!mediaLibraryPermission?.granted) {
      requestMediaLibraryPermission();
    }
  }, [micPermission, mediaLibraryPermission]);

  // Recording timer
  useEffect(() => {
    if (recording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          // Auto stop at 60 seconds
          if (newTime >= 60) {
            ref.current?.stopRecording();
            setRecording(false);
          }
          return newTime;
        });
      }, 1000);

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setRecordingTime(0);
      fadeAnim.setValue(1);
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [recording]);

  if (!cameraPermission || !micPermission || !mediaLibraryPermission) return null;

  if (!cameraPermission.granted || !micPermission.granted || !mediaLibraryPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Chúng tôi cần quyền truy cập camera, microphone và thư viện
        </Text>
        {!cameraPermission.granted && (
          <Button onPress={requestCameraPermission} title="Cấp quyền Camera" />
        )}
        {!micPermission.granted && (
          <Button onPress={requestMicPermission} title="Cấp quyền Microphone" />
        )}
        {!mediaLibraryPermission.granted && (
          <Button onPress={requestMediaLibraryPermission} title="Cấp quyền Thư viện" />
        )}
      </View>
    );
  }

  const generateThumbnail = async (videoUri: string): Promise<string> => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: 1000,
      });
      return uri;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw error;
    }
  };

  const recordVideo = async () => {
    if (recording) {
      setRecording(false);
      ref.current?.stopRecording();
      return;
    }

    setRecording(true);
    Toast.show({
      type: 'info',
      text1: 'Đang quay video',
      text2: 'Tối đa 60 giây',
      visibilityTime: 3000,
    });

    try {
      const video = await ref.current?.recordAsync();
      
      if (!video) {
        setAlertTitle("Lỗi");
        setAlertMessage("Không thể quay video. Vui lòng thử lại");
        setAlertType("error");
        setAlertVisible(true);
        setRecording(false);
        return;
      }
      
      setIsLoading(true);
      setLoadingMessage("Đang xử lý video...");
      
      // Save to media library
      await MediaLibrary.createAssetAsync(video.uri);
      
      // Generate thumbnail
      setLoadingMessage("Đang tạo thumbnail...");
      const thumb = await generateThumbnail(video.uri);
      
      setRecordedVideoUri(video.uri);
      setThumbnailUri(thumb);
      setIsLoading(false);
      setShowCaptionInput(true);
      
      Toast.show({
        type: 'success',
        text1: 'Video đã được lưu',
        text2: 'Thêm tiêu đề và hashtag',
      });
      
    } catch (e) {
      console.error("Error recording video:", e);
      setAlertTitle("Lỗi");
      setAlertMessage("Đã xảy ra lỗi trong quá trình quay video");
      setAlertType("error");
      setAlertVisible(true);
      setRecording(false);
      setIsLoading(false);
    }
  };

  const handlePickThumbnail = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setThumbnailUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking thumbnail:', error);
    }
  };

  const handleHashtagChange = (text: string) => {
    setHashtags(text);
  };

  const handleUpload = async () => {
    if (!recordedVideoUri || !thumbnailUri) {
      setAlertTitle("Lỗi");
      setAlertMessage("Vui lòng quay video trước");
      setAlertType("error");
      setAlertVisible(true);
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Đang tải video lên...");

    try {
      // Parse hashtags from string to array
      const hashtagsArray = hashtags.trim()
        ? hashtags.split(/\s+/).map(tag => tag.replace(/^#/, '').trim()).filter(tag => tag.length > 0)
        : undefined;

      await uploadVideo({
        videoUri: recordedVideoUri,
        thumbnailUri: thumbnailUri,
        caption: caption.trim() || undefined,
        hashtags: hashtagsArray,
      });

      setAlertTitle("Thành công");
      setAlertMessage("Quay video thành công!");
      setAlertType("success");
      setAlertVisible(true);

      // Reset states
      setRecordedVideoUri(null);
      setThumbnailUri(null);
      setCaption("");
      setHashtags("");
      setShowCaptionInput(false);

      // Navigate back after 2 seconds
      setTimeout(() => {
        setAlertVisible(false);
        navigation.goBack();
      }, 2000);

    } catch (error) {
      console.error("Upload error:", error);
      setAlertTitle("Lỗi");
      setAlertMessage("Không thể tải video lên. Vui lòng thử lại");
      setAlertType("error");
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleSaveDraft = async () => {
    if (!recordedVideoUri || !thumbnailUri) {
      setAlertTitle("Lỗi");
      setAlertMessage("Vui lòng quay video trước");
      setAlertType("error");
      setAlertVisible(true);
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Đang lưu nháp...");

    try {
      // Parse hashtags from string to array
      const hashtagsArray = hashtags.trim()
        ? hashtags.split(/\s+/).map(tag => tag.replace(/^#/, '').trim()).filter(tag => tag.length > 0)
        : undefined;

      await saveDraftVideo(
        recordedVideoUri,
        thumbnailUri,
        caption.trim() || undefined,
        hashtagsArray
      );

      setAlertTitle("Thành công");
      setAlertMessage("Đã lưu video vào nháp!");
      setAlertType("success");
      setAlertVisible(true);

      // Reset states
      setRecordedVideoUri(null);
      setThumbnailUri(null);
      setCaption("");
      setHashtags("");
      setShowCaptionInput(false);

      // Navigate back after 1.5 seconds
      setTimeout(() => {
        setAlertVisible(false);
        navigation.goBack();
      }, 1500);

    } catch (error) {
      console.error("Save draft error:", error);
      setAlertTitle("Lỗi");
      setAlertMessage("Không thể lưu nháp. Vui lòng thử lại");
      setAlertType("error");
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === "back" ? "front" : "back"));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderCamera = () => {
    return (
      <View style={styles.cameraWrapper}>
        <CameraView
          style={styles.camera}
          ref={ref}
          mode={mode}
          facing={facing}
          mute={false}
        />
        
        {/* Timer - Overlay on top */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {recording ? `${formatTime(recordingTime)} / 1:00` : 'Sẵn sàng'}
          </Text>
          {recording && (
            <Animated.View style={[styles.recordingDot, { opacity: fadeAnim }]} />
          )}
        </View>
        
        {/* Controls - Overlay on top */}
        <View style={styles.controlsContainer}>
          <Pressable 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={28} color="white" />
          </Pressable>
          
          <Pressable 
            style={styles.flipButton} 
            onPress={toggleCameraFacing}
          >
            <Ionicons name="camera-reverse" size={28} color="white" />
          </Pressable>
        </View>

        {/* Record Button - Overlay on top */}
        <View style={styles.shutterContainer}>
          <Pressable onPress={recordVideo}>
            {recording ? (
              <View style={styles.stopRecordButton}>
                <View style={styles.stopRecordInner} />
              </View>
            ) : (
              <View style={styles.shutterBtn}>
                <View style={styles.shutterBtnInner} />
              </View>
            )}
          </Pressable>
        </View>
      </View>
    );
  };

  const renderCaptionInput = () => {
    return (
      <View style={styles.captionContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            setShowCaptionInput(false);
            setRecordedVideoUri(null);
            setThumbnailUri(null);
            setCaption("");
            setHashtags("");
          }}>
            <Ionicons name="close" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo bài đăng</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.scrollContent}>
          {/* Video Preview and Caption */}
          <View style={styles.contentRow}>
            <View style={styles.thumbnailSection}>
              <Image
                source={{ uri: thumbnailUri || '' }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
              <View style={styles.thumbnailActions}>
                <TouchableOpacity 
                  style={styles.thumbnailButton}
                  onPress={handlePickThumbnail}
                >
                  <Text style={styles.thumbnailButtonText}>Sửa ảnh bìa</Text>
                </TouchableOpacity>
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
              onChangeText={handleHashtagChange}
              maxLength={100}
              placeholderTextColor="#999"
            />
          </View>
        </ScrollView>

        {/* Bottom Buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity 
            style={styles.draftButton}
            onPress={handleSaveDraft}
          >
            <Ionicons name="folder-outline" size={20} color="#000" />
            <Text style={styles.draftButtonText}>Nháp</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.postButton}
            onPress={handleUpload}
          >
            <Text style={styles.postButtonText}>Đăng</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading || isUploading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingIndicator />
        <Text style={styles.loadingText}>{loadingMessage || "Đang xử lý..."}</Text>
      </View>
    );
  }

  if (showCaptionInput) {
    return (
      <View style={styles.container}>
        {renderCaptionInput()}
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
  }

  return (
    <View style={styles.container}>
      {renderCamera()}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraWrapper: {
    flex: 1,
    width: "100%",
    position: 'relative',
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  permissionText: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
    color: "#fff",
    paddingHorizontal: 20,
  },
  timerContainer: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 20,
  },
  timerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'red',
    marginLeft: 8,
  },
  controlsContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 25,
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 25,
  },
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    right: 0,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "red",
  },
  stopRecordButton: {
    backgroundColor: 'red',
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: 'white',
  },
  stopRecordInner: {
    width: 30,
    height: 30,
    backgroundColor: 'white',
    borderRadius: 5,
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
  captionContainer: {
    flex: 1,
    width: width,
    backgroundColor: '#fff',
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
  },
  thumbnail: {
    width: 100,
    height: 140,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  thumbnailActions: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  thumbnailButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  thumbnailButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
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
  bottomButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  draftButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
    gap: 6,
  },
  draftButtonText: {
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
