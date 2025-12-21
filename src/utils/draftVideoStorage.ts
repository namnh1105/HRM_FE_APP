import AsyncStorage from '@react-native-async-storage/async-storage';
import { DraftVideo } from '../types/api';
import * as Random from 'expo-random';

const DRAFT_VIDEOS_KEY = '@draft_videos';

// Generate a simple UUID using expo-random
const generateUUID = (): string => {
  const bytes = Random.getRandomBytes(16);
  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
};

export const saveDraftVideo = async (
  videoUri: string,
  thumbnailUri: string,
  caption?: string,
  hashtags?: string[]
): Promise<DraftVideo> => {
  try {
    const draftVideos = await getDraftVideos();
    
    const newDraft: DraftVideo = {
      id: generateUUID(),
      videoUri,
      thumbnailUri,
      caption,
      hashtags,
      createdAt: new Date().toISOString(),
    };
    
    const updatedDrafts = [newDraft, ...draftVideos];
    await AsyncStorage.setItem(DRAFT_VIDEOS_KEY, JSON.stringify(updatedDrafts));
    
    return newDraft;
  } catch (error) {
    console.error('Error saving draft video:', error);
    throw error;
  }
};

export const getDraftVideos = async (): Promise<DraftVideo[]> => {
  try {
    const draftsJson = await AsyncStorage.getItem(DRAFT_VIDEOS_KEY);
    if (!draftsJson) return [];
    
    return JSON.parse(draftsJson);
  } catch (error) {
    console.error('Error getting draft videos:', error);
    return [];
  }
};

export const deleteDraftVideo = async (id: string): Promise<void> => {
  try {
    const draftVideos = await getDraftVideos();
    const updatedDrafts = draftVideos.filter(draft => draft.id !== id);
    await AsyncStorage.setItem(DRAFT_VIDEOS_KEY, JSON.stringify(updatedDrafts));
  } catch (error) {
    console.error('Error deleting draft video:', error);
    throw error;
  }
};

export const updateDraftVideo = async (
  id: string,
  updates: Partial<Pick<DraftVideo, 'caption' | 'hashtags'>>
): Promise<void> => {
  try {
    const draftVideos = await getDraftVideos();
    const updatedDrafts = draftVideos.map(draft => 
      draft.id === id ? { ...draft, ...updates } : draft
    );
    await AsyncStorage.setItem(DRAFT_VIDEOS_KEY, JSON.stringify(updatedDrafts));
  } catch (error) {
    console.error('Error updating draft video:', error);
    throw error;
  }
};
