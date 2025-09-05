import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

function inferBase() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL as string;
  if (Platform.OS === 'android') return 'http://10.0.2.2:8080'; // Android emulator
  return 'http://127.0.0.1:8080'; // iOS simulator
}

const API_BASE = inferBase();

export const api = axios.create({ baseURL: API_BASE, timeout: 15000 });

api.defaults.headers.post['Content-Type'] = 'application/json';

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('zayto_token');
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export async function saveToken(token: string | null) {
  if (token) await SecureStore.setItemAsync('zayto_token', token);
  else await SecureStore.deleteItemAsync('zayto_token');
}
