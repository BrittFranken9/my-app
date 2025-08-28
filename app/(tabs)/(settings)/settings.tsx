import { View, SafeAreaView, StyleSheet, TextInput, Button, ActivityIndicator, Text } from 'react-native';
import useUserGet from '@/data/user-get';
import useUserPut from '@/data/user-put';
import { ThemedText } from '@/components/ThemedText';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    (async () => setUserId(await AsyncStorage.getItem('userId')))();
  }, []);

  const { data, isLoading, isError } = useUserGet(userId);
  const { trigger, isMutating } = useUserPut(userId);

  useEffect(() => {
    if (data?.username) setUsername(data.username);
  }, [data?.username]);

  if (userId === null) {
    return screen(<><ActivityIndicator /><ThemedText>Gebruiker laden…</ThemedText></>);
  }
  if (isError) {
    return screen(<>
      <ThemedText>Kon je profiel niet laden.</ThemedText>
      <Text>Controleer je login of de server.</Text>
    </>);
  }
  if (isLoading) {
    return screen(<><ActivityIndicator /><ThemedText>Loading…</ThemedText></>);
  }

  return screen(
    <>
      <ThemedText>Profiel</ThemedText>
      <TextInput value={username} onChangeText={setUsername} placeholder="Gebruikersnaam"
        style={{ borderWidth: 1, borderRadius: 8, padding: 8, width: 280 }} />
      <Button title={isMutating ? 'Opslaan…' : 'Opslaan'} onPress={() => trigger({ username })} disabled={isMutating} />
    </>
  );
}

const screen = (children: React.ReactNode) => (
  <SafeAreaView style={styles.safeArea}><View style={styles.container}>{children}</View></SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
});
