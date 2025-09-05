import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import HomeStack from '../screens/home/HomeStack';
import CartScreen from '../screens/cart/CartScreen';
import OrdersStack from '../screens/orders/OrdersStack';
import ProfileStack from '../screens/profile/ProfileStack';
import { useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import * as SecureStore from 'expo-secure-store';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function AppTabs() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Home" component={HomeStack} options={{ headerShown: false }} />
      <Tabs.Screen name="Orders" component={OrdersStack} options={{ headerShown: false }} />
      <Tabs.Screen name="Cart" component={CartScreen} />
      <Tabs.Screen name="Profile" component={ProfileStack} options={{ headerShown: false }} />
    </Tabs.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
      <Stack.Screen name="Otp" component={OtpScreen} options={{ title: 'Phone' }} />
    </Stack.Navigator>
  );
}

export default function RootNavigation() {
  const { auth } = useAuth();
  const isAuthed = Boolean(auth.token);
  const [onboardingDone, setOnboardingDone] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    (async () => {
      const v = await SecureStore.getItemAsync('onboarding_done');
      setOnboardingDone(v === '1');
    })();
  }, []);

  const routeName = isAuthed ? 'App' : (onboardingDone === false ? 'Onboarding' : 'Auth');

  return (
    <NavigationContainer>
      <FavoritesProvider>
        <CartProvider>
          <Stack.Navigator
            key={`root-${isAuthed}-${onboardingDone}`}
            screenOptions={{ headerShown: false }}
            initialRouteName={routeName}
          >
            <Stack.Screen name="App" component={AppTabs} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Auth" component={AuthStack} />
          </Stack.Navigator>
        </CartProvider>
      </FavoritesProvider>
    </NavigationContainer>
  );
}
