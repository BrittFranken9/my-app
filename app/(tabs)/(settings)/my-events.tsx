import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/lib/api';
import { useRouter, useNavigation } from 'expo-router';

type MyEvent = {
  _id: string;
  title: string;
  date?: string;
  imageUrl?: string;
};

export default function MyEvents() {
  const router = useRouter();
  const navigation = useNavigation<any>();

  const [userId, setUserId] = useState<string>('');
  const [items, setItems] = useState<MyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('userId');
      if (!raw) return setLoading(false);
      try {
        const parsed = JSON.parse(raw);
        setUserId(parsed?.id ?? parsed?._id ?? String(parsed) ?? '');
      } catch {
        setUserId(raw);
      }
    })();
  }, []);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);

      // Prefer an explicit owner filter to fetch events I created
      const data = await api.get<any>(`/events?ownerId=${encodeURIComponent(userId)}`, undefined, 25000, 1);
      const arr: any[] = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []);

      const list: MyEvent[] = arr.map((e: any) => ({
        _id: e._id ?? e.id,
        title: e.title ?? e.name ?? e.teaser ?? 'Zonder titel',
        date: e.date ?? e.startDate ?? e.createdAt,
        imageUrl: e.imageUrl ?? e.cover ?? e.banner,
      })).filter((e: any) => e._id);

      setItems(list);
    } catch (err: any) {
      setError(err?.message || 'Onbekende fout');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 🔁 Refetch on focus (no useFocusEffect)
  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  // Initial load
  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Even geduld…</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.title}>Er ging iets mis</Text>
          <Text style={styles.muted}>{error}</Text>
          <TouchableOpacity style={styles.btn} onPress={load}>
            <Text style={styles.btnLabel}>Opnieuw proberen</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ padding: 16 }}>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/event-new')}>
          <Text style={styles.btnLabel}>Nieuw event toevoegen</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        contentContainerStyle={{ padding: 12 }}
        data={items}
        keyExtractor={(it) => it._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/event-edit/[id]', params: { id: item._id } })}
          >
            <View style={styles.row}>
              <Image source={{ uri: item.imageUrl ?? 'https://via.placeholder.com/160x160?text=Event' }} style={styles.thumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                {!!item.date && <Text style={styles.cardMeta}>{new Date(item.date).toLocaleString('nl-BE')}</Text>}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  muted: { marginTop: 6, color: '#666' },

  btn: { backgroundColor: '#111827', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16 },
  btnLabel: { color: '#fff', fontWeight: '700' },

  card: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  row: { flexDirection: 'row', gap: 12 },
  thumb: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#eee' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardMeta: { marginTop: 4, color: '#666' },
});
