import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { api } from '../api/client';

export async function registerForPushAndSend() {
  // Expo Go on SDK 53 no longer supports remote push notifications
  // Guard to avoid runtime errors; use a dev client for real push testing
  const isExpoGo = typeof (global as any).Expo === 'object' && !!(global as any).Expo?.Updates;
  if (isExpoGo) {
    return; // silently skip in Expo Go
  }
  let token: string | undefined;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return;
  token = (await Notifications.getExpoPushTokenAsync()).data;
  try { await api.post('/api/notifications/push/register', { token, platform: Platform.OS }); } catch {}
}
