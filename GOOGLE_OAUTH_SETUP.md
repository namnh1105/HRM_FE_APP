# Hướng dẫn cấu hình Google OAuth cho Expo

## Thông tin dự án của bạn
- **Expo Owner**: `nghoanglong`
- **Slug**: `scrolla-fe`
- **Redirect URI**: `https://auth.expo.io/@nghoanglong/scrolla-fe`

## Bước 1: Cấu hình Google Cloud Console

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn dự án của bạn
3. Vào **APIs & Services** > **Credentials**
4. Chọn OAuth 2.0 Client ID của bạn (Web client ID)
5. Trong mục **Authorized redirect URIs**, thêm CHÍNH XÁC dòng này:
   ```
   https://auth.expo.io/@nghoanglong/scrolla-fe
   ```
   ⚠️ **LƯU Ý**: 
   - Phải dùng `https://` (không phải `http://`)
   - Phải đúng format: `@owner/slug`
   - Không có dấu `/` ở cuối
   
6. Xóa các redirect URI cũ (như `exp://192.168...`) nếu có
7. Nhấn **Save**
8. **Đợi 5-10 phút** để Google cập nhật cấu hình

## Bước 2: Cấu hình đã hoàn tất trong code

Code đã được cập nhật với `makeRedirectUri({ useProxy: true })` trong file:
- `src/hooks/useGoogleAuth.ts`

## Lưu ý quan trọng

### Về useProxy: true
- `useProxy: true` là **BẮT BUỘC** khi test trên Expo Go
- Expo có thể hiển thị warning về deprecated, nhưng đây vẫn là cách duy nhất để test Google Login trên Expo Go
- Khi build standalone app (production), bạn có thể remove `useProxy` và dùng custom scheme

### Kiểm tra hoạt động
1. Chạy `npx expo start`
2. Quét QR code bằng Expo Go
3. Thử đăng nhập Google
4. Kiểm tra redirect có hoạt động đúng không

### Nếu vẫn gặp lỗi redirect_uri_mismatch
1. Kiểm tra lại redirect URI trong Google Cloud Console
2. Đảm bảo format chính xác: `https://auth.expo.io/@nghoanglong/scrolla-fe`
3. Đợi vài phút để Google cập nhật cấu hình
4. Clear cache Expo Go và thử lại

## Testing trên thiết bị thật

Khi test trên Android/iOS device:
- Đảm bảo device và máy tính cùng WiFi
- Quét QR code từ Expo Go
- Google OAuth sẽ redirect về `https://auth.expo.io/@nghoanglong/scrolla-fe`
- Expo Go sẽ handle redirect và trả về app

## Build Production

Khi build production (không dùng Expo Go):
1. Cần thêm scheme trong `app.json`: `"scheme": "scrolla"`
2. Update redirect URI trong code:
   ```typescript
   redirectUri: makeRedirectUri({
     scheme: 'scrolla',
     useProxy: false,
   })
   ```
3. Update Google Cloud Console với scheme mới:
   - Android: `com.scrolla.fe:/`
   - iOS: `com.scrolla.fe:/`
