import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  StatusBar,
  BackHandler,
  TouchableOpacity,
  Image,
  Text,
  Alert,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useGameLoop } from '../game/GameLoop';
import { SkiaRenderer } from '../rendering/SkiaRenderer';
import { FishFactory } from '../entities/FishFactory';
import { DEFAULT_GAME_CONFIG, GAME_MODE_CONFIGS, LOCK_CONFIG, SESSION_DURATIONS } from '../config/GameConfig';
import { GameMode, GameState, GameConfig, ProfileState } from '../types';
import { ScreenLockManager, LockState } from '../interactions/ScreenLockManager';
import { LockIndicator } from './LockIndicator';
import { CornerIndicators } from './CornerIndicators';
import { SessionCompleteScreen } from './SessionCompleteScreen';
import { PauseOverlay } from './PauseOverlay';
import { ModeSelector } from './ModeSelector';
import { SessionStats, SessionManager } from '../game/SessionManager';
import { SoundManager } from '../audio/SoundManager';
import { ProfileSelector } from './ProfileSelector';
import { ProfileManager } from '../profiles/ProfileManager';
import { ImageHandler } from '../profiles/ImageHandler';
import { StatsDashboard } from './StatsDashboard';
import { CaptureButton } from './CaptureButton';
import { GalleryScreen } from './GalleryScreen';
import { ScreenshotManager } from '../media/ScreenshotManager';
import { DailyChallengeScreen } from './DailyChallengeScreen';
import { ChallengeManager } from '../challenges/ChallengeManager';
import { StreakTracker } from '../challenges/StreakTracker';
import { ThemeManager } from '../themes/ThemeManager';
import { ThemeSelector } from './ThemeSelector';
import { Theme, AmbientParticle, Achievement } from '../types';
import { ParticleSystem } from '../entities/ParticleSystem';
import { useSharedValue } from 'react-native-reanimated';
import { AchievementScreen } from './AchievementScreen';
import { AchievementToastQueue } from './AchievementUnlockToast';
import AsyncStorageAdapter from '../storage/AsyncStorageAdapter';

export interface GameProps {
  mode?: GameMode;
  fishCount?: number;
  sessionDuration?: number;
  catName?: string;
}

