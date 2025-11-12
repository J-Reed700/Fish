export const MediaTypeOptions = {
  All: 'All',
  Videos: 'Videos',
  Images: 'Images',
};

export const requestMediaLibraryPermissionsAsync = jest.fn(async () => ({
  status: 'granted',
  granted: true,
  canAskAgain: true,
  expires: 'never',
}));

export const requestCameraPermissionsAsync = jest.fn(async () => ({
  status: 'granted',
  granted: true,
  canAskAgain: true,
  expires: 'never',
}));

export const launchImageLibraryAsync = jest.fn(async (options?: any) => ({
  cancelled: false,
  assets: [
    {
      uri: 'file://mock-image.jpg',
      width: 1920,
      height: 1080,
      type: 'image',
      fileName: 'mock-image.jpg',
      fileSize: 500000,
    },
  ],
}));

export const launchCameraAsync = jest.fn(async (options?: any) => ({
  cancelled: false,
  assets: [
    {
      uri: 'file://mock-camera-image.jpg',
      width: 1920,
      height: 1080,
      type: 'image',
      fileName: 'mock-camera-image.jpg',
      fileSize: 600000,
    },
  ],
}));

export const getPendingResultAsync = jest.fn(async () => []);
