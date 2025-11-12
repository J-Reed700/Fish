import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { PermissionHelper } from '../utils/PermissionHelper';

const TARGET_SIZE = 200;
const MAX_FILE_SIZE = 100 * 1024;

export interface ImagePickerCallbacks {
  onShowPermissionModal: (
    title: string,
    message: string,
    onGrant: () => void,
    onDeny: () => void,
    showOpenSettings?: boolean
  ) => void;
}

export class ImageHandler {
  private static callbacks: ImagePickerCallbacks | null = null;

  static setCallbacks(callbacks: ImagePickerCallbacks): void {
    this.callbacks = callbacks;
  }

  static async pickImage(): Promise<string | null> {
    const status = await PermissionHelper.checkImagePickerPermission();

    if (status.status === 'never_ask_again') {
      if (this.callbacks) {
        return new Promise<string | null>((resolve) => {
          this.callbacks!.onShowPermissionModal(
            'Photo Access Required',
            'Fish Cat Game needs access to your photos to let you choose a profile picture for your cat.',
            async () => {
              await PermissionHelper.openAppSettings();
              resolve(null);
            },
            () => resolve(null),
            true
          );
        });
      }
      return null;
    }

    if (!status.granted) {
      if (this.callbacks) {
        const shouldProceed = await new Promise<boolean>((resolve) => {
          this.callbacks!.onShowPermissionModal(
            'Choose a Photo',
            'Pick a profile picture for your cat from your photo library.',
            async () => {
              const result = await PermissionHelper.requestImagePickerPermission();
              resolve(result.granted);
            },
            () => resolve(false),
            false
          );
        });

        if (!shouldProceed) {
          return null;
        }
      } else {
        const result = await PermissionHelper.requestImagePickerPermission();
        if (!result.granted) {
          return null;
        }
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0].uri;
  }

  static async compressImage(uri: string, maxSize: number = MAX_FILE_SIZE): Promise<string> {
    try {
      let quality = 0.8;
      let compressed = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: TARGET_SIZE, height: TARGET_SIZE } }],
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
      );

      const fileInfo = await FileSystem.getInfoAsync(compressed.uri);
      if (!fileInfo.exists) {
        throw new Error('Compressed image does not exist');
      }

      while (fileInfo.size && fileInfo.size > maxSize && quality > 0.1) {
        quality -= 0.1;
        compressed = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: TARGET_SIZE, height: TARGET_SIZE } }],
          { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
        );
      }

      return compressed.uri;
    } catch (error) {
      console.error('Failed to compress image:', error);
      throw error;
    }
  }

  static async saveImage(uri: string, profileId: string): Promise<string> {
    try {
      const compressedUri = await this.compressImage(uri);
      const directory = `${(FileSystem as any).documentDirectory ?? ''}profile_photos/`;

      const dirInfo = await FileSystem.getInfoAsync(directory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      }

      const fileName = `${profileId}.jpg`;
      const newPath = `${directory}${fileName}`;

      await FileSystem.copyAsync({
        from: compressedUri,
        to: newPath,
      });

      return newPath;
    } catch (error) {
      console.error('Failed to save image:', error);
      throw error;
    }
  }

  static async deleteImage(uri: string): Promise<void> {
    try {
      if (uri.includes('profile_photos')) {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(uri);
        }
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  }

  static getDefaultPlaceholder(): string {
    return '😺';
  }
}
