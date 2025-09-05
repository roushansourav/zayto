import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OrdersScreen from './OrdersScreen';
import TrackingScreen from './TrackingScreen';

const Stack = createNativeStackNavigator();

export default function OrdersStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="OrdersRoot" component={OrdersScreen} options={{ title: 'My Orders' }} />
      <Stack.Screen name="Tracking" component={TrackingScreen} options={{ title: 'Tracking' }} />
    </Stack.Navigator>
  );
}
