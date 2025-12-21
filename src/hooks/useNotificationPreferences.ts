import { useGetNotificationPreferencesQuery, useUpdateNotificationPreferencesMutation } from '../store/api/notificationApi';
import { useAppSelector } from '../store/hooks';
import type { NotificationPreferences } from '../store/api/notificationApi';

export const useNotificationPreferences = () => {
  const { accessToken } = useAppSelector((state) => state.auth);

  const {
    data: preferences,
    isLoading,
    refetch,
  } = useGetNotificationPreferencesQuery(undefined, {
    skip: !accessToken,
  });

  const [updatePreferencesMutation, { isLoading: isUpdating }] =
    useUpdateNotificationPreferencesMutation();

  const updatePreferences = async (data: Partial<NotificationPreferences>) => {
    try {
      await updatePreferencesMutation(data).unwrap();
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  return {
    preferences,
    isLoading,
    isUpdating,
    updatePreferences,
    refetch,
  };
};
