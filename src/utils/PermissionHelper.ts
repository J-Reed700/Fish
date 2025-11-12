import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Linking, Platform } from 'react-native';

export interface PermissionResult {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'never_ask_again' | 'undetermined';
}

export type PermissionType = 'camera' | 'photos' | 'media_library';

export class PermissionHelper {
  static async checkMediaLibraryPermission(): Promise<PermissionResult> {
    const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();

    return {
      granted: status === 'granted',
      canAskAgain: canAskAgain,
      status: this._mapStatus(status, canAskAgain),
    };
  }

  static async checkImagePickerPermission(): Promise<PermissionResult> {
    const { status, canAskAgain } = await ImagePicker.getMediaLibraryPermissionsAsync();

    return {
      granted: status === 'granted',
      canAskAgain: canAskAgain,
      status: this._mapStatus(status, canAskAgain),
    };
  }

  static async requestMediaLibraryPermission(): Promise<PermissionResult> {
    const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();

    return {
      granted: status === 'granted',
      canAskAgain: canAskAgain,
      status: this._mapStatus(status, canAskAgain),
    };
  }

  static async requestImagePickerPermission(): Promise<PermissionResult> {
    const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    return {
      granted: status === 'granted',
      canAskAgain: canAskAgain,
      status: this._mapStatus(status, canAskAgain),
    };
  }

  static async openAppSettings(): Promise<void> {
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
    } else {
      await Linking.openSettings();
    }
  }

  private static _mapStatus(
    status: string,
    canAskAgain: boolean
  ): 'granted' | 'denied' | 'never_ask_again' | 'undetermined' {
    if (status === 'granted') return 'granted';
    if (status === 'undetermined') return 'undetermined';
    if (!canAskAgain) return 'never_ask_again';
    return 'denied';
  }
}
