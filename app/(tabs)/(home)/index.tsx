import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import React from 'react';

// 👇 Pak je API-url uit .env of zet fallback
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  'https://my-express-app-nawn.onrender.com';

type Message = { _id: string; text: string };

export default function HomeScreen() {
  const [items, setItems] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BASE_URL}/messages`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ThemedText type="title">Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ThemedText type="title">Er ging iets mis</ThemedText>
          <ThemedText>{error}</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText type="title">Home</ThemedText>
        <Link href="/details" style={{ marginTop: 12 }}>
          <ThemedText>Ga naar Details</ThemedText>
        </Link>

        {items.length === 0 ? (
          <ThemedText style={{ marginTop: 12 }}>Geen berichten</ThemedText>
        ) : (
          items.map((message) => (
            <ThemedText key={message._id} style={{ marginTop: 8 }}>
              {message.text}
            </ThemedText>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: {
    padding: 16,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});
