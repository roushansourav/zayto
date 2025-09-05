import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from './ProfileScreen';
import FavoritesScreen from './FavoritesScreen';
import BalanceScreen from './balance/BalanceScreen';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="Balance" component={BalanceScreen} />
    </Stack.Navigator>
  );
}


