import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/lib/api'; // ⬅️ use same client as EventActions

type EventItem = {
  _id: string;
  title: string;
  date?: string;
  imageUrl?: string;
  likesCount?: number;
  goingCount?: number;
};

export default function ArchiefGoing() {
  const router = useRouter();
  const navigation = useNavigation<any>();

  const { userId: userIdParam } = useLocalSearchParams() as { userId?: string };
  const [userId, setUserId] = useState<string>('');

  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    (async () => {
      let id = userIdParam;
      if (!id) {
        const raw = await AsyncStorage.getItem('userId');
        if (raw) {
          try { const parsed = JSON.parse(raw); id = parsed?.id ?? parsed?._id ?? String(parsed) ?? ''; }
          catch { id = raw; }
        }
      }
      setUserId((id || '').trim());
    })();
  }, [userIdParam]);

  const load = useCallback(async () => {
    const uid = (userId || '').trim();
    if (!uid) return;

    try {
      setLoading(true);
      setErr('');

      // ⬇️ same API client as like/going toggles
      const data: any = await api.get(
        `/events/mine/list?userId=${encodeURIComponent(uid)}&status=going&page=1&limit=100`,
        undefined,
        25000,
        1
      );

      const arr = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      const normalized = arr.map((e: any) => ({
        _id: e._id ?? e.id,
        title: e.title ?? e.name ?? e.teaser ?? 'Zonder titel',
        date: e.date ?? e.startDate ?? e.createdAt,
        imageUrl: e.imageUrl ?? e.cover ?? e.banner,
        likesCount: e.likesCount ?? e.likes ?? 0,
        goingCount: e.goingCount ?? e.going ?? 0,
      })).filter((e: any) => e._id);

      setItems(normalized);
    } catch (error: any) {
      setErr(error?.message || 'Onbekende fout');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  // 🔁 Refetch on focus (no useFocusEffect)
  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  // Initial fetch
  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

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
  if (err) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.title}>Er ging iets mis</Text>
          <Text style={styles.muted}>{err}</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (!items.length) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.title}>Geen “Ik ga”-events</Text>
          <Text style={styles.muted}>Markeer een event als “Ik ga” om het hier te zien.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={{ padding: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        data={items}
        keyExtractor={(it) => it._id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push({ pathname: '/(tabs)/(home)/details', params: { eventId: item._id, userId } })}
          >
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Image source={{ uri: item.imageUrl ?? 'https://via.placeholder.com/160x160?text=Event' }} style={styles.thumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                {!!item.date && <Text style={styles.cardMeta}>{new Date(item.date).toLocaleString('nl-BE')}</Text>}
                <Text style={styles.cardCounts}>❤️ {item.likesCount ?? 0}   •   ✅ {item.goingCount ?? 0}</Text>
              </View>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 18, fontWeight: '800', color: '#e5e7eb' },
  muted: { marginTop: 6, color: '#9ca3af', textAlign: 'center' },

  card: {
    padding: 12,
    backgroundColor: '#111827',
    borderRadius: 14,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  thumb: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#374151' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#f9fafb' },
  cardMeta: { marginTop: 4, color: '#cbd5e1' },
  cardCounts: { marginTop: 6, fontWeight: '700', color: '#d1d5db' },
});
