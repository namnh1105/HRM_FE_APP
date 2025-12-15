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
import Toast from 'react-native-toast-message';
import LoadingIndicator from "../components/LoadingIndicator";
import CustomAlert from "../components/CustomAlert";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useVideoUpload } from "../hooks/useVideoUpload";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get('window');

export default function AddVideo() {
  const navigation = useNavigation();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();

  const ref = useRef<CameraView>(null);
  const [mode, setMode] = useState<CameraMode>("video");
  const [facing, setFacing] = useState<CameraType>("back");
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
      await uploadVideo({
        videoUri: recordedVideoUri,
        thumbnailUri: thumbnailUri,
        caption: caption.trim() || undefined,
        hashtags: hashtags.trim() || undefined,
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
      <CameraView
        style={styles.camera}
        ref={ref}
        mode={mode}
        facing={facing}
        mute={false}
      >
        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {recording ? `${formatTime(recordingTime)} / 1:00` : 'Sẵn sàng'}
          </Text>
          {recording && (
            <Animated.View style={[styles.recordingDot, { opacity: fadeAnim }]} />
          )}
        </View>
        
        {/* Controls */}
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

        {/* Record Button */}
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
      </CameraView>
    );
  };

  const renderCaptionInput = () => {
    return (
      <View style={styles.captionContainer}>
        <Text style={styles.captionTitle}>Thêm thông tin video</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Nhập tiêu đề video..."
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={200}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Thêm hashtags (VD: #funny #dance)"
          value={hashtags}
          onChangeText={setHashtags}
          maxLength={100}
        />

        <View style={styles.buttonRow}>
          <Pressable 
            style={[styles.actionButton, styles.cancelButton]} 
            onPress={() => {
              setShowCaptionInput(false);
              setRecordedVideoUri(null);
              setThumbnailUri(null);
              setCaption("");
              setHashtags("");
            }}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.actionButton, styles.uploadButton]} 
            onPress={handleUpload}
          >
            <Text style={styles.uploadButtonText}>Đăng video</Text>
          </Pressable>
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
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  captionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 50,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  uploadButton: {
    backgroundColor: '#007398',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
