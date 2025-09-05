import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import * as SecureStore from 'expo-secure-store';

import en from './locales/en.json';
import ar from './locales/ar.json';

const i18n = new I18n({ en, ar });
// SDK 53: Localization.locale may be undefined during runtime init. Use getLocales() safely.
const locales = typeof (Localization as any).getLocales === 'function' ? (Localization as any).getLocales() : [];
const deviceTag = (locales && locales[0] && (locales[0].languageTag || locales[0].locale)) || 'en';
const initialLocale = (typeof deviceTag === 'string' && deviceTag.startsWith('ar')) ? 'ar' : 'en';

i18n.locale = initialLocale;
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n;

export async function setLocale(lang: 'en' | 'ar') {
  i18n.locale = lang;
  try { await SecureStore.setItemAsync('lang', lang); } catch {}
}

export async function initLocale() {
  try {
    const saved = await SecureStore.getItemAsync('lang');
    if (saved === 'en' || saved === 'ar') {
      i18n.locale = saved;
    }
  } catch {}
}


