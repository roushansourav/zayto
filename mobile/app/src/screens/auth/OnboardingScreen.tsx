import React from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');

const slides = [
  { key: 's1', title: 'Discover', subtitle: 'Find great food nearby' },
  { key: 's2', title: 'Order', subtitle: 'Build your perfect meal' },
  { key: 's3', title: 'Track', subtitle: 'Live status and fast pickup' },
];

type Props = { navigation: any };

export default function OnboardingScreen({ navigation }: Props) {
  const theme = useTheme();
  const scrollRef = React.useRef<ScrollView>(null);
  const [index, setIndex] = React.useState(0);

  const onView = React.useCallback((e: any) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(i);
  }, []);

  const goNext = React.useCallback(() => {
    if (index < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
    } else {
      complete();
    }
  }, [index]);

  const complete = React.useCallback(async () => {
    await SecureStore.setItemAsync('onboarding_done', '1');
    navigation.replace('Auth');
  }, [navigation]);

  const skip = React.useCallback(() => complete(), [complete]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onView}
        scrollEventThrottle={16}
      >
        {slides.map((s) => (
          <View key={s.key} style={{ width, padding: 24, justifyContent: 'center', alignItems: 'center' }}>
            <Text variant="headlineLarge" style={{ marginBottom: 8 }}>{s.title}</Text>
            <Text variant="bodyLarge" style={{ opacity: 0.7 }}>{s.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={{ alignItems: 'center', marginVertical: 16, flexDirection: 'row', justifyContent: 'center' }}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              marginHorizontal: 6,
              backgroundColor: i === index ? theme.colors.primary : theme.colors.surfaceVariant,
            }}
          />
        ))}
      </View>

      <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button mode="text" onPress={skip}>Skip</Button>
        <Button mode="contained" onPress={goNext}>{index < slides.length - 1 ? 'Next' : 'Done'}</Button>
      </View>
    </View>
  );
}


