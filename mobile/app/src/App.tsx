import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import RootNavigation from './navigation';
import { lightTheme } from './theme/paperTheme';
import { AuthProvider } from './context/AuthContext';
import i18n from './i18n';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';

export default function App() {
  React.useEffect(() => {
    // SDK 53: prefer getLocales()[0].textDirection if available
    const locales: any[] = typeof (Localization as any).getLocales === 'function' ? (Localization as any).getLocales() : [];
    const first = locales && locales[0];
    const isRTL = first && (first as any).textDirection ? ((first as any).textDirection === 'rtl') : (Localization as any).isRTL;
    if (typeof isRTL === 'boolean' && I18nManager.isRTL !== isRTL) {
      try { I18nManager.allowRTL(isRTL); } catch {}
      try { I18nManager.forceRTL(isRTL); } catch {}
      // a reload is recommended when toggling RTL; we skip auto-reload here
    }
  }, []);

  return (
    <PaperProvider theme={lightTheme}>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigation />
      </AuthProvider>
    </PaperProvider>
  );
}
