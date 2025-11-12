import { useContext } from 'react';
import { ProfileContext } from '../contexts/ProfileContext';
import type { CatProfile } from '../../types';

export const useActiveProfile = () => {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error('useActiveProfile must be used within a ProfileProvider');
  }

  const { activeProfile, updateProfile, switchProfile, loading } = context;

  const updateActiveProfile = async (updates: Partial<CatProfile>) => {
    if (!activeProfile) {
      return { success: false, error: 'No active profile' };
    }

    return await updateProfile(activeProfile.id, updates);
  };

  return {
    profile: activeProfile,
    stats: activeProfile?.stats,
    preferences: activeProfile?.preferences,
    updateProfile: updateActiveProfile,
    switchProfile,
    loading,
  };
};
