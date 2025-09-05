import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen';
import SearchScreen from './SearchScreen';
import RestaurantDetailScreen from './RestaurantDetailScreen';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeRoot" component={HomeScreen} options={{ title: 'Discover' }} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
      <Stack.Screen name="Restaurant" component={RestaurantDetailScreen} options={{ title: 'Restaurant' }} />
    </Stack.Navigator>
  );
}
