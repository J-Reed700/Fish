# iOS-Compliant Permission Handling

This module provides iOS App Store-compliant permission handling for Fish Cat Game.

## Components

### PermissionHelper (`PermissionHelper.ts`)

Utility class for checking and requesting permissions without native alerts.

**Methods:**
- `checkMediaLibraryPermission()` - Check photo library permission status without requesting
- `checkImagePickerPermission()` - Check image picker permission status without requesting
- `requestMediaLibraryPermission()` - Request photo library permission
- `requestImagePickerPermission()` - Request image picker permission
- `openAppSettings()` - Open iOS/Android system settings for the app

**Status Types:**
- `granted` - Permission granted
- `denied` - Permission denied but can ask again
- `never_ask_again` - Permission permanently denied (show "Open Settings")
- `undetermined` - Permission never requested

### PermissionModal (`components/PermissionModal.tsx`)

Custom modal for permission requests (replaces native alerts).

**Props:**
- `visible` - Show/hide modal
- `title` - Modal title
- `message` - Explanation of why permission is needed
- `permissionType` - 'camera' or 'photos' (affects icon)
- `onRequestPermission` - Called when user taps "Allow"
- `onCancel` - Called when user taps "Not Now"
- `onOpenSettings` - Called when user taps "Open Settings" (optional)
- `showOpenSettings` - Show "Open Settings" button instead of "Allow" (optional)

