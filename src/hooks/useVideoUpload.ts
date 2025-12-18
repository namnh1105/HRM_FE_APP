import { useState } from 'react';
import { useCreateVideoMutation } from '../store/api/videoApi';

interface VideoUploadData {
  videoUri: string;
  thumbnailUri: string;
  caption?: string;
  hashtags?: string[];
}

export const useVideoUpload = () => {
  const [createVideo, { isLoading, isError, isSuccess }] = useCreateVideoMutation();
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadVideo = async (data: VideoUploadData) => {
    try {
      setUploadProgress(0);
      
      const formData = new FormData();

      // Add video file
      const videoFileName = data.videoUri.split('/').pop() || 'video.mp4';
      formData.append('video', {
        uri: data.videoUri,
        type: 'video/mp4',
        name: videoFileName,
      } as any);

      // Add thumbnail file (required)
      const thumbnailFileName = data.thumbnailUri.split('/').pop() || 'thumbnail.jpg';
      formData.append('thumbnail', {
        uri: data.thumbnailUri,
        type: 'image/jpeg',
        name: thumbnailFileName,
      } as any);

      // Add optional fields
      if (data.caption) {
        formData.append('caption', data.caption);
      }
      if (data.hashtags && data.hashtags.length > 0) {
        // Send as comma-separated string, backend Transform will parse it
        formData.append('hashtags', data.hashtags.join(','));
      }

      setUploadProgress(50); // Simulated progress

      const response = await createVideo(formData).unwrap();
      
      setUploadProgress(100);
      
      return response;
    } catch (error) {
      setUploadProgress(0);
      throw error;
    }
  };

  return {
    uploadVideo,
    isLoading,
    isError,
    isSuccess,
    uploadProgress,
  };
};
