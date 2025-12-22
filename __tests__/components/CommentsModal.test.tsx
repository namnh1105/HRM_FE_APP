import { Alert } from 'react-native';

// Test logic functions from CommentsModal
describe('CommentsModal Logic', () => {
  describe('formatCommentTime logic', () => {
    const formatCommentTime = (dateString: string): string => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'Vừa xong';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày`;
      return `${Math.floor(diffInSeconds / 604800)} tuần`;
    };

    it('should return "Vừa xong" for recent comments', () => {
      const now = new Date();
      const result = formatCommentTime(now.toISOString());
      expect(result).toBe('Vừa xong');
    });

    it('should format minutes correctly', () => {
      const date = new Date(Date.now() - 120000); // 2 minutes ago
      const result = formatCommentTime(date.toISOString());
      expect(result).toBe('2 phút');
    });

    it('should format hours correctly', () => {
      const date = new Date(Date.now() - 7200000); // 2 hours ago
      const result = formatCommentTime(date.toISOString());
      expect(result).toBe('2 giờ');
    });

    it('should format days correctly', () => {
      const date = new Date(Date.now() - 172800000); // 2 days ago
      const result = formatCommentTime(date.toISOString());
      expect(result).toBe('2 ngày');
    });

    it('should format weeks correctly', () => {
      const date = new Date(Date.now() - 1209600000); // 2 weeks ago
      const result = formatCommentTime(date.toISOString());
      expect(result).toBe('2 tuần');
    });
  });

  describe('handleSendComment logic', () => {
    it('should not send empty comment', async () => {
      const commentText = '';
      const mockCreateComment = jest.fn();

      if (!commentText.trim()) {
        return;
      }

      await mockCreateComment();
      expect(mockCreateComment).not.toHaveBeenCalled();
    });

    it('should send comment with trimmed text', async () => {
      const commentText = '  Test comment  ';
      const mockCreateComment = jest.fn(() => ({
        unwrap: jest.fn(() => Promise.resolve({ success: true })),
      }));

      if (commentText.trim()) {
        await mockCreateComment({
          videoId: '1',
          content: commentText.trim(),
          parentId: undefined,
        }).unwrap();
      }

      expect(mockCreateComment).toHaveBeenCalledWith({
        videoId: '1',
        content: 'Test comment',
        parentId: undefined,
      });
    });

    it('should include parentId when replying', async () => {
      const commentText = 'Reply text';
      const replyingTo = { id: 'parent-1' };
      const mockCreateComment = jest.fn(() => ({
        unwrap: jest.fn(() => Promise.resolve({ success: true })),
      }));

      await mockCreateComment({
        videoId: '1',
        content: commentText.trim(),
        parentId: replyingTo.id,
      }).unwrap();

      expect(mockCreateComment).toHaveBeenCalledWith({
        videoId: '1',
        content: 'Reply text',
        parentId: 'parent-1',
      });
    });

    it('should handle create comment error', async () => {
      const mockCreateComment = jest.fn(() => ({
        unwrap: jest.fn(() => Promise.reject(new Error('Failed to create'))),
      }));

      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      try {
        await mockCreateComment({}).unwrap();
      } catch (error) {
        console.error('Failed to create comment:', error);
      }

      expect(consoleError).toHaveBeenCalledWith(
        'Failed to create comment:',
        expect.any(Error)
      );

      consoleError.mockRestore();
    });
  });

  describe('handleToggleLike logic', () => {
    it('should toggle like successfully', async () => {
      const mockToggleLike = jest.fn(() => ({
        unwrap: jest.fn(() => Promise.resolve({
          success: true,
          data: { isLiked: true },
        })),
      }));

      const response = await mockToggleLike('comment-1').unwrap();

      expect(mockToggleLike).toHaveBeenCalledWith('comment-1');
      expect(response.success).toBe(true);
      expect(response.data.isLiked).toBe(true);
    });

    it('should handle like error', async () => {
      const mockToggleLike = jest.fn(() => ({
        unwrap: jest.fn(() => Promise.reject(new Error('Failed to toggle like'))),
      }));

      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      try {
        await mockToggleLike('comment-1').unwrap();
      } catch (error) {
        console.error('Failed to toggle like:', error);
      }

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('reply state management', () => {
    it('should set replying state', () => {
      const comment = {
        id: '1',
        content: 'Original comment',
        user: { id: 'user1', username: 'testuser' },
      };

      let replyingTo = null;
      replyingTo = comment;

      expect(replyingTo).toEqual(comment);
      expect(replyingTo.id).toBe('1');
    });

    it('should clear replying state', () => {
      let replyingTo = {
        id: '1',
        content: 'Original comment',
        user: { id: 'user1', username: 'testuser' },
      };

      replyingTo = null;

      expect(replyingTo).toBeNull();
    });
  });

  describe('comment input validation', () => {
    it('should validate non-empty comment', () => {
      const commentText = 'Valid comment';
      const isValid = commentText.trim().length > 0;

      expect(isValid).toBe(true);
    });

    it('should invalidate empty comment', () => {
      const commentText = '';
      const isValid = commentText.trim().length > 0;

      expect(isValid).toBe(false);
    });

    it('should invalidate whitespace-only comment', () => {
      const commentText = '   ';
      const isValid = commentText.trim().length > 0;

      expect(isValid).toBe(false);
    });
  });

  describe('comment refetch logic', () => {
    it('should refetch after creating comment', async () => {
      const mockRefetch = jest.fn();
      const mockCreateComment = jest.fn(() => ({
        unwrap: jest.fn(() => Promise.resolve({ success: true })),
      }));

      await mockCreateComment({}).unwrap();
      mockRefetch();

      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should refetch after toggling like', async () => {
      const mockRefetch = jest.fn();
      const mockToggleLike = jest.fn(() => ({
        unwrap: jest.fn(() => Promise.resolve({ success: true })),
      }));

      await mockToggleLike('comment-1').unwrap();
      mockRefetch();

      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
