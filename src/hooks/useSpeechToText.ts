import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';

// Note: Speech recognition requires a development build
// This is a placeholder that will work with development builds
let Voice: any = null;

try {
  // Try to import voice module (will fail in Expo Go)
  Voice = require('@react-native-voice/voice').default;
} catch (e) {
  // Module not available in Expo Go
  console.log('Voice module not available. Create a development build to use this feature.');
}

interface UseSpeechToTextResult {
  isListening: boolean;
  recognizedText: string;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  cancelListening: () => Promise<void>;
  clearText: () => void;
  isAvailable: boolean;
}

export const useSpeechToText = (): UseSpeechToTextResult => {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    if (!Voice) {
      // Voice module not available (Expo Go)
      setIsAvailable(false);
      return;
    }

    // Check if speech recognition is available
    Voice.isAvailable()
      .then((available: boolean) => {
        setIsAvailable(available);
      })
      .catch(() => {
        setIsAvailable(false);
      });

    // Set up event listeners
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechPartialResults = onSpeechPartialResults;

    return () => {
      // Clean up event listeners
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = () => {
    setIsListening(true);
    setError(null);
  };

  const onSpeechEnd = () => {
    setIsListening(false);
  };

  const onSpeechResults = (e: any) => {
    if (e.value && e.value.length > 0) {
      setRecognizedText(e.value[0]);
    }
  };

  const onSpeechPartialResults = (e: any) => {
    if (e.value && e.value.length > 0) {
      setRecognizedText(e.value[0]);
    }
  };
  const startListening = async () => {
    try {
      setError(null);
      setRecognizedText('');
      
      if (!Voice) {
        Alert.alert(
          'Cần Development Build',
          'Tính năng nhận diện giọng nói yêu cầu development build. Expo Go không hỗ trợ module này.\n\nVui lòng chạy: npx expo run:android hoặc npx expo run:ios'
        );
        return;
      }
      
      if (!isAvailable) {
        Alert.alert(
          'Không hỗ trợ',
          'Thiết bị của bạn không hỗ trợ nhận diện giọng nói'
        );
        return;
      }

      // Configure voice recognition
      await Voice.start(Platform.OS === 'ios' ? 'vi-VN' : 'vi_VN');
    } catch (e: any) {
      setError(e.message || 'Không thể bắt đầu nhận diện giọng nói');
      Alert.alert('Lỗi', 'Không thể bắt đầu nhận diện giọng nói. Vui lòng kiểm tra quyền microphone.');
    }
  };

  const stopListening = async () => {
    try {
      if (!Voice) return;
      await Voice.stop();
      setIsListening(false);
    } catch (e: any) {
      setError(e.message || 'Không thể dừng nhận diện giọng nói');
    }
  };

  const cancelListening = async () => {
    try {
      if (!Voice) return;
      await Voice.cancel();
      setIsListening(false);
      setRecognizedText('');
    } catch (e: any) {
      setError(e.message || 'Không thể hủy nhận diện giọng nói');
    }
  };

  const clearText = () => {
    setRecognizedText('');
    setError(null);
  };

  return {
    isListening,
    recognizedText,
    error,
    startListening,
    stopListening,
    cancelListening,
    clearText,
    isAvailable,
  };
};
