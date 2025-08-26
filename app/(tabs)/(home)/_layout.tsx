
import { Stack } from 'expo-router';

export default function HomeLayout() {
    return (
        <Stack 
        screenOptions={{ headerStyle: { backgroundColor: '#0a7ea4' }, headerTintColor: '#fff' }}>
            <Stack.Screen name="index"/>
            <Stack.Screen name="details"/>
        </Stack>
    );
}