import React from 'react';
import { captureRef } from 'react-native-view-shot';
import { OverlayConfig } from '../types';

export class OverlayEngine {
  static async renderOverlayToImage(config: OverlayConfig): Promise<string> {
    return '';
  }

  static getOverlayComponent(config: OverlayConfig): any {
    return null;
  }
}
