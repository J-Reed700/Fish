import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CatProfile } from '../../types';
import ProfileManager from '../services/ProfileManager';
import ProfileStatsTracker from '../services/ProfileStatsTracker';
import { PurchaseTier } from '../utils/TierValidator';

interface ProfileContextType {
  activeProfile: CatProfile | null;
  profiles: CatProfile[];
  loading: boolean;
  tier: PurchaseTier;
  createProfile: (name: string, photoUri?: string) => Promise<{ success: boolean; profile?: CatProfile; error?: string }>;
  updateProfile: (id: string, updates: Partial<CatProfile>) => Promise<{ success: boolean; profile?: CatProfile; error?: string }>;
  deleteProfile: (id: string) => Promise<{ success: boolean; error?: string }>;
  switchProfile: (id: string) => Promise<{ success: boolean; profile?: CatProfile; error?: string }>;
  cloneProfile: (id: string) => Promise<{ success: boolean; profile?: CatProfile; error?: string }>;
  exportProfile: (id: string) => Promise<{ success: boolean; data?: string; error?: string }>;
  importProfile: (jsonData: string) => Promise<{ success: boolean; profile?: CatProfile; error?: string }>;
  refreshProfiles: () => Promise<void>;
}

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
  initialTier?: PurchaseTier;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children, initialTier = 'free' }) => {
  const [activeProfile, setActiveProfile] = useState<CatProfile | null>(null);
  const [profiles, setProfiles] = useState<CatProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<PurchaseTier>(initialTier);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const allProfiles = await ProfileManager.getAllProfiles();
      setProfiles(allProfiles);

      const active = await ProfileManager.getActiveProfile();
      setActiveProfile(active);

      if (!active && allProfiles.length === 0) {
        const defaultResult = await ProfileManager.createProfile('My Cat', undefined, 999);
        if (defaultResult.success && defaultResult.profile) {
          setProfiles([defaultResult.profile]);
          setActiveProfile(defaultResult.profile);
        }
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const createProfile = useCallback(
    async (name: string, photoUri?: string) => {
      const maxProfiles = tier === 'free' ? 1 : 999;
      const result = await ProfileManager.createProfile(name, photoUri, maxProfiles);

      if (result.success) {
        await loadProfiles();
      }

      return result;
    },
    [tier, loadProfiles]
  );

  const updateProfile = useCallback(
    async (id: string, updates: Partial<CatProfile>) => {
      const result = await ProfileManager.updateProfile(id, updates);

      if (result.success) {
        await loadProfiles();
      }

      return result;
    },
    [loadProfiles]
  );

  const deleteProfile = useCallback(
    async (id: string) => {
      const result = await ProfileManager.deleteProfile(id);

      if (result.success) {
        await loadProfiles();
      }

      return result;
    },
    [loadProfiles]
  );

  const switchProfile = useCallback(
    async (id: string) => {
      const result = await ProfileManager.switchProfile(id);

      if (result.success) {
        await loadProfiles();
        await ProfileStatsTracker.startSession();
      }

      return result;
    },
    [loadProfiles]
  );

  const cloneProfile = useCallback(
    async (id: string) => {
      const maxProfiles = tier === 'free' ? 1 : 999;
      const result = await ProfileManager.cloneProfile(id, maxProfiles);

      if (result.success) {
        await loadProfiles();
      }

      return result;
    },
    [tier, loadProfiles]
  );

  const exportProfile = useCallback(
    async (id: string) => {
      return await ProfileManager.exportProfile(id);
    },
    []
  );

  const importProfile = useCallback(
    async (jsonData: string) => {
      const maxProfiles = tier === 'free' ? 1 : 999;
      const result = await ProfileManager.importProfile(jsonData, maxProfiles);

      if (result.success) {
        await loadProfiles();
      }

      return result;
    },
    [tier, loadProfiles]
  );

  const refreshProfiles = useCallback(async () => {
    await loadProfiles();
  }, [loadProfiles]);

  const value: ProfileContextType = {
    activeProfile,
    profiles,
    loading,
    tier,
    createProfile,
    updateProfile,
    deleteProfile,
    switchProfile,
    cloneProfile,
    exportProfile,
    importProfile,
    refreshProfiles,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};
