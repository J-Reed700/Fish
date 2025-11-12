import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { ProfilePhoto } from '../../types';

const PHOTOS_DIR = `${FileSystem.documentDirectory ?? ''}profiles/photos/`;

export class PhotoService {
  private static instance: PhotoService;

  private constructor() {
    this.ensurePhotosDirectory();
  }

  static getInstance(): PhotoService {
    if (!PhotoService.instance) {
      PhotoService.instance = new PhotoService();
    }
    return PhotoService.instance;
  }

  private async ensurePhotosDirectory(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Failed to create photos directory:', error);
    }
  }

  async requestCameraPermissions(): Promise<{ granted: boolean; error?: string }> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return {
        granted: status === 'granted',
        error: status !== 'granted' ? 'Camera permission denied' : undefined,
      };
    } catch (error) {
      return {
        granted: false,
        error: error instanceof Error ? error.message : 'Failed to request camera permission',
      };
    }
  }

  async requestGalleryPermissions(): Promise<{ granted: boolean; error?: string }> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return {
        granted: status === 'granted',
        error: status !== 'granted' ? 'Gallery permission denied' : undefined,
      };
    } catch (error) {
      return {
        granted: false,
        error: error instanceof Error ? error.message : 'Failed to request gallery permission',
      };
    }
  }

  async takePhoto(): Promise<{ success: boolean; uri?: string; error?: string }> {
    try {
      const permissionResult = await this.requestCameraPermissions();
      if (!permissionResult.granted) {
        return { success: false, error: permissionResult.error };
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled) {
        return { success: false, error: 'Camera cancelled' };
      }

      return { success: true, uri: result.assets[0].uri };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to take photo',
      };
    }
  }

  async pickFromGallery(): Promise<{ success: boolean; uri?: string; error?: string }> {
    try {
      const permissionResult = await this.requestGalleryPermissions();
      if (!permissionResult.granted) {
        return { success: false, error: permissionResult.error };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled) {
        return { success: false, error: 'Gallery picker cancelled' };
      }

      return { success: true, uri: result.assets[0].uri };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to pick from gallery',
      };
    }
  }

  async cropAndResize(uri: string, size: number = 512): Promise<{ success: boolean; uri?: string; error?: string }> {
    try {
      const imageInfo = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            resize: {
              width: size,
              height: size,
            },
          },
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      return { success: true, uri: imageInfo.uri };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to crop and resize',
      };
    }
  }

  async compressPhoto(uri: string, maxSizeKB: number = 100): Promise<{ success: boolean; uri?: string; error?: string }> {
    try {
      let quality = 0.8;
      let compressed = await ImageManipulator.manipulateAsync(uri, [], {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      let fileInfo = await FileSystem.getInfoAsync(compressed.uri);
      let iterations = 0;
      const maxIterations = 5;

      while (
        fileInfo.exists &&
        'size' in fileInfo &&
        fileInfo.size > maxSizeKB * 1024 &&
        quality > 0.1 &&
        iterations < maxIterations
      ) {
        quality -= 0.15;
        compressed = await ImageManipulator.manipulateAsync(uri, [], {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
        });
        fileInfo = await FileSystem.getInfoAsync(compressed.uri);
        iterations++;
      }

      return { success: true, uri: compressed.uri };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to compress photo',
      };
    }
  }

  async savePhoto(uri: string, profileId: string): Promise<{ success: boolean; savedUri?: string; error?: string }> {
    try {
      await this.ensurePhotosDirectory();

      const filename = `${profileId}_${Date.now()}.jpg`;
      const destination = `${PHOTOS_DIR}${filename}`;

      await FileSystem.copyAsync({
        from: uri,
        to: destination,
      });

      return { success: true, savedUri: destination };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save photo',
      };
    }
  }

  async deletePhoto(profileId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const files = await FileSystem.readDirectoryAsync(PHOTOS_DIR);
      const profileFiles = files.filter(f => f.startsWith(profileId));

      for (const file of profileFiles) {
        await FileSystem.deleteAsync(`${PHOTOS_DIR}${file}`, { idempotent: true });
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete photo',
      };
    }
  }

  async processPhoto(uri: string, profileId: string): Promise<{ success: boolean; photo?: ProfilePhoto; error?: string }> {
    try {
      const croppedResult = await this.cropAndResize(uri, 512);
      if (!croppedResult.success || !croppedResult.uri) {
        return { success: false, error: croppedResult.error };
      }

      const compressedResult = await this.compressPhoto(croppedResult.uri, 100);
      if (!compressedResult.success || !compressedResult.uri) {
        return { success: false, error: compressedResult.error };
      }

      const savedResult = await this.savePhoto(compressedResult.uri, profileId);
      if (!savedResult.success || !savedResult.savedUri) {
        return { success: false, error: savedResult.error };
      }

      const fileInfo = await FileSystem.getInfoAsync(savedResult.savedUri);

      const photo: ProfilePhoto = {
        uri: savedResult.savedUri,
        width: 512,
        height: 512,
        fileSize: (fileInfo.exists && 'size' in fileInfo) ? fileInfo.size : 0,
      };

      return { success: true, photo };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process photo',
      };
    }
  }

  async uploadPhoto(uri: string, profileId: string, userId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      return {
        success: false,
        error: 'Cloud upload not yet implemented. Premium feature coming soon.',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload photo',
      };
    }
  }

  getDefaultAvatar(index: number): string {
    const avatars = [
      'tabby', 'siamese', 'persian', 'mainecoon', 'calico',
      'black', 'white', 'orange', 'gray', 'tuxedo',
      'bengal', 'ragdoll', 'sphynx', 'scottishfold', 'russian',
      'abyssinian', 'british', 'exotic', 'birman', 'burmese',
    ];

    const avatarName = avatars[index % avatars.length];
    return `default_avatar_${avatarName}`;
  }
}

export default PhotoService.getInstance();
