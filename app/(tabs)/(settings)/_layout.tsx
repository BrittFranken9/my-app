import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
      <Stack.Screen name="profile" options={{ title: 'Profiel' }} />
      <Stack.Screen name="my-events" options={{ title: 'Mijn events' }} />
      <Stack.Screen name="event-new" options={{ title: 'Nieuw event' }} />
      <Stack.Screen name="event-edit/[id]" options={{ title: 'Event bewerken' }} />
    </Stack>
  );
}
