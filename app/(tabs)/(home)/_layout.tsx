
import { Stack } from 'expo-router';

export default function HomeLayout() {
    return (
        <Stack 
        screenOptions={{ headerStyle: { backgroundColor: '#0B1220' }, headerTintColor: '#fff' }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="details" options={{ headerShown: false }} />
        </Stack>
    );
}