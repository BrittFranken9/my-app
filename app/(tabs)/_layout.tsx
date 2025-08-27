import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export default function Layout() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const user = await AsyncStorage.getItem('userId');
        if (user) {
          const parsed = JSON.parse(user);
          setUserId(parsed?.id ?? null);
        } else {
          setUserId(null);
        }
      } catch {
        setUserId(null);
      }
    };
    getUserId();
  }, []);

  if (!userId) return null;

  return (
    <Tabs>
      <Tabs.Screen
        name="(home)"
        initialParams={{ userId }}
        options={{
          headerShown: false,
          title: 'Home',
          tabBarIcon: ({ color, size }) => <FontAwesome name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="archief-liked"
        initialParams={{ userId }}
        options={{
          title: 'Liked',
          tabBarIcon: ({ color, size }) => <FontAwesome name="heart" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="archief-going"
        initialParams={{ userId }}
        options={{
          title: 'Going',
          tabBarIcon: ({ color, size }) => <FontAwesome name="check" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        initialParams={{ userId }}
        options={{ headerShown: false, title: 'Settings' }}
      />
    </Tabs>
  );
}
