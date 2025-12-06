import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { chatService } from '../services/api';
import { ChatRoom, ChatMessage, SendMessageDto } from '../types/api';

const Messages: React.FC = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadUserRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
    }
  }, [selectedRoom]);

  const loadUserRooms = async () => {
    try {
      setLoading(true);
      const response = await chatService.getUserRooms();
      if (response.success) {
        setRooms(response.data);
        if (response.data.length > 0) {
          setSelectedRoom(response.data[0]);
        }
      } else {
        Alert.alert('Lỗi', response.message);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách phòng chat');
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const response = await chatService.getMessages(roomId);
      if (response.success) {
        setMessages(response.data.reverse()); // Reverse to show latest messages at bottom
      } else {
        Alert.alert('Lỗi', response.message);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải tin nhắn');
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedRoom || sending) return;

    const messageDto: SendMessageDto = {
      roomId: selectedRoom.id,
      content: messageText.trim(),
      type: 'text',
    };

    try {
      setSending(true);
      const response = await chatService.sendMessage(messageDto);
      if (response.success) {
        setMessages(prev => [...prev, response.data]);
        setMessageText('');
        // Scroll to bottom after sending message
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        Alert.alert('Lỗi', response.message);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn');
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const renderRoomItem = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity
      style={[
        styles.roomItem,
        selectedRoom?.id === item.id && styles.selectedRoomItem
      ]}
      onPress={() => setSelectedRoom(item)}
    >
      <Text style={styles.roomName}>
        {item.name || `Chat với ${item.participants.length} người`}
      </Text>
      {item.lastMessage && (
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage.content}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderMessageItem = ({ item }: { item: ChatMessage }) => (
    <View style={styles.messageItem}>
      <Text style={styles.senderName}>{item.sender.givenName} {item.sender.familyName}</Text>
      <Text style={styles.messageContent}>{item.content}</Text>
      <Text style={styles.messageTime}>
        {new Date(item.createdAt).toLocaleTimeString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Hộp thư</Text>

      <View style={styles.content}>
        {/* Rooms List */}
        <View style={styles.roomsContainer}>
          <Text style={styles.sectionTitle}>Cuộc trò chuyện</Text>
          <FlatList
            data={rooms}
            keyExtractor={(item) => item.id}
            renderItem={renderRoomItem}
            style={styles.roomsList}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Messages */}
        {selectedRoom && (
          <View style={styles.chatContainer}>
            <Text style={styles.chatTitle}>
              {selectedRoom.name || `Chat với ${selectedRoom.participants.length} người`}
            </Text>

            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessageItem}
              style={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }}
            />

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.inputContainer}
            >
              <TextInput
                style={styles.textInput}
                value={messageText}
                onChangeText={setMessageText}
                placeholder="Nhập tin nhắn..."
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
                onPress={sendMessage}
                disabled={!messageText.trim() || sending}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.sendButtonText}>Gửi</Text>
                )}
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>
        )}

        {!selectedRoom && rooms.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Chưa có cuộc trò chuyện nào</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  roomsContainer: {
    width: '40%',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  roomsList: {
    flex: 1,
  },
  roomItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedRoomItem: {
    backgroundColor: '#E3F2FD',
  },
  roomName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  chatContainer: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageItem: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  senderName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default Messages;