export const requestPermissionsAsync = jest.fn(async () => ({
  status: 'granted',
  granted: true,
  canAskAgain: true,
  expires: 'never',
  accessPrivileges: 'all',
}));

export const getPermissionsAsync = jest.fn(async () => ({
  status: 'granted',
  granted: true,
  canAskAgain: true,
  expires: 'never',
  accessPrivileges: 'all',
}));

export const saveToLibraryAsync = jest.fn(async (uri: string) => {
  return {
    id: `mock-asset-${Date.now()}`,
    filename: 'mock-saved-image.jpg',
    uri,
    mediaType: 'photo',
    width: 1920,
    height: 1080,
    creationTime: Date.now(),
    modificationTime: Date.now(),
    duration: 0,
  };
});

export const getAlbumAsync = jest.fn(async (albumName: string) => null);

export const createAlbumAsync = jest.fn(async (albumName: string) => ({
  id: `album-${Date.now()}`,
  title: albumName,
  assetCount: 0,
}));
