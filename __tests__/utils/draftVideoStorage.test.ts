import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Random from 'expo-random';
import {
  saveDraftVideo,
  getDraftVideos,
  deleteDraftVideo,
  updateDraftVideo,
} from '../../src/utils/draftVideoStorage';

describe('Draft Video Storage Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('saveDraftVideo', () => {
    it('should save a draft video successfully', async () => {
      const videoUri = 'file:///video.mp4';
      const thumbnailUri = 'file:///thumbnail.jpg';
      const caption = 'Test caption';
      const hashtags = ['test', 'video'];

      const result = await saveDraftVideo(videoUri, thumbnailUri, caption, hashtags);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('videoUri', videoUri);
      expect(result).toHaveProperty('thumbnailUri', thumbnailUri);
      expect(result).toHaveProperty('caption', caption);
      expect(result).toHaveProperty('hashtags', hashtags);
      expect(result).toHaveProperty('createdAt');
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should generate a UUID for the draft', async () => {
      const result = await saveDraftVideo('video.mp4', 'thumbnail.jpg');

      expect(result.id).toMatch(/^[a-f0-9-]+$/);
      expect(result.id.split('-')).toHaveLength(5);
    });

    it('should save draft without caption and hashtags', async () => {
      const result = await saveDraftVideo('video.mp4', 'thumbnail.jpg');

      expect(result.caption).toBeUndefined();
      expect(result.hashtags).toBeUndefined();
    });

    it('should add new draft at the beginning of the list', async () => {
      const existingDrafts = [
        {
          id: 'old-id',
          videoUri: 'old-video.mp4',
          thumbnailUri: 'old-thumbnail.jpg',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingDrafts)
      );

      await saveDraftVideo('new-video.mp4', 'new-thumbnail.jpg');

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);

      expect(parsedData[0].videoUri).toBe('new-video.mp4');
      expect(parsedData[1].videoUri).toBe('old-video.mp4');
    });

    it('should throw error on storage failure', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      await expect(
        saveDraftVideo('video.mp4', 'thumbnail.jpg')
      ).rejects.toThrow('Storage error');
    });
  });

  describe('getDraftVideos', () => {
    it('should return empty array when no drafts exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await getDraftVideos();

      expect(result).toEqual([]);
    });

    it('should return parsed draft videos', async () => {
      const mockDrafts = [
        {
          id: '1',
          videoUri: 'video1.mp4',
          thumbnailUri: 'thumb1.jpg',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          videoUri: 'video2.mp4',
          thumbnailUri: 'thumb2.jpg',
          createdAt: '2024-01-02T00:00:00Z',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockDrafts)
      );

      const result = await getDraftVideos();

      expect(result).toEqual(mockDrafts);
      expect(result).toHaveLength(2);
    });

    it('should return empty array on error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('Read error')
      );

      const result = await getDraftVideos();

      expect(result).toEqual([]);
    });

    it('should handle invalid JSON gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      const result = await getDraftVideos();

      expect(result).toEqual([]);
    });
  });

  describe('deleteDraftVideo', () => {
    it('should delete a draft video by id', async () => {
      const mockDrafts = [
        {
          id: '1',
          videoUri: 'video1.mp4',
          thumbnailUri: 'thumb1.jpg',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          videoUri: 'video2.mp4',
          thumbnailUri: 'thumb2.jpg',
          createdAt: '2024-01-02T00:00:00Z',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockDrafts)
      );

      await deleteDraftVideo('1');

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);

      expect(parsedData).toHaveLength(1);
      expect(parsedData[0].id).toBe('2');
    });

    it('should not modify array if id not found', async () => {
      const mockDrafts = [
        {
          id: '1',
          videoUri: 'video1.mp4',
          thumbnailUri: 'thumb1.jpg',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockDrafts)
      );

      await deleteDraftVideo('non-existent-id');

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);

      expect(parsedData).toHaveLength(1);
      expect(parsedData[0].id).toBe('1');
    });

    it('should throw error on storage failure', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('[]');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error('Delete error')
      );

      await expect(deleteDraftVideo('1')).rejects.toThrow('Delete error');
    });
  });

  describe('updateDraftVideo', () => {
    it('should update draft video caption', async () => {
      const mockDrafts = [
        {
          id: '1',
          videoUri: 'video1.mp4',
          thumbnailUri: 'thumb1.jpg',
          caption: 'Old caption',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockDrafts)
      );

      await updateDraftVideo('1', { caption: 'New caption' });

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);

      expect(parsedData[0].caption).toBe('New caption');
    });

    it('should update draft video hashtags', async () => {
      const mockDrafts = [
        {
          id: '1',
          videoUri: 'video1.mp4',
          thumbnailUri: 'thumb1.jpg',
          hashtags: ['old'],
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockDrafts)
      );

      await updateDraftVideo('1', { hashtags: ['new', 'tags'] });

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);

      expect(parsedData[0].hashtags).toEqual(['new', 'tags']);
    });

    it('should update both caption and hashtags', async () => {
      const mockDrafts = [
        {
          id: '1',
          videoUri: 'video1.mp4',
          thumbnailUri: 'thumb1.jpg',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockDrafts)
      );

      await updateDraftVideo('1', {
        caption: 'Updated caption',
        hashtags: ['updated', 'tags'],
      });

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);

      expect(parsedData[0].caption).toBe('Updated caption');
      expect(parsedData[0].hashtags).toEqual(['updated', 'tags']);
    });

    it('should not modify other drafts', async () => {
      const mockDrafts = [
        {
          id: '1',
          videoUri: 'video1.mp4',
          thumbnailUri: 'thumb1.jpg',
          caption: 'Caption 1',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          videoUri: 'video2.mp4',
          thumbnailUri: 'thumb2.jpg',
          caption: 'Caption 2',
          createdAt: '2024-01-02T00:00:00Z',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockDrafts)
      );

      await updateDraftVideo('1', { caption: 'Updated' });

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);

      expect(parsedData[0].caption).toBe('Updated');
      expect(parsedData[1].caption).toBe('Caption 2');
    });

    it('should throw error on storage failure', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('[]');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error('Update error')
      );

      await expect(
        updateDraftVideo('1', { caption: 'New' })
      ).rejects.toThrow('Update error');
    });
  });
});
