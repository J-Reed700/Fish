import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

let firebaseInitialized = false;
let currentUserId: string | null = null;

export const initializeFirebase = async (): Promise<void> => {
  if (firebaseInitialized) {
    return;
  }

  try {
    const userId = await AsyncStorage.getItem('leaderboard_user_id');
    if (!userId) {
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('leaderboard_user_id', newUserId);
      currentUserId = newUserId;
    } else {
      currentUserId = userId;
    }

    firebaseInitialized = true;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw new Error('Firebase initialization failed');
  }
};

export const getCurrentUserId = async (): Promise<string> => {
  if (!currentUserId) {
    await initializeFirebase();
  }
  return currentUserId!;
};

export const isFirebaseAvailable = (): boolean => {
  return (
    !!FIREBASE_CONFIG.apiKey &&
    !!FIREBASE_CONFIG.projectId &&
    firebaseInitialized
  );
};

export const resetFirebaseUserId = async (): Promise<void> => {
  await AsyncStorage.removeItem('leaderboard_user_id');
  currentUserId = null;
  firebaseInitialized = false;
};
