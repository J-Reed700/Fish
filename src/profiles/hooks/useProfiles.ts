import { useContext } from 'react';
import { ProfileContext } from '../contexts/ProfileContext';

export const useProfiles = () => {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error('useProfiles must be used within a ProfileProvider');
  }

  const {
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
  } = context;

  return {
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
};
