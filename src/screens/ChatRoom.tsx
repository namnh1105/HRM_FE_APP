import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import {
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkRoomAsReadMutation,
} from '../store/api/chatApi';
import { useChat } from '../context/ChatContext';
import { ChatMessage, User } from '../types/api';
import { RootState } from '../store';
import { ChatInput } from '../components';

type ChatRoomRouteParams = {
  roomId: string;
  otherUser: User;
};

const ChatRoom: React.FC = () => {
  const route = useRoute<RouteProp<{ params: ChatRoomRouteParams }, 'params'>>();
  const navigation = useNavigation();
  const { roomId, otherUser } = route.params;
  
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: messagesData, isLoading, refetch } = useGetMessagesQuery({ roomId });
  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();
  const [markRoomAsRead] = useMarkRoomAsReadMutation();
  
  // Safely get chat context - don't crash if not available
  let chatContext;
  try {
    chatContext = useChat();
  } catch (error) {
    console.warn('[ChatRoom] ChatContext not available:', error);
    chatContext = {
      isConnected: false,
      setCurrentOpenRoomId: () => {},
      onNewMessage: () => {},
      startTyping: () => {},
      stopTyping: () => {},
      markRoomAsRead: () => {},
    };
  }
  
  const {
    isConnected,
    setCurrentOpenRoomId,
    onNewMessage,
    startTyping,
    stopTyping,
    markRoomAsRead: markRoomAsReadWs,
  } = chatContext;

  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData);
    }
  }, [messagesData]);

  // Set current open room khi vào và clear khi rời
  useEffect(() => {
    if (roomId) {
      console.log('[ChatRoom] Setting current open room:', roomId);
      setCurrentOpenRoomId(roomId);
      markRoomAsRead(roomId);
      markRoomAsReadWs(roomId);
    }

    return () => {
      console.log('[ChatRoom] Clearing current open room');
      setCurrentOpenRoomId(null);
    };
  }, [roomId, setCurrentOpenRoomId, markRoomAsRead, markRoomAsReadWs]);

  // Separate useEffect for message listener
  useEffect(() => {
    const handleNewMessage = (newMessage: ChatMessage) => {
      console.log('[ChatRoom] Received new message:', newMessage);
      if (newMessage.roomId === roomId) {
        setMessages((prev) => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
        // Auto scroll to new message
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
        
        // Mark room as read when receiving new message while in the room
        markRoomAsRead(roomId);
        markRoomAsReadWs(roomId);
      }
    };

    onNewMessage(handleNewMessage);

    // Note: cleanup is handled in ChatContext
  }, [roomId, onNewMessage, markRoomAsRead, markRoomAsReadWs]);

  const handleSendMessage = async () => {
    console.log("Hi")
    console.log(messageText);
    console.log(currentUser);
    if (!messageText.trim() || !currentUser) return;

    const tempMessage = messageText;
    setMessageText('');

    try {
      console.log('[ChatRoom] Sending message:', {
        content: tempMessage,
        recipientId: otherUser?.id,
        roomId,
        messageType: 'text',
      });
      
      const result = await sendMessage({
        content: tempMessage,
        recipientId: otherUser?.id || '',
        roomId,
        messageType: 'text',
      }).unwrap();
      
      console.log('[ChatRoom] Message sent successfully:', result);
      stopTyping(roomId);
      // Don't refetch - let WebSocket update handle it
      // The message will be received via onNewMessage listener
    } catch (error) {
      console.error('[ChatRoom] Error sending message:', error);
      setMessageText(tempMessage); // Restore message on error
    }
  };

  const handleTextChange = (text: string) => {
    setMessageText(text);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Start typing indicator
    if (text.length > 0) {
      startTyping(roomId);
      
      // Stop typing after 2 seconds of no input
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(roomId);
      }, 2000);
    } else {
      stopTyping(roomId);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.senderId === currentUser?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        {!isOwnMessage && (
          <>
            {item.sender?.avatarUrl ? (
              <Image
                source={{ uri: item.sender.avatarUrl }}
                style={styles.messageAvatar}
              />
            ) : (
              <View style={[styles.messageAvatar, styles.defaultMessageAvatar]}>
                <Ionicons name="person" size={16} color="#999" />
              </View>
            )}
          </>
        )}
        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
            ]}
          >
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          {otherUser?.avatarUrl ? (
            <Image source={{ uri: otherUser.avatarUrl }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatar, styles.defaultAvatar]}>
              <Ionicons name="person" size={20} color="#999" />
            </View>
          )}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName}>
              {otherUser?.givenName || otherUser?.username || 'User'}
            </Text>
            <Text style={styles.headerStatus}>
              {isConnected ? 'Active now' : 'Offline'}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="call-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="videocam-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ChatInput
          value={messageText}
          onChangeText={handleTextChange}
          onSend={handleSendMessage}
          placeholder="Tin nhắn..."
          maxLength={1000}
          sending={sending}
          showAttachments={true}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  defaultAvatar: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  headerStatus: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 4,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  defaultMessageAvatar: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 20,
  },
  ownMessageBubble: {
    backgroundColor: '#0095F6',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#EFEFEF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#999',
  },
});

export default ChatRoom;
