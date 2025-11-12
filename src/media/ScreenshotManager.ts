import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screenshot, OverlayConfig } from '../types';
import { OverlayEngine } from './OverlayEngine';
import { PermissionHelper } from '../utils/PermissionHelper';

const SCREENSHOTS_STORAGE_KEY = 'screenshots_';
const SCREENSHOTS_DIR = `${(FileSystem as any).documentDirectory ?? ''}screenshots/`;

export interface ScreenshotCallbacks {
  onShowPermissionModal: (
    title: string,
    message: string,
    onGrant: () => void,
    onDeny: () => void,
    showOpenSettings?: boolean
  ) => void;
}

export class ScreenshotManager {
  private static callbacks: ScreenshotCallbacks | null = null;

  static setCallbacks(callbacks: ScreenshotCallbacks): void {
    this.callbacks = callbacks;
  }
  static async captureScreen(viewRef: any): Promise<string> {
    if (!viewRef.current) {
      throw new Error('View ref not available');
    }

    const uri = await captureRef(viewRef, {
      format: 'jpg',
      quality: 0.9,
    });

    return uri;
  }

  static async addOverlay(
    imageUri: string,
    overlayData: {
      catName: string;
      catches: number;
      playTime: number;
      mode: any;
      showWatermark: boolean;
    }
  ): Promise<string> {
    const overlayUri = await OverlayEngine.renderOverlayToImage({
      catName: overlayData.catName,
      catches: overlayData.catches,
      playTime: overlayData.playTime,
      mode: overlayData.mode,
      showWatermark: overlayData.showWatermark,
    });

    return overlayUri;
  }

  static async saveScreenshot(
    imageUri: string,
    profileId: string,
    sessionData: {
      catName: string;
      catches: number;
      playTime: number;
      mode: any;
    }
  ): Promise<Screenshot> {
    await this._ensureDirectoryExists();

    const timestamp = Date.now();
    const fileName = `screenshot_${timestamp}.jpg`;
    const filePath = `${SCREENSHOTS_DIR}${fileName}`;

    await FileSystem.copyAsync({
      from: imageUri,
      to: filePath,
    });

    const screenshot: Screenshot = {
      id: timestamp.toString(),
      filePath,
      timestamp,
      profileId,
      sessionData,
    };

    await this._saveToStorage(screenshot, profileId);

    return screenshot;
  }

  static async loadScreenshots(profileId: string): Promise<Screenshot[]> {
    try {
      const key = `${SCREENSHOTS_STORAGE_KEY}${profileId}`;
      const data = await AsyncStorage.getItem(key);
      if (!data) return [];

      const screenshots: Screenshot[] = JSON.parse(data);
      const validScreenshots = await this._filterValidScreenshots(screenshots);

      if (validScreenshots.length !== screenshots.length) {
        await AsyncStorage.setItem(key, JSON.stringify(validScreenshots));
      }

      return validScreenshots.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error loading screenshots:', error);
      return [];
    }
  }

  static async deleteScreenshot(
    screenshotId: string,
    profileId: string
  ): Promise<void> {
    const screenshots = await this.loadScreenshots(profileId);
    const screenshot = screenshots.find((s) => s.id === screenshotId);

    if (screenshot) {
      try {
        await FileSystem.deleteAsync(screenshot.filePath, { idempotent: true });
      } catch (error) {
        console.error('Error deleting file:', error);
      }

      const updated = screenshots.filter((s) => s.id !== screenshotId);
      const key = `${SCREENSHOTS_STORAGE_KEY}${profileId}`;
      await AsyncStorage.setItem(key, JSON.stringify(updated));
    }
  }

  static async share(screenshot: Screenshot, message?: string): Promise<void> {
    const shareMessage =
      message ||
      `Look at my cat ${screenshot.sessionData.catName} playing Fish Cat Game! 🐱🐟\n${screenshot.sessionData.catches} catches in ${Math.floor(screenshot.sessionData.playTime / 60)} minutes!\n\n#FishCatGame #CatGame`;

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }

    await Sharing.shareAsync(screenshot.filePath, {
      mimeType: 'image/jpeg',
      dialogTitle: shareMessage,
      UTI: 'public.jpeg',
    });
  }

  static async saveToPhotoLibrary(screenshot: Screenshot): Promise<boolean> {
    const status = await PermissionHelper.checkMediaLibraryPermission();

    if (status.status === 'never_ask_again') {
      if (this.callbacks) {
        return new Promise<boolean>((resolve) => {
          this.callbacks!.onShowPermissionModal(
            'Photo Library Access Required',
            'Allow Fish Cat Game to save screenshots to your photos so you can share your cat\'s gameplay!',
            async () => {
              await PermissionHelper.openAppSettings();
              resolve(false);
            },
            () => resolve(false),
            true
          );
        });
      }
      throw new Error('Permission to access media library was permanently denied');
    }

    if (!status.granted) {
      if (this.callbacks) {
        const granted = await new Promise<boolean>((resolve) => {
          this.callbacks!.onShowPermissionModal(
            'Save to Photos',
            'Allow Fish Cat Game to save screenshots to your photos so you can share your cat\'s gameplay!',
            async () => {
              const result = await PermissionHelper.requestMediaLibraryPermission();
              resolve(result.granted);
            },
            () => resolve(false),
            false
          );
        });

        if (!granted) {
          return false;
        }
      } else {
        const result = await PermissionHelper.requestMediaLibraryPermission();
        if (!result.granted) {
          return false;
        }
      }
    }

    await MediaLibrary.saveToLibraryAsync(screenshot.filePath);
    return true;
  }

  private static async _ensureDirectoryExists(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(SCREENSHOTS_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(SCREENSHOTS_DIR, {
        intermediates: true,
      });
    }
  }

  private static async _saveToStorage(
    screenshot: Screenshot,
    profileId: string
  ): Promise<void> {
    const screenshots = await this.loadScreenshots(profileId);
    screenshots.push(screenshot);

    const key = `${SCREENSHOTS_STORAGE_KEY}${profileId}`;
    await AsyncStorage.setItem(key, JSON.stringify(screenshots));
  }

  private static async _filterValidScreenshots(
    screenshots: Screenshot[]
  ): Promise<Screenshot[]> {
    const valid: Screenshot[] = [];

    for (const screenshot of screenshots) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(screenshot.filePath);
        if (fileInfo.exists) {
          valid.push(screenshot);
        }
      } catch (error) {
        console.error('Error checking file:', error);
      }
    }

    return valid;
  }
}
