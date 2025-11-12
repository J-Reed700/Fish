import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Screenshot } from '../types';
import { ScreenshotManager } from './ScreenshotManager';

const MAX_SCREENSHOTS = 20;

export class GalleryManager {
  static async loadGallery(profileId: string): Promise<Screenshot[]> {
    return ScreenshotManager.loadScreenshots(profileId);
  }

  static async addToGallery(
    screenshot: Screenshot,
    profileId: string
  ): Promise<void> {
    await this.cleanupOldScreenshots(profileId);
  }

  static async removeFromGallery(
    screenshotId: string,
    profileId: string
  ): Promise<void> {
    await ScreenshotManager.deleteScreenshot(screenshotId, profileId);
  }

  static async cleanupOldScreenshots(profileId: string): Promise<void> {
    const screenshots = await ScreenshotManager.loadScreenshots(profileId);

    if (screenshots.length > MAX_SCREENSHOTS) {
      const sorted = screenshots.sort((a, b) => b.timestamp - a.timestamp);
      const toDelete = sorted.slice(MAX_SCREENSHOTS);

      for (const screenshot of toDelete) {
        await ScreenshotManager.deleteScreenshot(screenshot.id, profileId);
      }
    }
  }

  static async getStorageSize(profileId: string): Promise<number> {
    const screenshots = await ScreenshotManager.loadScreenshots(profileId);
    let totalSize = 0;

    for (const screenshot of screenshots) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(screenshot.filePath);
        if (fileInfo.exists && 'size' in fileInfo) {
          totalSize += fileInfo.size || 0;
        }
      } catch (error) {
        console.error('Error getting file size:', error);
      }
    }

    return totalSize;
  }
}
