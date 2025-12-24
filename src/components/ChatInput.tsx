import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
  maxLength?: number;
  sending?: boolean;
  showAttachments?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChangeText,
  onSend,
  placeholder = 'Message...',
  maxLength = 1000,
  sending = false,
  showAttachments = true,
}) => {
  const handleSend = () => {
    if (!value.trim() || sending) return;
    onSend();
  };

  return (
    <View style={styles.inputContainer}>
      {showAttachments && (
        <>
          <Pressable style={styles.iconButton}>
            <Ionicons name="camera-outline" size={24} color="#6B4CE6" />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <Ionicons name="image-outline" size={24} color="#6B4CE6" />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <Ionicons name="mic-outline" size={24} color="#6B4CE6" />
          </Pressable>
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        multiline
        maxLength={maxLength}
        blurOnSubmit={false}
      />

      {value.trim() ? (
        <Pressable
          onPress={handleSend}
          disabled={sending}
          style={({ pressed }) => [
            styles.sendButton,
            pressed && { opacity: 0.6 },
          ]}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#6B4CE6" />
          ) : (
            <Ionicons name="send" size={22} color="#6B4CE6" />
          )}
        </Pressable>
      ) : showAttachments ? (
        <Pressable style={styles.iconButton}>
          <Ionicons name="happy-outline" size={24} color="#6B4CE6" />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    backgroundColor: '#fff',
    minHeight: 56,
  },
  iconButton: {
    padding: 6,
    marginBottom: 2,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: '#000',
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    padding: 6,
    marginLeft: 4,
    marginBottom: 2,
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
});

export default ChatInput;
