import { useState } from 'react';
import PhotoService from '../services/PhotoService';
import { ProfilePhoto } from '../../types';

export const useProfilePhoto = (profileId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const takePhoto = async (): Promise<{ success: boolean; photo?: ProfilePhoto; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const photoResult = await PhotoService.takePhoto();
      if (!photoResult.success || !photoResult.uri) {
        setError(photoResult.error || 'Failed to take photo');
        return { success: false, error: photoResult.error };
      }

      const processResult = await PhotoService.processPhoto(photoResult.uri, profileId);
      if (!processResult.success || !processResult.photo) {
        setError(processResult.error || 'Failed to process photo');
        return { success: false, error: processResult.error };
      }

      return { success: true, photo: processResult.photo };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const pickFromGallery = async (): Promise<{ success: boolean; photo?: ProfilePhoto; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const photoResult = await PhotoService.pickFromGallery();
      if (!photoResult.success || !photoResult.uri) {
        setError(photoResult.error || 'Failed to pick photo');
        return { success: false, error: photoResult.error };
      }

      const processResult = await PhotoService.processPhoto(photoResult.uri, profileId);
      if (!processResult.success || !processResult.photo) {
        setError(processResult.error || 'Failed to process photo');
        return { success: false, error: processResult.error };
      }

      return { success: true, photo: processResult.photo };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (uri: string, userId: string): Promise<{ success: boolean; url?: string; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const result = await PhotoService.uploadPhoto(uri, profileId, userId);
      if (!result.success) {
        setError(result.error || 'Failed to upload photo');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async (): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const result = await PhotoService.deletePhoto(profileId);
      if (!result.success) {
        setError(result.error || 'Failed to delete photo');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    takePhoto,
    pickFromGallery,
    uploadPhoto,
    deletePhoto,
    loading,
    error,
  };
};
