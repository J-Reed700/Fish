import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationServiceClass {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('challenges', {
          name: 'Challenges',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4CAF50',
        });
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  async scheduleDailyReset(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      const trigger: Notifications.NotificationTriggerInput = {
        hour: 9,
        minute: 0,
        repeats: true,
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎯 New Daily Challenges!',
          body: 'Fresh challenges are waiting for you. Start your day with new goals!',
          data: { type: 'daily_reset' },
          sound: true,
        },
        trigger,
      });
    } catch (error) {
      console.error('Failed to schedule daily reset notification:', error);
    }
  }

  async scheduleWeeklyReset(): Promise<void> {
    try {
      const trigger: Notifications.NotificationTriggerInput = {
        weekday: 2,
        hour: 9,
        minute: 0,
        repeats: true,
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏆 New Weekly Challenges!',
          body: 'A new week of exciting challenges has begun. Jump in now!',
          data: { type: 'weekly_reset' },
          sound: true,
        },
        trigger,
      });
    } catch (error) {
      console.error('Failed to schedule weekly reset notification:', error);
    }
  }

  async scheduleChallengeExpiring(challengeId: string, title: string, expiresIn: number): Promise<void> {
    try {
      if (expiresIn <= 3600000) {
        const trigger: Notifications.NotificationTriggerInput = {
          seconds: Math.max(expiresIn / 1000 - 3600, 60),
        };

        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⏰ Challenge Expiring Soon!',
            body: `"${title}" expires in 1 hour. Complete it before it's too late!`,
            data: { type: 'challenge_expiring', challengeId },
            sound: true,
          },
          trigger,
        });
      }
    } catch (error) {
      console.error('Failed to schedule expiring notification:', error);
    }
  }

  async notifyChallengeCompleted(title: string, rewardText: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✅ Challenge Completed!',
          body: `You completed "${title}"! Tap to claim your reward: ${rewardText}`,
          data: { type: 'challenge_completed' },
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Failed to send completion notification:', error);
    }
  }

  async notifyCommunityGoalReached(title: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Community Goal Reached!',
          body: `The community completed "${title}"! Claim your reward now!`,
          data: { type: 'community_goal_completed' },
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Failed to send community goal notification:', error);
    }
  }

  async notifyLevelUp(newLevel: number, title: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎊 Level Up!',
          body: `Congratulations! You reached Level ${newLevel}: ${title}`,
          data: { type: 'level_up', level: newLevel },
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Failed to send level up notification:', error);
    }
  }

  async notifySpecialEvent(eventTitle: string, eventDescription: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🎁 ${eventTitle}`,
          body: eventDescription,
          data: { type: 'special_event' },
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Failed to send special event notification:', error);
    }
  }

  async cancelChallengeNotifications(challengeId: string): Promise<void> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const toCancel = scheduled.filter(
        (n) => n.content.data?.challengeId === challengeId
      );

      for (const notification of toCancel) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      console.error('Failed to cancel challenge notifications:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  addNotificationListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  addResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

export const NotificationService = new NotificationServiceClass();
