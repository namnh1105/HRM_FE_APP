import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ChatInput from './ChatInput';
import {
  useGetVideoCommentsQuery,
  useCreateCommentMutation,
  useToggleCommentLikeMutation,
  Comment,
} from '../store/api/commentApi';

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  videoId: string;
}

const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  onClose,
  videoId,
}) => {
  const navigation = useNavigation<any>();
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  const { data: comments = [], isLoading, refetch } = useGetVideoCommentsQuery(
    { videoId, page: 1, limit: 50 },
    { skip: !visible }
  );

  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const [toggleLike] = useToggleCommentLikeMutation();

  const handleSendComment = async () => {
    if (!commentText.trim()) return;

    try {
      await createComment({
        videoId,
        content: commentText.trim(),
        parentId: replyingTo?.id,
      }).unwrap();

      setCommentText('');
      setReplyingTo(null);
      refetch();
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleToggleLike = async (commentId: string) => {
    try {
      await toggleLike(commentId).unwrap();
      // Refetch để cập nhật UI
      refetch();
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleNavigateToProfile = (userId: string) => {
    onClose();
    navigation.navigate('UserProfile', { userId });
  };

  const formatCommentTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày`;
    return `${Math.floor(diffInSeconds / 604800)} tuần`;
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <TouchableOpacity onPress={() => handleNavigateToProfile(item.user.id)}>
          {item.user.avatarUrl ? (
            <Image source={{ uri: item.user.avatarUrl }} style={styles.commentAvatar} />
          ) : (
            <View style={[styles.commentAvatar, styles.defaultAvatar]}>
              <Ionicons name="person" size={16} color="#999" />
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.commentContent}>
          <View style={styles.commentTextContainer}>
            <TouchableOpacity onPress={() => handleNavigateToProfile(item.user.id)}>
              <Text style={styles.commentUsername}>{item.user.username}</Text>
            </TouchableOpacity>
            {item.parentId && item.parent && (
              <View style={styles.replyingToContainer}>
                <Text style={styles.replyingToText}>
                  Đang trả lời{' '}
                  <Text 
                    style={styles.replyingToUsername}
                    onPress={() => handleNavigateToProfile(item.parent!.id)}
                  >
                    @{item.parent.username}
                  </Text>
                </Text>
              </View>
            )}
            <Text style={styles.commentText}>{item.content}</Text>
          </View>
          <View style={styles.commentFooter}>
            <Text style={styles.commentTime}>{formatCommentTime(item.createdAt)}</Text>
            {item.likesCount > 0 && (
              <Text style={styles.commentLikes}>
                {item.likesCount} {item.likesCount === 1 ? 'thích' : 'lượt thích'}
              </Text>
            )}
            <TouchableOpacity onPress={() => handleReply(item)}>
              <Text style={styles.replyButton}>Trả lời</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.likeButton}
          onPress={() => handleToggleLike(item.id)}
        >
          <Ionicons 
            name={item.isLiked ? "heart" : "heart-outline"} 
            size={14} 
            color={item.isLiked ? "#FF3B5C" : "#262626"} 
          />
        </TouchableOpacity>
      </View>

      {/* Render replies */}
      {item.replies && item.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {item.replies.map((reply) => (
            <View key={reply.id} style={styles.replyItem}>
              <TouchableOpacity onPress={() => handleNavigateToProfile(reply.user.id)}>
                {reply.user.avatarUrl ? (
                  <Image source={{ uri: reply.user.avatarUrl }} style={styles.replyAvatar} />
                ) : (
                  <View style={[styles.replyAvatar, styles.defaultAvatar]}>
                    <Ionicons name="person" size={12} color="#999" />
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.replyContent}>
                <View style={styles.replyTextContainer}>
                  <TouchableOpacity onPress={() => handleNavigateToProfile(reply.user.id)}>
                    <Text style={styles.replyUsername}>{reply.user.username}</Text>
                  </TouchableOpacity>
                  {reply.parent && (
                    <Text style={styles.replyToText}>
                      {' '}→ <Text style={styles.replyToUsername}>@{reply.parent.username}</Text>
                    </Text>
                  )}
                  <Text style={styles.replyText}>{reply.content}</Text>
                </View>
                <View style={styles.replyFooter}>
                  <Text style={styles.replyTime}>{formatCommentTime(reply.createdAt)}</Text>
                  {reply.likesCount > 0 && (
                    <Text style={styles.replyLikes}>
                      {reply.likesCount} {reply.likesCount === 1 ? 'thích' : 'lượt thích'}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity 
                style={styles.replyLikeButton}
                onPress={() => handleToggleLike(reply.id)}
              >
                <Ionicons 
                  name={reply.isLiked ? "heart" : "heart-outline"} 
                  size={12} 
                  color={reply.isLiked ? "#FF3B5C" : "#262626"} 
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Bình luận</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <View style={styles.commentsListContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF3B5C" />
                <Text style={styles.loadingText}>Đang tải bình luận...</Text>
              </View>
            ) : comments.length > 0 ? (
              <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.commentsList}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="none"
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-outline" size={48} color="#DBDBDB" />
                <Text style={styles.emptyText}>Chưa có bình luận</Text>
                <Text style={styles.emptySubtext}>Hãy là người đầu tiên bình luận</Text>
              </View>
            )}
          </View>

          {/* Replying indicator */}
          {replyingTo && (
            <View style={styles.replyingIndicator}>
              <Text style={styles.replyingIndicatorText}>
                Đang trả lời @{replyingTo.user.username}
              </Text>
              <TouchableOpacity onPress={handleCancelReply}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          )}

          {/* Input Area */}
          <ChatInput
            value={commentText}
            onChangeText={setCommentText}
            onSend={handleSendComment}
            placeholder={replyingTo ? `Trả lời @${replyingTo.user.username}...` : "Thêm bình luận..."}
            maxLength={500}
            sending={isCreating}
            showAttachments={false}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    height: '75%',
    minHeight: 400,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'column',
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    position: 'relative',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DBDBDB',
    borderRadius: 2,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  commentsListContainer: {
    flex: 1,
  },
  commentsList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  commentContainer: {
    marginBottom: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  defaultAvatar: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentContent: {
    flex: 1,
  },
  commentTextContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 8,
  },
  commentUsername: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 13,
    color: '#000',
    lineHeight: 18,
  },
  commentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingLeft: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
    marginRight: 12,
  },
  commentLikes: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginRight: 12,
  },
  replyButton: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  likeButton: {
    padding: 4,
    marginLeft: 8,
  },
  repliesContainer: {
    marginTop: 8,
    marginLeft: 44,
    borderLeftWidth: 2,
    borderLeftColor: '#EFEFEF',
    paddingLeft: 12,
  },
  replyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  replyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyTextContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 6,
  },
  replyUsername: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  replyToText: {
    fontSize: 11,
    color: '#999',
  },
  replyToUsername: {
    color: '#0095F6',
    fontWeight: '600',
  },
  replyText: {
    fontSize: 12,
    color: '#000',
    lineHeight: 16,
    marginTop: 2,
  },
  replyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingLeft: 6,
  },
  replyTime: {
    fontSize: 11,
    color: '#999',
    marginRight: 10,
  },
  replyLikes: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  replyLikeButton: {
    padding: 4,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  replyingToContainer: {
    marginBottom: 4,
  },
  replyingToText: {
    fontSize: 12,
    color: '#999',
  },
  replyingToUsername: {
    color: '#0095F6',
    fontWeight: '600',
  },
  replyingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F8F8',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  replyingIndicatorText: {
    fontSize: 13,
    color: '#262626',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#262626',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});

export default CommentsModal;
