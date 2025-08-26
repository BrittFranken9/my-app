
import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <Stack 
        screenOptions={{ headerStyle: { backgroundColor: '#0a7ea4' }, headerTintColor: '#fff' }}>
            <Stack.Screen name="index"/>
            <Stack.Screen name="details" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
    );
}