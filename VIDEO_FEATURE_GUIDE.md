# Tính năng Thêm Video - Hướng dẫn Sử dụng

## Tổng quan
Tính năng cho phép người dùng quay video trực tiếp từ camera, chọn thumbnail, và đăng video lên hệ thống với caption và hashtags.

## Các thay đổi đã thực hiện

### 1. Cài đặt thư viện
```bash
npx expo install expo-camera expo-image-picker expo-video-thumbnails
```

**Thư viện đã thêm:**
- `expo-camera`: Quay video và chụp ảnh
- `expo-image-picker`: Chọn ảnh từ thư viện
- `expo-video-thumbnails`: Tạo thumbnail từ video

### 2. Cập nhật API

**File: `src/store/api/videoApi.ts`**
- Thêm endpoint `createVideo` với mutation để upload video
- Sử dụng FormData để gửi video, thumbnail, caption, hashtags
- Tự động thêm Bearer token từ AsyncStorage

**Body của API:**
```typescript
{
  video: File (required) - File video định dạng mp4
  thumbnail: File (required) - File ảnh thumbnail định dạng jpeg/jpg
  caption: string (optional) - Mô tả video
  hashtags: string (optional) - Các hashtag, VD: "#tag1 #tag2"
}
```

### 3. Screen AddVideo

**File: `src/screens/AddVideo.tsx`**

**Tính năng:**
- ✅ Yêu cầu quyền camera và microphone
- ✅ Quay video với camera trước/sau
- ✅ Hiển thị indicator khi đang quay
- ✅ Tự động tạo thumbnail từ video
- ✅ Cho phép chọn thumbnail tùy chỉnh
- ✅ Form nhập caption và hashtags
- ✅ Upload video lên server
- ✅ Xử lý loading và error states

**Quy trình sử dụng:**
1. Mở tab "Thêm Video"
2. Cấp quyền camera và microphone
3. Nhấn nút record (tròn lớn) để bắt đầu quay
4. Nhấn lại để dừng quay
5. Hệ thống tự động tạo thumbnail
6. Nhập caption và hashtags (tùy chọn)
7. Nhấn "Đăng video" để upload

### 4. Custom Hook

**File: `src/hooks/useVideoUpload.ts`**
- Hook tái sử dụng để upload video
- Xử lý FormData và gọi API
- Cung cấp loading, error, success states

### 5. Permissions

**Android - `android/app/src/main/AndroidManifest.xml`:**
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
```

**iOS - `ios/scrolla_fe/Info.plist`:**
```xml
<key>NSCameraUsageDescription</key>
<string>Ứng dụng cần quyền truy cập camera để quay video</string>
<key>NSMicrophoneUsageDescription</key>
<string>Ứng dụng cần quyền truy cập microphone để ghi âm cho video</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Ứng dụng cần quyền truy cập thư viện ảnh để chọn thumbnail</string>
```

**Expo Config - `app.json`:**
```json
"plugins": [
  ["expo-camera", {
    "cameraPermission": "Ứng dụng cần quyền truy cập camera để quay video",
    "microphonePermission": "Ứng dụng cần quyền truy cập microphone để ghi âm cho video"
  }],
  ["expo-image-picker", {
    "photosPermission": "Ứng dụng cần quyền truy cập thư viện ảnh để chọn thumbnail"
  }]
]
```

## Cách chạy ứng dụng

### Development Build (Khuyến nghị)
```bash
# Build development
npx expo prebuild
npx expo run:android
# hoặc
npx expo run:ios

# Sau đó start metro
npm start
```

### Expo Go (Có thể không hoạt động đầy đủ)
```bash
npm start
```

**Lưu ý:** Tính năng camera yêu cầu development build, không hoạt động trên Expo Go.

## Kiểm tra và Debug

### Test trên Android
```bash
npx expo run:android
```

### Test trên iOS
```bash
npx expo run:ios
```

### Xem logs
```bash
npx expo start
# Nhấn "j" để mở debugger
```

## Cấu trúc dữ liệu

### Request Upload Video
```typescript
interface VideoUploadData {
  videoUri: string;        // URI của video đã quay
  thumbnailUri: string;    // URI của thumbnail (required)
  caption?: string;        // Mô tả video (optional)
  hashtags?: string;       // Hashtags (optional)
}
```

### FormData được gửi
```
video: binary (video/mp4)
thumbnail: binary (image/jpeg)
caption: string
hashtags: string
```

## Xử lý lỗi

### Lỗi thường gặp:
1. **Không có quyền camera:** Hiển thị màn hình yêu cầu cấp quyền
2. **Upload failed:** Hiển thị Alert với thông báo lỗi
3. **Không có thumbnail:** Yêu cầu người dùng chọn thumbnail trước khi upload

### Error handling trong code:
```typescript
try {
  const response = await createVideo(formData).unwrap();
  // Success
} catch (error: any) {
  Alert.alert('Lỗi', error?.data?.message || 'Không thể tải video lên');
}
```

## UI/UX Features

- **Camera View:** Giao diện quay video toàn màn hình
- **Flip Camera:** Nút đổi camera trước/sau
- **Recording Indicator:** Hiển thị "Đang quay..." khi đang record
- **Form View:** Giao diện nhập thông tin sau khi quay
- **Thumbnail Preview:** Hiển thị preview thumbnail
- **Loading States:** ActivityIndicator khi đang upload
- **Responsive Buttons:** Disable buttons khi đang xử lý

## Next Steps (Tùy chọn)

1. Thêm video editor (trim, filter)
2. Thêm music/sound overlay
3. Thêm text overlay trên video
4. Upload progress bar chi tiết
5. Draft system (lưu video tạm)
6. Batch upload nhiều video

## Support

Nếu gặp vấn đề:
1. Kiểm tra permissions đã được cấp chưa
2. Rebuild app: `npx expo prebuild --clean`
3. Clear cache: `npx expo start -c`
4. Xem logs trong terminal/debugger
