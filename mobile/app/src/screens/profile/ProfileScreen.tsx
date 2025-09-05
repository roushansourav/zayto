import React from 'react';
import { View } from 'react-native';
import { Text, List, Switch, Divider, Button, RadioButton } from 'react-native-paper';
import * as Localization from 'expo-localization';
import { useAuth } from '../../context/AuthContext';
import i18n, { setLocale } from '../../i18n';

export default function ProfileScreen({ navigation }: any) {
  const { auth, logout } = useAuth();
  const [dark, setDark] = React.useState(false);
  const [rtl] = React.useState(Localization.isRTL);
  const [lang, setLang] = React.useState(i18n.locale.startsWith('ar') ? 'ar' : 'en');

  const changeLang = async (v: string) => {
    const l = v === 'ar' ? 'ar' : 'en';
    setLang(l);
    await setLocale(l as any);
  };

  return (
    <View style={{ padding: 16 }}>
      <Text variant="titleLarge">{auth.email || 'Guest'}</Text>
      <Divider style={{ marginVertical: 12 }} />

      <List.Section>
        <List.Subheader>Preferences</List.Subheader>
        <List.Item title="Dark Mode" right={() => <Switch value={dark} onValueChange={setDark} />} />
        <List.Item title="RTL" description="Auto based on locale" right={() => <Switch value={rtl} disabled />} />
      </List.Section>

      <Divider style={{ marginVertical: 12 }} />

      <List.Section>
        <List.Subheader>Language</List.Subheader>
        <RadioButton.Group onValueChange={changeLang} value={lang}>
          <RadioButton.Item label="English" value="en" />
          <RadioButton.Item label="Arabic" value="ar" />
        </RadioButton.Group>
      </List.Section>

      <Divider style={{ marginVertical: 12 }} />

      <List.Section>
        <List.Subheader>Account</List.Subheader>
        <List.Item title="Favorites" onPress={() => navigation.navigate('Favorites')} />
        <List.Item title="Balance" onPress={() => navigation.navigate('Balance')} />
      </List.Section>

      <Divider style={{ marginVertical: 12 }} />
      <Button mode="outlined" onPress={logout}>Logout</Button>
    </View>
  );
}