**Design:**
- Matches game theme (dark blue #003366)
- Clear icons (📷 for camera, 🖼️ for photos)
- Two-button layout: "Not Now" and "Allow"/"Open Settings"

### PermissionExplanation (`components/PermissionExplanation.tsx`)

Full-screen explanation shown before requesting permissions (permission priming).

**Props:**
- `visible` - Show/hide explanation
- `title` - Explanation title
- `message` - Explanation message
- `icon` - Emoji icon
- `onContinue` - Called when user taps "Continue"
- `onSkip` - Called when user taps "Skip for now" (optional)

## Integration Guide

### Step 1: Set Up Permission Callbacks in App Component

```typescript
import React, { useState } from 'react';
import { PermissionModal } from './components/PermissionModal';
import { ImageHandler } from './profiles/ImageHandler';
import { ScreenshotManager } from './media/ScreenshotManager';

export default function App() {
  const [permissionModal, setPermissionModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    permissionType: 'camera' | 'photos';
    onGrant: () => void;
    onDeny: () => void;
    showOpenSettings?: boolean;
  }>({
    visible: false,
    title: '',
    message: '',
    permissionType: 'photos',
    onGrant: () => {},
    onDeny: () => {},
  });

  // Set up callbacks for ImageHandler
  React.useEffect(() => {
    ImageHandler.setCallbacks({
      onShowPermissionModal: (title, message, onGrant, onDeny, showOpenSettings) => {
        setPermissionModal({
          visible: true,
          title,
          message,
          permissionType: 'photos',
          onGrant,
          onDeny,
          showOpenSettings,
        });
      },
    });

    ScreenshotManager.setCallbacks({
      onShowPermissionModal: (title, message, onGrant, onDeny, showOpenSettings) => {
        setPermissionModal({
          visible: true,
          title,
          message,
          permissionType: 'photos',
          onGrant,
          onDeny,
          showOpenSettings,
        });
      },
    });
  }, []);

  return (
    <>
      {/* Your app components */}

      {/* Permission modal */}
      <PermissionModal
        visible={permissionModal.visible}
        title={permissionModal.title}
        message={permissionModal.message}
        permissionType={permissionModal.permissionType}
        onRequestPermission={() => {
          setPermissionModal({ ...permissionModal, visible: false });
          permissionModal.onGrant();
        }}
        onCancel={() => {
          setPermissionModal({ ...permissionModal, visible: false });
          permissionModal.onDeny();
        }}
        onOpenSettings={() => {
          setPermissionModal({ ...permissionModal, visible: false });
          permissionModal.onGrant();
        }}
        showOpenSettings={permissionModal.showOpenSettings}
      />
    </>
  );
}
```

### Step 2: Update ShareModal to Handle New Return Type

The `ScreenshotManager.saveToPhotoLibrary()` method now returns `Promise<boolean>` instead of `Promise<void>`.

**Before:**
```typescript
const handleSaveToPhotos = async () => {
  try {
    await ScreenshotManager.saveToPhotoLibrary(screenshot);
    Alert.alert('Success', 'Screenshot saved to your photo library!');
    onClose();
  } catch (error: any) {
    console.error('Save error:', error);
    if (error.message.includes('Permission')) {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library in Settings to save screenshots.'
      );
    } else {
      Alert.alert('Error', 'Failed to save screenshot');
    }
  }
};
```

**After:**
```typescript
const handleSaveToPhotos = async () => {
  try {
    const success = await ScreenshotManager.saveToPhotoLibrary(screenshot);
    if (success) {
      // Show success message (use custom toast/modal, not Alert)
      console.log('Screenshot saved to your photo library!');
      onClose();
    }
  } catch (error: any) {
    console.error('Save error:', error);
    // Show error message (use custom toast/modal, not Alert)
  }
};
```

### Step 3: Add Permission Priming (Optional but Recommended)

Show an explanation screen before first permission request:

```typescript
import { PermissionExplanation } from './components/PermissionExplanation';

const [showExplanation, setShowExplanation] = useState(false);

// Check if first time requesting permission
const needsExplanation = await checkFirstTimePermissionRequest();

if (needsExplanation) {
  setShowExplanation(true);
}

<PermissionExplanation
  visible={showExplanation}
  title="Capture Your Cat's Best Moments!"
  message="Take screenshots of your cat's gameplay and share them with friends!"
  icon="📷"
  onContinue={() => {
    setShowExplanation(false);
    // Proceed with permission request
  }}
  onSkip={() => {
    setShowExplanation(false);
  }}
/>
```

## iOS Compliance Checklist

- ✅ No native alerts (`alert()`, `Alert.alert()`) for permission requests
- ✅ Custom modals match app theme
- ✅ Pre-check permission status before requesting
- ✅ Clear value proposition in permission messages
- ✅ Handle "denied" vs "never_ask_again" states
- ✅ "Open Settings" guidance when permanently denied
- ✅ Permission priming component available
- ✅ Graceful handling of permission denial (no errors thrown to user)

## Migration Notes

### Breaking Changes

1. **ImageHandler.pickImage()** - Now uses callbacks for permission modals
   - Set callbacks with `ImageHandler.setCallbacks()`
   - No more native alert when permission denied

2. **ScreenshotManager.saveToPhotoLibrary()** - Return type changed
   - Now returns `Promise<boolean>` (true if saved, false if permission denied)
   - Previously returned `Promise<void>` and threw errors
   - Set callbacks with `ScreenshotManager.setCallbacks()`

### Non-Breaking Changes

- `PermissionHelper` methods can be used directly without callbacks
- Existing code will fallback to system permission dialogs if callbacks not set

## Testing

```typescript
// Test permission flow
import { PermissionHelper } from './utils/PermissionHelper';

// Check status
const status = await PermissionHelper.checkMediaLibraryPermission();
console.log(status); // { granted: false, canAskAgain: true, status: 'denied' }

// Request permission
const result = await PermissionHelper.requestMediaLibraryPermission();
console.log(result); // { granted: true, canAskAgain: true, status: 'granted' }

// Open settings
await PermissionHelper.openAppSettings();
```

## Files Modified

- `src/utils/PermissionHelper.ts` - New utility module
- `src/components/PermissionModal.tsx` - New modal component
- `src/components/PermissionExplanation.tsx` - New explanation component
- `src/profiles/ImageHandler.ts` - Updated to use PermissionHelper
- `src/media/ScreenshotManager.ts` - Updated to use PermissionHelper

## Files to Update

These files still use `Alert.alert()` and need custom modals:

- `src/components/ProfileEditor.tsx` - Uses Alert for validation/confirmation
- `src/components/ShareModal.tsx` - Uses Alert for errors/success
- `src/components/GalleryScreen.tsx` - Uses Alert for delete confirmation
- `src/components/FullScreenImage.tsx` - Uses Alert for delete confirmation
- `src/components/Game.tsx` - May use Alert for game events
- `src/components/ThemeSelector.tsx` - May use Alert for errors