export const Game: React.FC<GameProps> = ({
  mode: initialMode = 'free-swim',
  fishCount,
  sessionDuration = SESSION_DURATIONS.medium,
  catName
}) => {
  const { width, height } = Dimensions.get('window');

  const [showModeSelector, setShowModeSelector] = useState(true);
  const [selectedMode, setSelectedMode] = useState<GameMode>(initialMode);

  const [lockState, setLockState] = useState<LockState>(() =>
    LOCK_CONFIG.autoLockOnStart ? ScreenLockManager.lock() : ScreenLockManager.create()
  );

  const [showSessionComplete, setShowSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [showPauseOverlay, setShowPauseOverlay] = useState(false);

  const [profileState, setProfileState] = useState<ProfileState | null>(null);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [incompleteChallenges, setIncompleteChallenges] = useState(0);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  const ambientParticlesShared = useSharedValue<AmbientParticle[]>([]);
  const gameViewRef = useRef<View>(null);

  const activeProfile = profileState ? ProfileManager.getActiveProfile(profileState) : null;

  useEffect(() => {
    SoundManager.initialize();
  }, []);

  useEffect(() => {
    async function initProfiles() {
      try {
        const state = await ProfileManager.loadProfiles();
        setProfileState(state);
      } catch (error) {
        console.error('Failed to initialize profiles:', error);
        const defaultState = ProfileManager.createDefaultProfileState();
        setProfileState(defaultState);
      }
    }
    initProfiles();
  }, []);

  useEffect(() => {
    async function loadChallengeStatus() {
      if (!activeProfile) return;

      try {
        const today = StreakTracker.getTodayDate();
        const challenges = await ChallengeManager.getOrCreateChallenges(
          activeProfile.id,
          today,
          'free'
        );

        const incomplete = challenges.filter(c => !c.completed).length;
        setIncompleteChallenges(incomplete);
      } catch (error) {
        console.error('Failed to load challenge status:', error);
        setIncompleteChallenges(0);
      }
    }

    loadChallengeStatus();
  }, [activeProfile]);

  useEffect(() => {
    async function checkForNewAchievements() {
      if (!activeProfile) return;

      try {
        const stored = await AsyncStorageAdapter.get<Achievement[]>(
          `newAchievements:${activeProfile.id}`
        );

        if (stored && stored.length > 0) {
          setNewAchievements(stored);
          await AsyncStorageAdapter.set(`newAchievements:${activeProfile.id}`, []);
        }
      } catch (error) {
        console.error('Failed to check for new achievements:', error);
      }
    }

    checkForNewAchievements();
  }, [activeProfile, showSessionComplete]);

  useEffect(() => {
    async function loadTheme() {
      if (!activeProfile) return;

      try {
        const theme = await ThemeManager.getCurrentTheme(activeProfile.id);
        setCurrentTheme(theme);

        const particles = ParticleSystem.createAmbientParticles(theme, {
          width,
          height,
        });
        ambientParticlesShared.value = particles;
      } catch (error) {
        console.error('Failed to load theme:', error);
        const defaultTheme = ThemeManager.getDefaultTheme();
        setCurrentTheme(defaultTheme);

        const particles = ParticleSystem.createAmbientParticles(defaultTheme, {
          width,
          height,
        });
        ambientParticlesShared.value = particles;
      }
    }

    loadTheme();
  }, [activeProfile, width, height]);

  useEffect(() => {
    if (!currentTheme) return;

    const interval = setInterval(() => {
      ambientParticlesShared.value = ParticleSystem.updateAmbientParticles(
        ambientParticlesShared.value,
        0.016,
        { width, height }
      );
    }, 16);

    return () => clearInterval(interval);
  }, [currentTheme, width, height]);

  useEffect(() => {
    if (lockState.isLocked) {
      StatusBar.setHidden(true);

      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        return true;
      });

      return () => {
        backHandler.remove();
      };
    } else {
      StatusBar.setHidden(false);
    }
  }, [lockState.isLocked]);

  const modeConfig = GAME_MODE_CONFIGS[selectedMode];
  const effectiveFishCount = fishCount !== undefined
    ? fishCount
    : modeConfig.fishCount !== undefined
      ? modeConfig.fishCount
      : DEFAULT_GAME_CONFIG.fishCount;

  const initialFish = useMemo(() =>
    FishFactory.createMany(effectiveFishCount, { width, height }),
    [effectiveFishCount, width, height]
  );

  const initialState: GameState = useMemo(() => ({
    fish: initialFish,
    particles: [],
    mode: selectedMode,
    score: 0,
    isPaused: false,
  }), [initialFish, selectedMode]);

  const effectiveBoids = modeConfig.boidsOverride
    ? { ...DEFAULT_GAME_CONFIG.boids, ...modeConfig.boidsOverride }
    : DEFAULT_GAME_CONFIG.boids;

  const config: GameConfig = useMemo(() => ({
    ...DEFAULT_GAME_CONFIG,
    width,
    height,
    fishCount: effectiveFishCount,
    boids: effectiveBoids,
    mode: selectedMode,
  }), [width, height, effectiveFishCount, effectiveBoids, selectedMode]);

  const handleSessionComplete = async (stats: SessionStats) => {
    setSessionStats(stats);
    setShowSessionComplete(true);

    if (profileState) {
      const activeProfile = ProfileManager.getActiveProfile(profileState);
      if (activeProfile) {
        try {
          const sessionState = {
            startTime: Date.now() - stats.playTime * 1000,
            duration: 0,
            isActive: false,
            isPaused: true,
            touchCount: stats.touchCount,
            lastTouchTime: Date.now(),
            fishCaughtBySpecies: stats.fishCaughtBySpecies,
            mode: selectedMode,
            modesPlayed: [selectedMode],
            consecutiveCatches: 0,
            maxConsecutiveCatches: 0,
            missedCatches: 0,
          };
          await SessionManager.completeSession(sessionState, activeProfile.id);
        } catch (error) {
          console.error('Failed to save session:', error);
        }
      }
    }
  };

  const handleAutoPause = () => {
    setShowPauseOverlay(true);
  };

  const {
    fishShared,
    miceShared,
    lasersShared,
    insectsShared,
    ladybugsShared,
    butterfliesShared,
    cockroachesShared,
    particlesShared,
    addTouch,
    pauseSession,
    resumeSession,
    endSession,
    getSessionStats
  } = useGameLoop(
    initialState,
    config,
    sessionDuration,
    handleSessionComplete,
    handleAutoPause
  );

  const handleContinuePlaying = () => {
    setShowSessionComplete(false);
    setSessionStats(null);
    resumeSession();
  };

  const handleEndSession = () => {
    setShowSessionComplete(false);
    endSession();
  };

  const handleResume = () => {
    setShowPauseOverlay(false);
    resumeSession();
  };

  const handleTouchEvent = (x: number, y: number) => {
    const point = { x, y };
    const newLockState = ScreenLockManager.handleTouch(
      lockState,
      point,
      { width, height }
    );

    if (ScreenLockManager.isUnlockComplete(newLockState)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setLockState(newLockState);
    } else if (newLockState.unlockProgress.length > lockState.unlockProgress.length) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setLockState(newLockState);
    } else if (lockState.isLocked && newLockState.unlockProgress.length === 0 && lockState.unlockProgress.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setLockState(newLockState);
    } else {
      setLockState(newLockState);
    }

    if (!newLockState.isLocked) {
      addTouch(point);
    }
  };

  const tap = Gesture.Tap()
    .onEnd((event) => {
      handleTouchEvent(event.x, event.y);
    });

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      handleTouchEvent(event.x, event.y);
    });

  const composed = Gesture.Race(tap, pan);

  const handleCapture = async () => {
    if (!activeProfile || !gameViewRef.current) return;

    try {
      const uri = await ScreenshotManager.captureScreen(gameViewRef);
      const sessionState = getSessionStats();

      await ScreenshotManager.saveScreenshot(uri, activeProfile.id, {
        catName: activeProfile.name,
        catches: sessionState.touchCount,
        playTime: sessionState.playTime,
        mode: selectedMode,
      });

      Alert.alert('Success', 'Screenshot saved to gallery!');
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert('Error', 'Failed to capture screenshot');
    }
  };

  if (showModeSelector) {
    return (
      <ModeSelector
        currentMode={selectedMode}
        onModeChange={setSelectedMode}
        onClose={() => setShowModeSelector(false)}
      />
    );
  }

  if (!currentTheme) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureDetector gesture={composed}>
      <View ref={gameViewRef} style={styles.container}>
        <SkiaRenderer
          fishShared={fishShared}
          miceShared={miceShared}
          lasersShared={lasersShared}
          insectsShared={insectsShared}
          cockroachesShared={cockroachesShared}
          ladybugsShared={ladybugsShared}
          butterfliesShared={butterfliesShared}
          particlesShared={particlesShared}
          ambientParticlesShared={ambientParticlesShared}
          theme={currentTheme}
          width={width}
          height={height}
        />
        {LOCK_CONFIG.showIndicators && (
          <>
            <LockIndicator lockState={lockState} bounds={{ width, height }} />
            <CornerIndicators lockState={lockState} bounds={{ width, height }} />
          </>
        )}
        {!lockState.isLocked && activeProfile && (
          <>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => setShowProfileSelector(true)}
            >
              {activeProfile.photoUri ? (
                <Image source={{ uri: activeProfile.photoUri }} style={styles.profileIcon} />
              ) : (
                <Text style={styles.profileIcon}>{ImageHandler.getDefaultPlaceholder()}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statsButton}
              onPress={() => setShowStats(true)}
            >
              <Text style={styles.statsIcon}>📊</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={() => setShowGallery(true)}
            >
              <Text style={styles.galleryIcon}>🖼️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.challengeButton}
              onPress={() => setShowChallenges(true)}
            >
              <Text style={styles.challengeIcon}>🎯</Text>
              {incompleteChallenges > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{incompleteChallenges}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.themeButton}
              onPress={() => setShowThemeSelector(true)}
            >
              <Text style={styles.themeIcon}>🎨</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.achievementButton}
              onPress={() => setShowAchievements(true)}
            >
              <Text style={styles.achievementIcon}>🏆</Text>
            </TouchableOpacity>
            <CaptureButton onCapture={handleCapture} />
          </>
        )}
        {newAchievements.length > 0 && (
          <AchievementToastQueue
            achievements={newAchievements}
            onDismiss={(achievement) => {
              setNewAchievements(prev =>
                prev.filter(a => a.id !== achievement.id)
              );
            }}
            onPress={(achievement) => {
              setNewAchievements([]);
              setShowAchievements(true);
            }}
          />
        )}
        {showPauseOverlay && !showSessionComplete && (
          <PauseOverlay onResume={handleResume} />
        )}
        {showSessionComplete && sessionStats && (
          <SessionCompleteScreen
            stats={sessionStats}
            onContinue={handleContinuePlaying}
            onEnd={handleEndSession}
            catName={activeProfile?.name || catName}
          />
        )}
        {showProfileSelector && profileState && (
          <ProfileSelector
            profileState={profileState}
            onSelectProfile={async (profileId) => {
              setShowProfileSelector(false);
            }}
            onUpdateState={(newState) => {
              setProfileState(newState);
            }}
            onClose={() => setShowProfileSelector(false)}
          />
        )}
        {showStats && activeProfile && (
          <StatsDashboard
            profileId={activeProfile.id}
            onClose={() => setShowStats(false)}
          />
        )}
        {showGallery && activeProfile && (
          <GalleryScreen
            profileId={activeProfile.id}
            onClose={() => setShowGallery(false)}
          />
        )}
        {showChallenges && activeProfile && (
          <DailyChallengeScreen
            profileId={activeProfile.id}
            onClose={() => {
              setShowChallenges(false);
              if (activeProfile) {
                const today = StreakTracker.getTodayDate();
                ChallengeManager.getOrCreateChallenges(activeProfile.id, today, 'free').then(
                  challenges => {
                    const incomplete = challenges.filter(c => !c.completed).length;
                    setIncompleteChallenges(incomplete);
                  }
                ).catch(error => {
                  console.error('Failed to refresh challenge status:', error);
                  setIncompleteChallenges(0);
                });
              }
            }}
          />
        )}
        {showAchievements && activeProfile && (
          <AchievementScreen
            profileId={activeProfile.id}
            onClose={() => setShowAchievements(false)}
          />
        )}
        {showThemeSelector && activeProfile && (
          <ThemeSelector
            profileId={activeProfile.id}
            onSelectTheme={async (themeId) => {
              try {
                const theme = await ThemeManager.getCurrentTheme(activeProfile.id);
                setCurrentTheme(theme);

                const particles = ParticleSystem.createAmbientParticles(theme, {
                  width,
                  height,
                });
                ambientParticlesShared.value = particles;

                setShowThemeSelector(false);
              } catch (error) {
                console.error('Failed to apply theme:', error);
                Alert.alert('Error', 'Failed to change theme. Please try again.');
              }
            }}
            onClose={() => setShowThemeSelector(false)}
          />
        )}
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  profileButton: {
    position: 'absolute',
    top: 40,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    fontSize: 24,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  statsButton: {
    position: 'absolute',
    top: 100,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  statsIcon: {
    fontSize: 24,
  },
  galleryButton: {
    position: 'absolute',
    top: 160,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  galleryIcon: {
    fontSize: 24,
  },
  challengeButton: {
    position: 'absolute',
    top: 220,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  challengeIcon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  achievementButton: {
    position: 'absolute',
    top: 280,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  achievementIcon: {
    fontSize: 24,
  },
  themeButton: {
    position: 'absolute',
    top: 340,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  themeIcon: {
    fontSize: 24,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
});
